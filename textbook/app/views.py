
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render
from rest_framework.views import APIView
from .models import imageModel, imageComment, individualMsgComment, Message, brainstormNote, userLogTable, tableChartData, \
    userQuesAnswerTable, groupInfo, userLogTable, badgeReceived, studentCharacteristicModel, badgeInfo, KAPostModel,\
    participationHistory, whiteboardInfoTable, khanAcademyInfoTable, studentPersonalityChangeTable, computationalModelLog, khanAcademyAnswer, \
    studentInfo, supportOffered
from django.contrib.auth import authenticate
from django.http.response import JsonResponse
from django.contrib.auth import login as auth_login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Count
from django.core import serializers
from .parser import parser
from .randomGroupGenerator import randomGroupGenerator
from .infoFileRead import infoFileRead
from .utteranceClassifier import utteranceClassifier
from .binaryLogisticModel import binaryLogisticModel
import json, random
from datetime import datetime, timedelta
from collections import Counter
from django.core.exceptions import ObjectDoesNotExist
from django.forms.models import model_to_dict



# activity feed code -- start
from pusher import Pusher
from django.views.decorators.csrf import csrf_exempt

# instantiate the pusher class - this is used for activity feed message
pusher = Pusher(app_id=u'525110', key=u'ea517de8755ddb1edd03', secret=u'be2bf8ae15037bde9d94', cluster=u'us2')

# instantiate the pusher class - this is used for individual image message
pusher1 = Pusher(app_id=u'525110', key=u'f6bea936b66e4ad47f97', secret=u'ed3e9509fce91430fcac', cluster=u'us2')

# instantiate the pusher class - this is used for brainstorm note
pusher2 = Pusher(app_id=u'525110', key=u'5da367936aa67ecdf673', secret=u'e43f21c19211c9738d6b', cluster=u'us2')

@csrf_exempt
def broadcast(request):

    #get the current users' whiteboard group
    current_user_id, group_member_list, group_member_name = getWhiteboardGroupMember(request, request.POST['activity_id']);

    pusher.trigger(u'a_channel', u'an_event', {u'name': request.POST['username'],
                                               u'message': request.POST['message'],
                                               u'activity_id': request.POST['activity_id']})

    #insert into database
    msg = Message(content=request.POST['message'], posted_by=request.user, activity_id = request.POST['activity_id'],
                  group_id = current_user_id);
    msg.save();

    return JsonResponse({'success': ''})

# activity feed code -- end


@csrf_exempt
def broadcastImageComment(request):


    pusher1.trigger(u'b_channel', u'bn_event', {u'name': request.POST['username'], u'message': request.POST['message'],
                                                u'imageid': request.POST['imagePk'], u'activityID': request.POST['activityID']})

    #get the image id
    img = imageModel.objects.get(id=request.POST['imagePk'])
    #error: id is not instance of the model
    #solution: https://www.slideshare.net/BaabtraMentoringPartner/how-to-fix-must-be-an-instance-when-a-foreign-key-is-referred-django-python-mysql
    comment = imageComment(content=request.POST['message'], posted_by = request.user, imageId = img, activityID=request.POST['activityID'])
    comment.save()

    #pass through dialogtag to get the tag
    rewardType, praiseText = utteranceClassifier.classifierMethod(None, request.POST['message']);

    #save the badge info as history
    saveBadgeHistory(request.user, "MB", request.POST['activityID'], request.POST['message'], rewardType)


    # # #save into the history table once
    # if participationHistory.objects.filter(platform="MB", activity_id=request.POST['activityID'], posted_by=request.user).exists():
    #     #do nothing
    #     print();
    # else:
    #     entry = participationHistory(platform="MB", activity_id=request.POST['activityID'],didParticipate='yes',posted_by=request.user);
    #     entry.save()

    return JsonResponse({'rewardType': rewardType, 'praiseText': praiseText}) #goes to gallery.js

#called from teachable agent
def getBadges(request):
    if request.method == 'POST':
        username = request.POST.get('username');
        platform = request.POST.get('platform');
        message = request.POST['message']
        activity_id = request.POST.get('activity_id');

        # pass through dialogtag to get the tag
        rewardType, praiseText = utteranceClassifier.classifierMethod(None, message);

        # save the badge info as history
        # TODO add condition: if rewardType not null, then save badge history, if null, check the second condition
        saveBadgeHistory(User.objects.get(username=username), platform, activity_id, message, rewardType)

        return JsonResponse({'rewardType': rewardType,
                             'promptSO': praiseText})


#in the browser: http://127.0.0.1:8000/app/
@login_required
def index(request):
    if request.user.is_authenticated:
        return render(request, 'app/index.html')
        #if teacher then open up teacher portal, else student portal
        # if request.user.get_username() == 'AW':
        #     return render(request, 'app/teacherindex.html')
        # else: return render(request, 'app/index.html')

def login_form(request):
    return render(request, 'app/login.html',{})

def login(request):
    if request.method == 'POST':
        # Gather the username and password provided by the user.
        # This information is obtained from the login form.
        # We use request.POST.get('<variable>') as opposed to request.POST['<variable>'],
        # because the request.POST.get('<variable>') returns None, if the value does not exist,
        # while the request.POST['<variable>'] will raise key error exception
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Use Django's machinery to attempt to see if the username/password
        # combination is valid - a User object is returned if it is.
        # user is created using the createsuperuser command
        user = authenticate(username=username, password=password)
        print('user :: ', user)

        if user:
            auth_login(request, user)
            #add to user log table
            userLog = userLogTable(username = request.user, action="user click login button", type="login", input=request.POST.get('username'), pagenumber=0000)
            userLog.save();

            # member = groupInfo(activityType='gallery', activityID=1, group=0, users=request.user)
            # member.save();

            return HttpResponseRedirect('/index/')
        else:
            #return invalid login message
            print("entered wrong username"); #TODO: enter into user log database
            return render(request, 'app/login.html', {'errorMsg': "Invalid Username/Password"});
    else:
        return render(request, 'app/login.html', {})

def saveCharacteristic(request):
    # TODO update from the front-end
    # todo; write a code for the file read
    # loop through all the user and set some values
    # note: added has_social true for badge update consistency (more into computional model method). while
    # the other four variables value will come from the survey, has_social will always be true.
    for o in User.objects.all():
        student_char = studentCharacteristicModel(user=o, has_msc=False,
                                                  has_hsc=False, has_fam=False, has_con=False, has_social=True);
        student_char.save();


    return HttpResponse('');

# returns students characteristic from the student characterisitc model
# called from utility.js and will save it into local storage
def getCharacteristic(request, username):

    #determine the condition of the current user, and get the info from two different tables.
    # 1-dynamic, #2-static
    whichCondition = getCondition(request, username);
    print("def getCharacteristic student condition:: ", whichCondition);

    dict = {}

    if whichCondition == 1:
        print('line 177 student belongs to dynamic condition');

        #if the student changed or not
        if studentPersonalityChangeTable.objects.filter(posted_by_id=User.objects.get(username=username), event='changed html inputs').exists():
            print('modified characteristic')
            info = studentPersonalityChangeTable.objects.filter(posted_by_id=User.objects.get(username=username), event='changed html inputs').values('id','char_msc','char_hsc','char_fam', 'char_con','char_name').order_by('-id');

            current_user_profile = wordToBinaryConvertor(info);

            print('line 185 :: ', current_user_profile)

            dict['msc'] = current_user_profile[0];
            dict['hsc'] = current_user_profile[1];
            dict['fam'] = current_user_profile[2];
            dict['con'] = current_user_profile[3];
            dict['social'] = 1;

        else:
            print('did not change characteristic yet')
            info = studentCharacteristicModel.objects.get(user=User.objects.get(username=username));
            info = info.__dict__;  # returns a dict

            dict['msc'] = info['has_msc'];
            dict['hsc'] = info['has_hsc'];
            dict['fam'] = info['has_fam'];
            dict['con'] = info['has_con'];
            dict['social'] = info['has_social'];
    else:
        print('student belongs to static condition');

        info = studentCharacteristicModel.objects.get(user=User.objects.get(username=username));
        info = info.__dict__; #returns a dict

        dict['msc'] = info['has_msc'];
        dict['hsc'] = info['has_hsc'];
        dict['fam'] = info['has_fam'];
        dict['con'] = info['has_con'];
        dict['social'] = info['has_social'];


    return dict;


def uploadImage(request):
    #get image from html and save it in the database
    if request.method == "POST":
        # print (request.Files) #gives the name of the <input type='file' name...>

        #get the gallery ID
        gallery_id = request.POST.get('act-id')
        print('gallery_id :: ', gallery_id);

        #made a query here to get the student group ID
        group_id = getGroupID(request, gallery_id);
        print('group_id :: ', group_id);

        # print(type(request.FILES['gallery_img'].name))
        # django.core.files.uploadedfile.InMemoryUploadedFile

        #get the logged in username
        username = ''
        if request.user.is_authenticated:
            print('username :: ', request.user.get_username());
            username = request.user.get_username();
        else:
            print('user not signed in') #add in log


        #insert values in the database
        img = imageModel(gallery_id=gallery_id, group_id = group_id , posted_by = request.user, image=request.FILES['gallery_img']);
        img.save()

        # using data NOT from database
        # data = {}
        # data['gallery_id'] = gallery_id
        # data['posted_by'] = username
        # # data['posted_at'] = "{}".format(images.posted_at)
        # data['url'] = 'images/'+request.FILES['gallery_img'].name
        # image_data = json.dumps(data)

        #get the latest inserted entry from the database for this particular group
        #https://stackoverflow.com/questions/2191010/get-last-record-in-a-queryset/21247350
        images = imageModel.objects.filter(posted_by=request.user, gallery_id=gallery_id).last()

        print('image url :: ',images.image.url)

        print('user ::', images.posted_by.get_username())

        # using data from database
        data = {}
        data['image_id'] = images.pk
        data['gallery_id'] = images.gallery_id
        data['group_id'] = images.group_id
        data['posted_by'] = images.posted_by.get_username()
        data['posted_at'] = "{}".format(images.posted_at)
        data['url'] = images.image.url
        image_data = json.dumps(data)

        # print(image_data)
        #real time pic transfer
        # pusher1.trigger(u'b_channel', u'bn_event',
        #                 { u'new_image':image_data})

        return JsonResponse({'success': image_data})

# call from individual_gallery.js
def getIndividualImages(request, act_id):
    print('debug purpose, def getIndividualImages, gallery id, ', act_id);
    #get the group members of the current users
    member_list = getGroupMembers(request, act_id);
    print("getIndividualImages member id list :: ", member_list);
    #retrieve the LAST image uploaded from Image Model for each user in member_list

    image_list = [];
    for user_id in member_list:
        #get the LAST image uploaded by the user_id
        images = imageModel.objects.filter(posted_by_id = user_id, gallery_id=act_id).last();
        dict = {};
        if images:
            dict['posted_by'] = images.posted_by.get_username();
            dict['image_id'] = images.pk;
            dict['url'] = images.image.url;
            image_list.append(dict);

    #print('get individual images :: ', image_list);

    return JsonResponse({'imageData': json.dumps(image_list)});
    #return HttpResponse('');

def saveIndividualCommentMsgs(request):
    #insert into the model
    comment = individualMsgComment(activityID=request.POST.get('activityID'), imageId_id=request.POST.get('imagePK'), content=request.POST.get('message'),
                                   posted_by=request.user);
    comment.save();

    return HttpResponse('');

# input: image id
# output: get comments for the current user for a given image id
def getIndividualCommentMsgs(request,imageId):
    imageCommments = individualMsgComment.objects.filter(imageId=imageId, posted_by=request.user);
    imageCommments = serializers.serialize('json', imageCommments, use_natural_foreign_keys=True);
    return JsonResponse({'imageCommments': imageCommments});

# used in gallery.js
# display a random image outside the group
def getGalleryImage(request, act_id):

    print('debug purpose, def updateImage, gallery id:: ', act_id);
    # first get group id of the current user
    member_id = getGroupID(request, act_id);
    print('current user member of group :: ', member_id)

    dict_group = {
        1: 2, 2: 1, 3:2, 4:3, 5:4, 6:3, 7:2, 8:4, 9:3, 10: 4
    }

    print('image to be shown from group :: ', dict_group[member_id])
    member_list = getGroupMembersID(request, dict_group[member_id], act_id)
    print('member list of that group', member_list)

    #get all the image id by the member list
    member_image_id_query= imageModel.objects.filter(posted_by__in=member_list, gallery_id=act_id).values('id');
    member_image_id_list = [item['id'] for item in member_image_id_query];
    print('line 345 current user member image Id list:: ', member_image_id_list);

    if(len(member_image_id_list) == 0):
        print('debug purpose, def updateImage, image list is empty as no image is uploaded in this activity yet');
        return HttpResponse('');
    else:
        #the list is not empty
        #outside_group_image_id = random.choice(outside_group_image); #not sending random as then participants from the same group also sees different image
        imageToBeReturned_id = member_image_id_list[-1];
        print('debug purpose, def getGalleryImage,  outside_group_image_id :: ', imageToBeReturned_id);

        images = imageModel.objects.filter(id=imageToBeReturned_id).values('image');
        if images:
            dict = {}
            dict['imagePk'] = imageToBeReturned_id;
            dict['url'] = images[0]['image'];

            return JsonResponse({'imageData': dict});
        else:
            return HttpResponse('');

# used in gallery.js
def updateImageFeed(request):


    act_id = request.GET['act_id'] #gallery id
    img_id = request.GET['img_id'] #img_id

    print('debug purpose, def getGalupdateImageFeedleryImage, image id, :: ' + img_id + ' in activity id :: ', act_id);

    # get the current users' group-member name
    group_member_id = getGroupMembers(request, act_id);

    # get all the comments in the given image id
    # filter out the comments made my the users' group-member
    #however, if there is no image uploaded yet for the gallery, then img_id will be null
    img_msg = ''
    if img_id:
        img_msg = imageComment.objects.filter(imageId_id=img_id, posted_by__in = group_member_id);
        img_msg = serializers.serialize('json', img_msg, use_natural_foreign_keys=True, use_natural_primary_keys=True);

    group_member_name = []
    for i in group_member_id:
        group_member_name.append(User.objects.get(id=i).username);

    #print(group_member_name)

    return JsonResponse({'success': img_msg, 'username': request.user.get_username(), 'group_member': group_member_name});

def getSelfGalleryContent(request, act_id):
    # get the users' uploaded image for the given gallery
    print('debug purpose, def getSelfGalleryContent, gallery id, ', act_id);
    #img_data = imageModel.objects.filter(gallery_id=act_id, posted_by_id=request.user); #returns a queryset
    # todo: what if the filter returns multiple image i.e., user uploaded more than one image
    img_data = list(imageModel.objects.filter(gallery_id=act_id, posted_by_id=request.user).values('id','image').order_by('-id'));
    print('line 252 ::', img_data);
    # print('line 251:', type(img_data)); #type -- list
    # print('line 252:', type(json.dumps(list(img_data)))); #type -- str

    dict = {};
    if img_data: #there is at least an image uploaded by the user (could be more than one, but selecting the first here, TODO)
        img_msg = list(individualMsgComment.objects.filter(imageId_id=img_data[0]['id']).values('content', 'posted_by__username', 'posted_at'));
        # img_msg = [dict(item) for item in img_msg]
        # print('line 258 ::', img_msg);
        #converting the time into a readable format
        for i in img_msg:
            i['posted_at'] = i['posted_at'].strftime("%Y-%m-%d %H:%M:%S");
            #print (i);
        dict['img_data'] = img_data;
        dict['img_msg'] = img_msg;

    return JsonResponse({'success': dict});

# used in the badgeCard, get the badge names and count
def getBadgeNames(request):
    badgeType_dict = {
        'hg': ['Question', 'Elaboration', 'Summarization'],
        'trans': ['Feedback', 'Reflection', 'AddOn'],
        'part': ['Brainstorm','Social', 'Appreciate']
    }
    badgeDesc_dict = {
        'hg': ['Ask clarification questions to understand the concept.', 'Explain your thought process with reasoning.', 'Combine multiple ideas together, and explain them in your words.'],
        'trans': ['Provide ideas for improvement.', 'Share your thoughts on the existing conversation.', 'Add additional information in the conversation.'],
        'part': ['Think about a way to solve a problem.', 'Think about a way to solve a problem.', 'Appreciate others effort during the collaboration.']
    }

    if request.method == 'POST':
        badgeType = request.POST.get('badgeType');
        #print('422 :: ', badgeType)


        badgeCountList = [];
        for badge in badgeType_dict[badgeType]:
            dict = {}
            dict['badgeName'] = badge;
            #print('line 440 :: ', dict['badgeName']);
            platform = ['MB', 'KA', 'TA'];
            count_list = [];
            for i in platform:
                count = {}
                #print(i);
                #get the badgecount for each platform
                count['platform'] = i;
                badge_count = badgeReceived.objects.filter(userid_id=request.user, badgeReceived = dict['badgeName'], platform=i).values('platform')\
                    .annotate(Count('platform'));
                #print('line 450 :: ', badge_count);
                if badge_count:
                    count['badgeCount'] = badge_count[0]['platform__count'];
                else:
                    count['badgeCount'] = 0;

                count_list.append(count);

            #print('line 458 (debug purpose):: ', count_list);
            dict['count_List'] = count_list;
            #append this to the main list
            badgeCountList.append(dict);

        #print('line 463 badge count list (debug) :: ', badgeCountList)

        return JsonResponse({'badgeNames': badgeType_dict[badgeType],
                             'badgeDesc': badgeDesc_dict[badgeType],
                             'badgeCount': badgeCountList});
    return HttpResponse('');


# this comes from the KA tool
#TODO: connect with KAform.js
def submitKAAnswer(request):

    if khanAcademyAnswer.objects.filter(pk=request.POST.get('imgID')).filter(posted_by=request.user).filter(response_type=request.POST.get('response_type')).exists():
        khanAcademyAnswer.objects.filter(ka_id=request.POST.get('activity_id')).filter(pk=request.POST.get('imgID')).filter(response_type=request.POST.get('response_type')). \
            update(response=request.POST.get('answer'))
    else:
        khanAcademy_answer = khanAcademyAnswer(ka_id=request.POST.get('activity_id'), posted_by=request.user, response_type=request.POST.get('response_type'),
                                               response=request.POST.get('answer'));
        khanAcademy_answer.save();


    # pass through dialogtag to get the tag
    rewardType, praiseText = utteranceClassifier.classifierMethod(None, request.POST.get('answer'));


    return JsonResponse({'rewardType': rewardType, 'praiseText': praiseText}) #goes to kaform.js

# save the badges that students received.
def saveBadgeHistory(username, platform, activity_id, message, received_badge):


    #save users' selected badge
    badge_Received = badgeReceived(userid=User.objects.get(username=username), platform=platform, activity_id=activity_id, message=message,
                            badgeReceived=received_badge);
    badge_Received.save();

    return HttpResponse('');


# called from def getPrompt
def computationalModel(request, charac, platform):

    data = binaryLogisticModel.model(None, charac, platform);
    print('from the view class, likelihood score', data);


    return data;

# called from def getCharacteristic method
def getCondition(request, username):

    #1-dynamic, #2-static
    condition = studentInfo.objects.filter(user_id=User.objects.get(username=username)).values('condition');

    #print('def getCondition :: ', condition[0]['condition']);
    condition = condition[0]['condition'];

    return condition;

def getPrompt(request):

    if request.method == 'POST':
        username = request.POST.get('username');
        platform = request.POST.get('platform');
        activity_id = request.POST.get('activity_id');

        print(username + ' joined from ' + platform + ' working on activity id ' + activity_id);

        #get student characteristic
        charac = getCharacteristic(request, username) #this method will check the condition and return charac based on this
        charac_list = list(charac.values())[0:4]

        #order: msc, hsc, fam, con, social
        print('views.py def getPrompt --> getCharac ::', charac);

        #computational model
        likelihood = computationalModel(request, charac, platform);
        print('views.py computational model ::', likelihood)

        supportType = ''
        supportText = ''

        index_list = [1, 2, 3];  # initial list
        randomNO = str(random.choice(index_list))
        print('line 536 ::', randomNO)

        # start likelihood if
        if likelihood > 0.3:
            supportType = 'transactive'
            #todo
        else:
            # likelihood less than 0.3, depending on platform check charac and return support
            if platform == 'MB':
                #TODO: make entry to support history
                print('from Modelbook');
                if charac_list[0]:
                    print('MSC high');
                    supportType = 'transactive'
                    charac_ = "MSC"
                    charac_val = "high"

                else:
                    print('MSC low');
                    supportType = 'question'
                    charac_ = "MSC"
                    charac_val = "low"

            elif platform == 'KA':
                print('from Khan Academy');
                if charac_list[2]:
                    print('Fam high');
                    supportType = 'participation'
                    charac_ = "Fam"
                    charac_val = "high"

                else:
                    print('Fam low');
                    supportType = 'transactive'
                    charac_ = "Fam"
                    charac_val = "low"

            else:
                print('from Teachable Agent')
                if charac_list[1]:
                    print('hsc high');
                    supportType = 'elaboration'
                    charac_="HSC"
                    charac_val="high"

                else:
                    print('hsc low');
                    supportType = 'elaboration'
                    charac_="HSC"
                    charac_val="low"



        support = supportOffered(userid=User.objects.get(username=username), platform=platform, activity_id=activity_id,
                                        supportType=supportType, charac=charac_, charac_val=charac_val)
        support.save();

        supportText = badgeInfo.objects.filter(charac=charac_, value=charac_val, index=randomNO, supportType=supportType).values(
            'prompt', 'sentence_opener1');

        return JsonResponse({'promptText': supportText[0]['prompt'],
                             'promptSO': supportText[0]['sentence_opener1']})


    return HttpResponse('');

def getWhiteboardURl(request, board_id):

    # print('line 618 :: ', board_id);
    # print('line 618 :: ', request.user);
    whiteboard = whiteboardInfoTable.objects.filter(whiteboard_activityID = board_id, userid_id = request.user).values('whiteboard_link');
    print(whiteboard);

    if whiteboard:
        url = whiteboard[0]['whiteboard_link'];
        return JsonResponse({'url':url});

    return HttpResponse('');

def getWhiteboardGroupMember(request, act_id):
    current_user = whiteboardInfoTable.objects.filter(whiteboard_activityID=act_id, userid_id=request.user).values(
        'whiteboardGroupID');

    current_user_id = current_user[0]['whiteboardGroupID'];

    members_list = whiteboardInfoTable.objects.filter(whiteboard_activityID=act_id, whiteboardGroupID=current_user_id).values(
        'userid_id');

    #print(members_list)
    group_member_list = [];
    for member in members_list:
        group_member_list.append(member['userid_id'])

    group_member_name = []
    for i in members_list:
        group_member_name.append(User.objects.get(id=i['userid_id']).username);

    return current_user_id, group_member_list, group_member_name;




#updates the chat feed
def updateFeed(request, id):

    #get other members of this group
    # get the current users' whiteboard group
    current_user_id, group_member_list, group_member_name = getWhiteboardGroupMember(request,id);

    print('views py whiteboard group members :: ', group_member_name)

    # message from these group members
    msg = Message.objects.filter(posted_by_id__in=group_member_list, activity_id = id);
    msg_data = serializers.serialize('json', msg, use_natural_foreign_keys=True)

    return JsonResponse({'success': msg_data, 'username': request.user.get_username(), 'group_member_name': group_member_name})

###############################################
############ handler methods start ############
def getUsername(request):
    if request.user.is_authenticated:
        print('def GetUsername method -- username :: ', request.user.get_username())
        username = request.user.get_username();
        return JsonResponse({'name': username, 'errorMsg': None})
    return HttpResponse('');

# input: activity ID
# output: the group ID of the current user for the given activity ID
def getGroupID(request, act_id):
    groupID = groupInfo.objects.all().filter(activityID = act_id)
    groupID = groupID.filter(users_id = request.user)

    return groupID[0].group;


def getCurrentUserGroupID(request, act_id):

    return JsonResponse({'groupID': getGroupID(request, act_id)});

#input: activity ID
#output: return the ID of the group members of the current user for the given activity
def getGroupMembers(request, act_id):
    # what is the group number of the current user in a particular activity
    current_user_groupID = getGroupID(request, act_id);

    # which users are are there in this group
    group_members = groupInfo.objects.all().filter(activityID=act_id, group=current_user_groupID);

    group_member_list = [];
    for member in group_members:
        group_member_list.append(member.users_id);

    print('views.py digital discussion getGroupMembers :: ', group_member_list);
    return group_member_list;

#input: group number
#output: return ID of all the group members given a group number
def getGroupMembersID(request, group_id, act_id):

    # which users are are there in this group
    group_members = groupInfo.objects.all().filter(activityID=act_id, group=group_id);

    group_member_list = [];
    for member in group_members:
        group_member_list.append(member.users_id);

    return group_member_list;

#this method reads badge info from an excel and saves into the database
#file location is hardcoded i.e., downloads folder of IA computer
def insertSupportInfo(request):

    #1. read the excel file (used a separate py file for this)
    supportInfoList = infoFileRead.fileRead(None);
    #print(type(bagdeInfoList));

    # 2. insert into the table
    for supportElem in supportInfoList:
        #print(badgeElem['characteristic'])
        entry = badgeInfo(charac = supportElem['characteristic'], value = supportElem['value'], index = supportElem['index'],
                    supportType = supportElem['supporttype'], prompt = supportElem['prompt'], sentence_opener1 = supportElem['sentopener1'],
                          sentence_opener2 = supportElem['sentopener2']);
        entry.save();

    return HttpResponse('');

def insertCharacInfo(request):

    #1. read the excel file (used a separate py file for this)
    characInfo = infoFileRead.studentCharacfileRead(None);
    #print(type(bagdeInfoList));

    # 2. insert into the table
    for elem in characInfo:

        print(elem['name'])

        charac = studentCharacteristicModel(user = User.objects.get(username=elem['name']), has_msc = elem['msc'], has_hsc = elem['hsc'], has_fam = elem['fam'],
                                        has_con=elem['con'],has_social=1);
        charac.save();

    return HttpResponse('');

def insertWhiteboardInfo(request):

    #1. read the excel file (used a separate py file for this)
    whiteboardInfoList = infoFileRead.whiteboardfileRead(None);
    #print(type(bagdeInfoList));

    # 2. insert into the table
    for whiteboard in whiteboardInfoList:
        print(whiteboard['name'])

        entry = whiteboardInfoTable(whiteboard_activityID = int(whiteboard['whiteboard_id']),
                                    userid_id = User.objects.get(username=whiteboard['name']).pk,
                                    whiteboardGroupID = whiteboard['groupID'], whiteboard_link = whiteboard['url']);
        entry.save();

    return HttpResponse('');

def insertKhanAcademyInfo(request):

    #1. read the excel file (used a separate py file for this)
    khanacademyInfoList = infoFileRead.khanAcademyfileRead(None);
    #print(type(bagdeInfoList));

    # 2. insert into the table
    for khanacademy in khanacademyInfoList:
        #print(whiteboard['user'])

        entry = khanAcademyInfoTable(platform = khanacademy['platform'],
                                    KA_id = khanacademy['id'], url = khanacademy['url']);
        entry.save();

    return HttpResponse('');


############ handler methods end ############
#############################################
#




##############################################
##Codes used from the previous version-start##
##############################################

def tableEntriesSave(request):

    entries = tableChartData(posted_by = request.user, table_id = request.POST.get('table_id'), plot_type = request.POST.get('plot_type'),
                             plot_data = request.POST.get('plot_data'));
    entries.save();

    return HttpResponse('');

def registerUser(request):
    return render(request, 'app/register.html', {})

def groupAdd(request):

    userlist = infoFileRead.usernamefileRead(None);

    for userinfo in userlist:
        #rangeVal = total number of unique gallery activities
        rangeVal = 8;

        for i in range(1, rangeVal):
            member = groupInfo(activityID=i, group=userinfo['DGgroup'],
                               users=User.objects.get(username=userinfo['username']))
            member.save();

    print('/groupAdd done input')

    return render(request, 'app/login.html', {});


def userlog(request):

    log = userLogTable(username=request.user, action=request.POST.get('action'), type=request.POST.get('type'),
                       input=request.POST.get('input'), pagenumber=request.POST.get('pagenumber'))
    log.save()

    return HttpResponse('')

def createBulkUser(request):
    User.objects.all().delete()

    # read the excel file for reading user names
    userlist = infoFileRead.usernamefileRead(None);


    for userinfo in userlist:
        # insert into the user table - used for login
        user = User.objects.create_user(userinfo['username'], '', userinfo['password']);
        user.save();

        # insert into student info table - used for condition checking
        user_studentInfo = studentInfo(user=User.objects.get(username=userinfo['username']), period=userinfo['class'], condition=userinfo['condition'])
        user_studentInfo.save()


    print('/createBulkUser done input');
    return render(request, 'app/login.html', {})

##############################################
##Codes used from the previous version-end##
##############################################
def wordToBinaryConvertor(entry):

    entry_personality_dict = {}
    entry_personality_dict['msc'] = entry[0]['char_msc'];
    entry_personality_dict['hsc'] = entry[0]['char_hsc'];
    entry_personality_dict['fam'] = entry[0]['char_fam'];
    entry_personality_dict['con'] = entry[0]['char_con'];
    # entry_personality_dict['name'] = entry[0]['char_name'];

    # do the matching here
    # print(entry_personality_dict['msc'] )
    msc_list = ["not that great at math", "pretty great at math"]
    hsc_list = ["but they do not feel like they are very good at giving help to others",
                "and they think they are pretty good at giving help to others"]
    fam_list = ["they do not mind working with anybody","they prefer only working with people they know"]
    con_list = ["they do not always participate", "they usually do what they are supposed to do"]

    current_user_profile = []
    current_user_profile.append(msc_list.index(entry_personality_dict['msc']))
    current_user_profile.append(hsc_list.index(entry_personality_dict['hsc']))
    current_user_profile.append(fam_list.index(entry_personality_dict['fam']))
    current_user_profile.append(con_list.index(entry_personality_dict['con']))

    return current_user_profile;

def matchPersonalityProfile(request):


    #if the current student already 'loaded' then pull from there else load from the init

    if studentPersonalityChangeTable.objects.filter(posted_by_id = request.user, event="changed html inputs"):
        #print('user loaded before');
        #check if the user has changed anything
        entry = studentPersonalityChangeTable.objects.filter(posted_by_id = request.user, event="changed html inputs").values('id','char_msc','char_hsc','char_fam', 'char_con','char_name').order_by('-id')

        current_user_profile = wordToBinaryConvertor(entry);

        personality_dict = handlerMatchProfile(request, current_user_profile, 'persona match after change')

        return JsonResponse({'profile': personality_dict});


    else:
        # get the students characteristic VALUES from the database
        charac = getCharacteristic(request, request.user);  # this is a dict
        #translate charac to a list, take the first four elem, fifth is the social
        charac_list = list(charac.values())[0:4]
        print('debug matchPersonalityProfile student initial charac', charac);
        #print('debug matchPersonalityProfile', charac_list[0]);

        personality_dict = handlerMatchProfile(request, charac_list, 'based on survey response')
        #print('line 1021', personality_dict);

        return JsonResponse({'profile': personality_dict});
    return HttpResponse('');


def handlerMatchProfile(request, charac_list, event):
    # order: msc, hsc, fam, con

    profile = [[False, False, False, False],
               [False, False, False, True],
               [False, False, True, False],
               [False, False, True, True],
               [False, True, False, False],
               [False, True, False, True],
               [False, True, True, False],
               [False, True, True, True],
               [True, False, False, False],
               [True, False, False, True],
               [True, False, True, False],
               [True, False, True, True],
               [True, True, False, False],
               [True, True, False, True],
               [True, True, True, False],
               [True, True, True, True]]

    profile_names = ['August', 'Taylor', 'Phoenix', 'Nicky', 'Alexis', 'Monroe', 'Seneca', 'Morgan', 'Robin', 'Adrian',
                     'Zion', 'Sam', 'Andy', 'Sidney', 'Quinn', 'Skyler']
    matchedprofile_index = ''

    for list in profile:
        if charac_list == list:
            # print('line 904 lucky number', charac_list)
            # print('line 905 lucky number', list)
            # print('line 906 lucky number', profile.index(list))
            matchedprofile_index = profile.index(list)


    # print('line 986 debug matchPersonalityProfile', matchedprofile);
    msc_statements = {
        'False': 'not that great at math',
        'True': 'pretty great at math'
    }

    hsc_statements = {
        'False': 'but they do not feel like they are very good at giving help to others',
        'True': 'and they think they are pretty good at giving help to others'
    }

    #true/false reversed in april 2021 implementation
    fam_statements = {
        'True': 'they prefer only working with people they know',
        'False': 'they do not mind working with anybody'
    }

    con_statements = {
        'False': 'they do not always participate',
        'True': 'they usually do what they are supposed to do'
    }

    personality_dict = {}
    # msc is true;
    if charac_list[0]:  # selected_profile[0] = msc
        personality_dict['msc'] = msc_statements['True'];
    else:
        personality_dict['msc'] = msc_statements['False'];

    # hsc is true;
    if charac_list[1]:  # selected_profile[1] = hsc
        personality_dict['hsc'] = hsc_statements['True'];
    else:
        personality_dict['hsc'] = hsc_statements['False'];

    # fam is true;
    if charac_list[2]:  # selected_profile[2] = fam
        personality_dict['fam'] = fam_statements['True'];
    else:
        personality_dict['fam'] = fam_statements['False'];

    # con is true;
    if charac_list[3]:  # selected_profile[3] = con
        personality_dict['con'] = con_statements['True'];
    else:
        personality_dict['con'] = con_statements['False'];


    personality_dict['name'] = profile_names[matchedprofile_index];

    # save this into the database #the first entry shows the actual profile
    entry = studentPersonalityChangeTable(posted_by=request.user, char_msc=personality_dict['msc'],
                                          char_hsc=personality_dict['hsc'],
                                          char_fam=personality_dict['fam'],
                                          char_con=personality_dict['con'],
                                          char_name=personality_dict['name'],
                                          event=event);
    entry.save();

    return personality_dict;

def saveEditedPersonality(request):

    if request.method == 'POST':
        entry = studentPersonalityChangeTable(posted_by=request.user, char_msc=request.POST.get('msc'),
                                 char_hsc=request.POST.get('hsc'),
                                 char_fam=request.POST.get('fam'),
                                 char_con=request.POST.get('con'),
                                 char_name=request.POST.get('name'),
                                 event=request.POST.get('event'))
        entry.save();

    return HttpResponse('');

# def saveStudentCharacteristicModel(request):

# def getImagePerUser(request, act_id, username):
#     print('receiving parameter :: activity id :: username ' + act_id + '  ' + username);
#
#     image_list = imageModel.objects.filter(gallery_id=act_id).filter(posted_by=User.objects.get(username=username))
#     image_data = serializers.serialize('json', image_list, use_natural_foreign_keys=True)
#
#     print(image_data)
#
#     return JsonResponse({'success': image_data})

# def imageDelete(request, img_id):
#     img = imageModel.objects.get(pk=img_id)
#     # This will delete the image and all of its Entry objects.
#     print(img)
#     img.delete()
#
#     return HttpResponse('deleted?')

def uploadKAImage(request):
    #get image from html and save it in the database
    if request.method == "POST":
        # print (request.Files) #gives the name of the <input type='file' name...>

        #get the KA ID
        ka_id = request.POST.get('ka-act-id');
        print("ka_id: ", ka_id)

        #get the logged in username
        username = ''
        if request.user.is_authenticated:
            print('username :: ', request.user.get_username())
            username = request.user.get_username();
        else:
            print('user not signed in') #add in log

        #insert values in the database
        ka_image_upload = khanAcademyAnswer(ka_id=ka_id, ka_image=request.FILES['ka_img_name'], posted_by=request.user, response_type='answer a question');
        ka_image_upload.save();

        latest_upload = khanAcademyAnswer.objects.filter(ka_id=ka_id, posted_by=request.user).last()
        #https://stackoverflow.com/questions/16640021/django-object-is-not-iterable-using-serializers-serialize
        ka_img = serializers.serialize('json', [latest_upload], use_natural_foreign_keys=True)
        #print(latest_upload.pk)

        return JsonResponse({'ka_imgID': latest_upload.pk, 'ka_img':ka_img})

# def submitAnswer(request):
#
#     print(request.POST.get('answer'));
#     userQuesAnswer = userQuesAnswerTable(questionIDbyPage = request.POST.get('page'), answer = request.POST.get('answer'), posted_by = request.user)
#     userQuesAnswer.save()
#
#     return HttpResponse('')

#

# def checkKAAnswer(request, ka_id):
#
#     try:
#         #if multiple image with same ka activity id, pull the latest one
#         ka_obj = khanAcademyAnswer.objects.filter(ka_id=ka_id).filter(posted_by=request.user).order_by('-pk')[:1];
#         ka_obj = serializers.serialize('json', ka_obj, use_natural_foreign_keys=True)
#         print(ka_obj)
#     except imageModel.DoesNotExist:
#         ka_obj = None
#
#     return JsonResponse({'success': ka_obj})
#
#
# def random_discussion_group_generator(request):
#
#     #delete previoud grouping - if any
#     random_group_users.objects.all().delete();
#
#     #TODO: username and user face to face group number array
#     self = None;
#     all_group_list  = randomGroupGenerator.creategroup(self)
#     for i in range(1,4):
#         #iterate through the list of lists
#         for list in  all_group_list:
#             print(list)
#
#             #get user for username=AW
#             teacher_user = User.objects.get(username='AW')
#             #iterate through the list and make entry
#
#             for g in list:
#                 user =  User.objects.get(username=g)
#                 print(user)
#                 group_member = random_group_users(users=user, gallery_id = i, group=all_group_list.index(list)+1) #plus 1 so the group number starts from 1 instead of 0
#                 group_member.save();
#
#                 #add amanda in every group
#             group_member = random_group_users(users=teacher_user, gallery_id = i, group=all_group_list.index(list)+1)
#             group_member.save();
#
#
#     # for i in range(1, 7): #6 galleries, so upto 7
#     #     users_list = [str(user) for user in User.objects.all()];
#     #     users_list = [n for n in users_list if n not in ['AW', 'user1', 'user2']]
#     #     print(users_list)
#     #     member_limit = 5;
#     #
#     #     users_list_copy = users_list
#     #     group_list = []
#     #     while len(users_list_copy) > 0:  # use all users
#     #         if (len(users_list_copy) < member_limit):
#     #             used_users = users_list_copy
#     #             username_list_2 = [n for n in users_list_copy if n not in used_users]
#     #             group_list.append(used_users)
#     #             #print('groups:: ', used_users)
#     #             break
#     #         used_users = random.sample(users_list_copy, member_limit)
#     #         group_list.append(used_users)
#     #         #print('groups:: ', used_users)
#     #         users_list_copy = [n for n in users_list_copy if n not in used_users]
#     #         #print(users_list_copy)
#     #
#     #     #print(group_list)
#     #
#     #     #get user for username=AW
#     #     teacher_user = User.objects.get(username='AW')
#     #     #iterate through the list and make entry
#     #     for group_index in range(len(group_list)):
#     #         group = group_list[group_index]
#     #         for g in group:
#     #             user =  User.objects.get(username=g)
#     #             print(user)
#     #             group_member = random_group_users(users=user, gallery_id = i, group=group_index+1) #plus 1 so the group number starts from 1 instead of 0
#     #             group_member.save();
#     #
#     #         #add amanda in every group
#     #         group_member = random_group_users(users=teacher_user, gallery_id = i, group=group_index+1)
#     #         group_member.save();
#
#     #end of for loop
#     return HttpResponse('')
#
#     # # check if a user has joined a group or not; if not add him in a group if group has still empty place
#     # # https://stackoverflow.com/questions/3090302/how-do-i-get-the-object-if-it-exists-or-none-if-it-does-not-exist
#     # try:
#     #     isUserPresent = random_group_users.objects.get(users_id=request.user)
#     #     print('inside try', isUserPresent)
#     #     return HttpResponse('unable to join the group, already joined a group')
#     # except random_group_users.DoesNotExist:
#     #     print('inside except')
#     #     isUserPresent = None
#     #     # count total number of members in the group
#     #     member_count = random_group_users.objects.filter(group='A').count()
#     #     print('total member count', member_count)
#     #     if member_count < 6: #allows 6 members
#     #         group_member = random_group_users(users = request.user, group='A')
#     #         group_member.save();
#     #         return HttpResponse('successfully joined the group')
#     #     else:
#     #         return HttpResponse('unable to join the group, group exceeded 6 members')
#




# # projection gallery dashboard
# def dashboardGalleryInfo(request,act_id):
#     gallery_id = act_id;
#
#     # get total groups for this gallery
#     info_query = random_group_users.objects.filter(gallery_id=gallery_id).values('group').distinct()
#
#     # convert query into list
#     group_list = [int(q["group"]) for q in info_query]
#
#     list=[]
#     for group_id in group_list:
#         dict={};
#
#         #store group id for this particular gallery
#         dict['group_id'] = group_id
#
#         info_query = random_group_users.objects.filter(gallery_id=gallery_id).filter(group=group_id)
#
#         # store user list for this group for this gallery
#         # get the user id from the users table and get their username
#
#         temp = [User.objects.get(pk=e.users_id).get_username() for e in info_query]
#         temp.remove('AW') #remove simply removes the item, does not return anything. so print the list again
#         dict['user_list'] = temp
#         #print(dict['user_list'])
#
#         # get the total number of comments by the users for each group for this gallery
#         image_data = aux_method_get_imgcomment_random_list_group_teacher(group_id, gallery_id)
#         dict['total_comment'] = len(image_data)
#
#         list.append(dict);
#
#     #print([q["fields"] for q in info_query])
#     return JsonResponse({'list': list})


# def getRandomGroupMemberList(request, gallery_id):
#
#     # get the group for the user for specific gallery
#     random_group_id = random_group_users.objects.filter(gallery_id=gallery_id).filter(users_id=request.user).values('group')
#     for o in random_group_id: random_group_id = o['group']
#
#     #get the user list - this returns a query object
#     random_list = random_group_users.objects.filter(gallery_id=gallery_id).filter(group=random_group_id)
#
#     #convert the query list into a list
#     random_group_list = [User.objects.get(pk=o.users_id).get_username() for o in random_list]
#
#     return random_group_list;

# def updateDiscussionImageFeed(request, gallery_id):
#
#     print("updateDiscussionImageFeed");
#
#     print("updateDiscussionImageFeed glry id", gallery_id)
#     # first filter based on gallery since each gallery has different random group
#     random_users_based_on_gallery = random_group_users.objects.filter(gallery_id=gallery_id)
#
#     # get in which middle group for current user
#     middlegroup_id = random_users_based_on_gallery.get(users_id=request.user).group  # get the query first and access the group from that query
#     print("updateDiscussionImageFeed random group", middlegroup_id)
#
#     image_data = aux_method_get_imgcomment_random_list_group_teacher(middlegroup_id, gallery_id)
#     image_data = serializers.serialize('json', image_data, use_natural_foreign_keys=True)
#
#     return JsonResponse({'success': image_data, 'username': request.user.get_username(), 'errorMsg': True})

# def updateDiscussionImageFeedTeacherVersion(request, gallery_id, group_id):
#     print('updateDiscussionImageFeedTeacherVersion', gallery_id)
#     print('updateDiscussionImageFeedTeacherVersion',group_id)
#     image_data = aux_method_get_imgcomment_random_list_group_teacher(group_id, gallery_id)
#     image_data = serializers.serialize('json', image_data, use_natural_foreign_keys=True)
#     return JsonResponse({'success': image_data, 'username': request.user.get_username(), 'errorMsg': True})
#
# def aux_method_get_imgcomment_random_list_group_teacher(middlegroup_id, gallery_id):
#     # find other users in this group
#     # first filter based on gallery since each gallery has different random group
#     random_users_based_on_gallery = random_group_users.objects.filter(gallery_id=gallery_id)
#
#     middlegroup_users = random_users_based_on_gallery.filter(group=middlegroup_id)
#     for o in middlegroup_users: print("updateDiscussionImageFeed random grp members", o.users_id)
#
#     # get their original group from groupinfo table
#     image_pk = []
#     for o in middlegroup_users:
#         originalgroup_id = \
#         groupInfo.objects.filter(users_id=User.objects.get(pk=o.users_id)).order_by('group').values('group').distinct()[
#             0]['group']
#
#         print("updateDiscussionImageFeed original group id", originalgroup_id)
#         # for each original group id get the image posted by that group - there should one image per group atleast
#         images = imageModel.objects.filter(gallery_id=gallery_id).filter(group_id=originalgroup_id).values('pk')
#         print("updateDiscussionImageFeed", images)
#
#         for im in images:
#             image_pk.append(im['pk']);
#         # image_data = serializers.serialize('json', images, use_natural_foreign_keys=True)
#
#     # image ids of the images that a group can see.
#     # print('with duplicates :: ',image_pk)
#
#     # if same id twice -- image is displayed twice -- so get the distinct IDs of the image
#     image_pk = list(set(image_pk))
#     # print('without duplicates :: ',image_pk)
#
#     #get user object for middle group users
#     userobject_list = []
#     for o in middlegroup_users:
#         userID = User.objects.get(pk=o.users_id)
#         userobject_list.append(userID)
#
#     # https://stackoverflow.com/questions/34830595/how-to-perform-a-queryset-in-django-with-a-loop-for-in
#     image_data = imageComment.objects.filter(isGroupDiscussion='yes').filter(imageId_id__in=image_pk).filter(posted_by_id__in=userobject_list)
#     print(image_data)
#
#     return image_data

# def getKAPerKAID(request,ka_id):
#
#
#     plusone = int(ka_id) + 1
#     #gives the raw query object
#     ka_items = khanAcademyAnswer.objects.filter(ka_id__in=[ka_id, str(plusone)]).order_by('posted_by__username') #posted by is the foreign key, so it was sorting based on the
#                                                                                             #id, posted_by__username sorts alphabetically.
#
#     #user id who posted
#     userid_list = [User.objects.get(pk=user['posted_by_id']).get_username() for user in khanAcademyAnswer.objects.values('posted_by_id').distinct()]
#     #print(userid_list)
#     #find users who did not post
#     users_did_not_post = [x for x in getAllUserList() if x not in userid_list]
#     #print(len(users_did_not_post))
#     #print(users_did_not_post)
#
#
#     #count number of student post
#     counter = Counter()
#     for o in ka_items:
#         counter[o.posted_by.get_username()] += 1;
#
#     ka_list = []
#     #add users who did not post anything #not so happy with this approach #remove starts here
#     for o in users_did_not_post:
#         data = {}
#         data['ka_image'] = '';
#         data['posted_by'] = o;
#         data['count'] = 0;
#         data['response_type'] = '';
#         data['response'] = '';
#         #json_data = json.dumps(data);
#         ka_list.append(data);
#     # remove finishes here
#
#     #iterate over the query
#     for o in ka_items:
#         data = {}
#         data['ka_image'] = str(o.ka_image);
#         data['posted_by'] = o.posted_by.get_username();
#         data['count'] = counter[o.posted_by.get_username()];
#         data['response_type'] = o.response_type;
#         data['response'] = o.response;
#         #json_data = json.dumps(data);
#         ka_list.append(data);
#
#     #sort list of dictionary items by their username
#     #ka_list = sorted(ka_list, key=lambda k: k['posted_by'])
#
#     #sort list by their counts
#     ka_list = sorted(ka_list, key=lambda k: k['count'])
#
#     # context = {
#     #     'list': ka_list,
#     #
#     # }
#     #return render(request, 'app/dashboard.html', context); #sent to html itself
#
#     return JsonResponse({'success': ka_list});

# def getGalleryPerID(request,gid):
#
#     #gives the raw query object
#     images = imageModel.objects.filter(gallery_id=gid)
#
#     # user id who posted
#     userid_list = []
#     # image id list for this particular gallery
#     image_list = []
#     for im in images:
#         comment_count_list = []
#         comment_count_list = [0] * 31
#         item = {}
#         item['image_id'] = im.pk
#         item['posted_by'] = im.posted_by.get_username()
#         userid_list.append(item['posted_by'])
#         image_comments = imageComment.objects.filter(imageId = im.pk)
#         item['comments'] = [im.content for im in image_comments]
#         item['count'] = len(item['comments'])
#         image_list.append(item)
#
#     #print(image_list)
#     # find users who did not post
#     users_did_not_post = [x for x in getAllUserList() if x not in userid_list]
#
#     for user in users_did_not_post:
#         item = {}
#         item['image_id'] = 0;
#         item['posted_by'] = user;
#         item['comments'] = []
#         item['count'] = 0
#         image_list.append(item)
#
#     # sort list by their counts
#     image_list = sorted(image_list, key=lambda k: k['count'])
#
#     return JsonResponse({'success': image_list});

# def getDashboard(request):
#     return render(request, 'app/dashboard.html');
#
# def insertBadges(request):
#     badge = badgeReceived(badgeType = request.POST.get('badgeType'), message = request.POST.get('message'),
#                        platform = request.POST.get('platform'), userid = request.user)
#     badge.save()
#
#     return HttpResponse('')

#TODO: read excel and add it to the database method

# def pageParser(request):
#     #CASE 4: static method - FAIL, not possible to call `cls.get` or `self.get`
#     #ref: https://stackoverflow.com/questions/50806626/django-calling-one-class-method-from-another-in-class-based-view
#     self = None
#     print(parser.activityParser(self))
#     return HttpResponse('')
#
#
# def getAllStudentInfo(request,std_id):
#     return HttpResponse(std_id)
#
# def dashboardKAInfo(request,ka_id):
#
#     print('entering dashboardKAInfo ka_id:', ka_id);
#
#     ka_id = int(ka_id)
#     if ka_id%2 == 0:
#         even_id = ka_id;
#         odd_id = ka_id-1;
#     else:
#         odd_id = ka_id;
#         even_id = ka_id+1;
#
#     # post - 1
#     odd_post_object = khanAcademyAnswer.objects.filter(ka_id = odd_id).exclude(response_type='')
#     ka_post_length_odd_id = len(odd_post_object)
#     print('hojoborolo',len(odd_post_object))
#
#     #how many are question and how many are answer
#     post_odd_count = odd_post_object.values('response_type').annotate(dcount=Count('response_type'))
#     print(post_odd_count)  #output in the format --> {{response type:answer, dcount:2}, {response type:question, dcount:1})
#
#     answer =  0
#     question = 0
#
#     for q in post_odd_count:
#         print(q)
#         if 'answer' in q.values():
#             answer = q["dcount"]
#         #else: answer = 0;
#
#         if 'question' in q.values():
#             question = q["dcount"]
#         #else: question = 0;
#
#     odd_answer_count = answer
#     odd_question_count = question
#
#
#     #post - 2
#     post_even_object = khanAcademyAnswer.objects.filter(ka_id=even_id).exclude(response_type='')
#     ka_post_length_even_id = len(post_even_object)
#
#     # how many are question and how many are answer
#     post_even_count = post_even_object.values('response_type').annotate(dcount=Count('response_type'))
#
#     answer = 0
#     question = 0
#
#     for q in post_even_count:
#         print(q)
#         if 'answer' in q.values():
#             answer = q["dcount"]
#         #else: answer = 0;
#
#         if 'question' in q.values():
#             question = q["dcount"]
#         #else: question = 0;
#
#     even_answer_count = answer
#     even_question_count = question
#
#
#
#     return JsonResponse({'ka_post_length_odd_id': ka_post_length_odd_id, 'odd_answer_count':odd_answer_count, 'odd_question_count':odd_question_count,
#                          'ka_post_length_even_id':ka_post_length_even_id, 'even_answer_count':even_answer_count, 'even_question_count':even_question_count})

# def getGalleryTableTD(request, act_id):
#
#     #get all the users
#     users_list = [str(user) for user in User.objects.all()]
#     print(users_list)
#     #returns None if no object is returned from the query. handles exception/error.s
#     try:
#         images = imageModel.objects.filter(gallery_id=act_id)
#     except imageModel.DoesNotExist:
#         images = None
#
#     image_list = []
#     for im in images:
#         comment_count_list = []
#         comment_count_list = [0] * 31
#         item = {}
#         item['image_id'] = im.pk
#         item['posted_by'] = im.posted_by.get_username()
#         image_comments = imageComment.objects.filter(imageId = im.pk)
#         item['comments'] = [im.content for im in image_comments]
#         temp = [im.posted_by.get_username() for im in image_comments]
#         temp = Counter(temp)
#         for key, value in temp.items():
#             index = [users_list.index(key)] #returns a list of one item
#             comment_count_list[index[0]] = value;
#
#
#         item['comment_count'] = comment_count_list
#         image_list.append(item)
#
#     return JsonResponse({'success': json.loads(json.dumps(image_list)), 'errorMsg': True})

# create superuser
# https://docs.djangoproject.com/en/2.1/topics/auth/default/


def createUser(request):

    if request.method == "POST":
        #get username/password from the form
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = User.objects.create_user(username, '', password)
        user.save()

        #authenticate and redirect to index
        user = authenticate(username=username, password=password)
        print(user)

        if user:
            auth_login(request, user)
            return HttpResponseRedirect('/index/')
        else:
            # return invalid login message
            return render(request, 'app/login.html', {})

    return HttpResponse('')

#
# def camera(request):
#     return render(request, 'app/camera.html', {})


# @csrf_exempt
# def userLogFromExtenstion(request):
#     #https://stackoverflow.com/questions/35474259/django-middleware-making-post-request-blank
#     body = request.body.decode('utf-8')  # in python 3 json.loads only accepts unicode strings
#     body = json.loads(body)
#
#     print(body)
#     username = body['username'].split(' ')[0].lower()
#     action = body['action']
#     type = body['type']
#     data = body['input']
#     pagenumber = body['pagenumber']
#
#     print(username)
#     user_pk_id = User.objects.get(username=username).pk
#     print (user_pk_id)
#
#     print('from extension?', username, action, type, data, pagenumber)
#     log = body
#     f = open("extensionLOGfile.txt", "a")
#     f.write(str(log))
#     f.write('\n')
#
#     log = userLogTable(username=User.objects.get(pk=user_pk_id), action=body['action'], type=body['type'],
#                        input=body['input'], pagenumber=body['pagenumber'])
#     log.save()
#
#     return HttpResponse('')

# hacks - start

#if this method is called with users already existing in the database, will return a django error message


# def dataToCSV(request):
#     #get all the image objects and serialize to get the foreign key values
#     sql = imageModel.objects.all();
#     sql = serializers.serialize('json', sql, use_natural_foreign_keys=True)
#
#     # how many image posted by each user?
#     sql = imageModel.objects.values('posted_by_id').annotate(dcount=Count('posted_by_id'))
#     # TODO: unable to serialize this query with the following
#     #sql = serializers.serialize('json', sql, use_natural_foreign_keys=True)
#
#     #get imagecomment count grouped by image id but does not give the content
#     sql = imageComment.objects.values('imageId_id').annotate(dcount=Count('imageId_id'))
#     #print(sql) #print the result #print(len(sql[0]) #prints 2 - length of the first element
#     print(len(sql)) #get the length of total image group by count
#
#     #get distinct image id from imagecomment model
#     #https://stackoverflow.com/questions/10848809/django-model-get-distinct-value-list
#     sql = imageComment.objects.order_by('imageId_id').values('imageId_id').distinct()
#
#     #get the distinct image id in a list
#     image_id_list = [query['imageId_id'] for query in sql]
#     print(image_id_list)
#
#     #only get the content field for each image id
#     #http://books.agiliq.com/projects/django-orm-cookbook/en/latest/select_some_fields.html
#     imageContent = []
#     for image_id in image_id_list:
#         #print(imageComment.objects.filter(imageId_id = image_id).values('content'))
#         comments = imageComment.objects.filter(imageId_id = image_id).values('content','posted_by_id')
#         # convert the query set into a list -- list(comments)
#         #process comments to remove content from each row
#         # #https://stackoverflow.com/questions/7650448/django-serialize-queryset-values-into-json
#         #comment_list = json.dumps([dict(item) for item in comments])
#         comment_list = [dict(item) for item in comments]
#         #print(comment_list)
#
#         #print(list(comments))
#         item = {}
#         item['imageID'] = image_id
#         item['comments'] = comment_list
#         imageContent.append(item)
#
#
#     print(json.dumps(imageContent))
#     return HttpResponse('')
#
# def perUserDataExtract(request):
#     #get all the user list
#     users_list = [str(user) for user in User.objects.all()]
#     users_list.insert(0,0) #to start indexing from 1 instead of 0 to match user pk
#     #print(users_list[1:])
#
#     user_activity = []
#     for user in users_list[1:29]:
#         #get image comment
#         #index and primary id is the same for user
#         imagecomment = imageComment.objects.filter(posted_by_id = users_list.index(user)).order_by('imageId_id').values('content','imageId_id')
#         comment_list = [dict(item) for item in imagecomment]
#
#         item = {}
#         item['userID'] = users_list.index(user)
#         item['imagecomment'] = comment_list
#
#         #get activity feed message for each user
#         general_chat_message = Message.objects.filter(posted_by_id = users_list.index(user)).values('content')
#         general_chat_message = [gcm['content'] for gcm in general_chat_message]
#         item['generalmessage'] = general_chat_message
#         user_activity.append(item)
#
#
#     #print(json.dumps(user_activity))
#
#     #https://stackoverflow.com/questions/42354001/python-json-object-must-be-str-bytes-or-bytearray-not-dict
#     context = {'user_activity': json.loads(json.dumps(user_activity))}
#     return render(request, 'app/studentList.html', context)
#
#     #return HttpResponse('')
#
# def getGeneralChatMsg(request):
#     userid_list = [user['posted_by_id'] for user in Message.objects.values('posted_by_id').distinct()]
#     generalChatComment_list = []
#     for userid in userid_list:
#         dict = {}
#         dict[userid] = [item['content'] for item in Message.objects.filter(posted_by_id=userid).values('content')]
#         generalChatComment_list.append(dict)
#
#     return HttpResponse(generalChatComment_list)
#
# def getimageCommentCount(request):
#     imageComment_count = imageComment.objects.values('posted_by_id').annotate(dcount=Count('posted_by_id'))
#     print(imageComment_count)
#
#     # list of unique users who posted in khan academy (not all users may post in khan academy)
#     userid_list = [user['posted_by_id'] for user in imageComment.objects.values('posted_by_id').distinct()]
#
#     imageComment_list = []
#     for userid in userid_list:
#         dict = {}
#         dict[userid] = [item['content'] for item in imageComment.objects.filter(posted_by_id=userid).values('content')]
#         imageComment_list.append(dict)
#
#     return HttpResponse(imageComment_list)
#
# def getimageCommentDetails(request):
#     # sort out images by each gallery id
#     gallery_id = [gid['gallery_id'] for gid in imageModel.objects.values('gallery_id').distinct()];
#     gallery_id.sort(); #in place sort, next time the list will be sorted.
#     print(gallery_id);
#
#     list = [] #list of dictionary items
#     for gid in gallery_id:
#         dict={}
#         dict[gid] = [iid['id'] for iid in imageModel.objects.filter(gallery_id=gid).values('id')]
#         list.append(dict);
#
#     # print list of dictionary items in key/value pairs
#     # for item in list:
#     #     for k,v in item.items():
#     #         print('{}: {}'.format(k,v));
#
#     for item in list:
#         for k,v in item.items():
#             #v is the list of images in gallery k.
#             print('gallery #', k, 'has',len(v),'images');
#             print('image id list for gallery #', k, ':',v);
#             for i in v:
#                 print('image id:',i, '---',imageComment.objects.filter(imageId_id=i).values('isGroupDiscussion').annotate(Count('isGroupDiscussion')))
#
#
#
#     return HttpResponse();
# def getkhanAcademyCount(request):
#     khanacademy_count = khanAcademyAnswer.objects.values('posted_by_id').annotate(dcount=Count('posted_by_id'))
#     #print(khanacademy_count)
#
#     # list of unique users who posted in khan academy (not all users may post in khan academy)
#     userid_list = [user['posted_by_id'] for user in khanAcademyAnswer.objects.values('posted_by_id').distinct()]
#
#     kaResponse_list = []
#     for userid in userid_list:
#         dict = {}
#         dict[userid] = [{'type':item['response_type'], 'response':item['response']} for item in khanAcademyAnswer.objects.filter(posted_by_id=userid).values('response_type', 'response')]
#         kaResponse_list.append(dict)
#
#     return HttpResponse(kaResponse_list)
#
# def getKhanAcademyDetails(request):
#     #get total post on each khan academy
#     khanacademy_count = khanAcademyAnswer.objects.values('ka_id').annotate(dcount=Count('ka_id'))
#
#     kid_list = [k['ka_id'] for k in khanAcademyAnswer.objects.values('ka_id').distinct()]
#
#     list = [];
#     for kid in kid_list:
#         dict = {}
#         dict[kid] = [{'userid':User.objects.get(pk=item['posted_by_id']).username, 'count':item['dcount']} for item in khanAcademyAnswer.objects.filter(ka_id=kid).values('posted_by_id').annotate(dcount=Count('posted_by_id'))]
#         list.append(dict)
#
#
#     return HttpResponse()
#
#
# def getBadgeCount(request):
#     #total count of badges each user recieved
#     badge_count = badgeModel.objects.values('userid_id').annotate(dcount=Count('userid_id'));
#     #print(badge_count);
#
#     # identify different badges for each user
#     #list of unique users who received badge (not all users may not get badge)
#     userid_list = [user['userid_id'] for user in badgeModel.objects.values('userid_id').distinct()]
#     #print(userid_list)
#
#     # get  all of the badges for each user -- it will return dict in the format <userid:badgelist>
#     badge_list = []
#     for userid in userid_list:
#         badge_dict = {}
#         user = User.objects.get(pk=userid).username
#         badge_dict[user] = [item['badgeType'] for item in badgeModel.objects.filter(userid_id=userid).values('badgeType')]
#         badge_list.append(badge_dict)
#
#     #print(badge_list)
#     return HttpResponse(badge_list)
#
# def getBadgeDetails(request):
#     badge_list = badgeModel.objects.values('message','badgeType','userid_id');
#     list=[];
#     for item in badge_list:
#         list.append(item)
#     print(list)
#     return HttpResponse(list)

# def addUserToGroupsForm(request):
#     return render(request, 'app/group.html', {})
#
# def deleteAllItems(request):
#     brainstormNote.objects.all().delete()
#     imageModel.objects.all().delete()
#     Message.objects.all().delete()
#     random_group_users.objects.all().delete();
#     #userLogTable.objects.all().delete();
#     # groupInfo.objects.all().delete()
#
#     return HttpResponse('')
#
# def getAllUserList():
#     users_list = [str(user) for user in User.objects.all()]
#
#     return users_list;

# @csrf_exempt
# def broadcastBrainstormNote(request):
#
#     #pusher2.trigger(u'c_channel', u'cn_event', {u'name': request.POST['username'], u'message': request.POST['message']})
#     pusher2.trigger(u'c_channel', u'cn_event', {u'noteID': request.POST.get('brainstormID'), u'idea': request.POST.get('idea'),
#                           u'color': request.POST.get('color'), u'posTop': request.POST.get('posTop'), u'posLeft': request.POST.get('posLeft'),
#                           u'posted_by':request.POST['username'],
#                           u'update': 'false'})
#
#     note = brainstormNote(brainstormID=request.POST.get('brainstormID'), ideaText=request.POST.get('idea'),
#                           color=request.POST.get('color'),
#                           position_top=request.POST.get('posTop'), position_left=request.POST.get('posLeft'),
#                           posted_by=request.user)
#     note.save()
#
#     note = brainstormNote.objects.last()
#     print(note.id)
#     return JsonResponse({'id': note.id})

# def brainstormSave(request):
#
#     note = brainstormNote(brainstormID = request.POST.get('brainstormID'), ideaText = request.POST.get('idea'), color = request.POST.get('color'),
#                               position_top = request.POST.get('posTop'), position_left = request.POST.get('posLeft'), posted_by = request.user)
#     note.save()
#
#     note = brainstormNote.objects.last()
#     print(note.id)
#     return JsonResponse({'id': note.id,'errorMsg': True})
#
#
# def brainstormGet(request,brainstorm_id):
#
#     notes = brainstormNote.objects.filter(brainstormID=brainstorm_id)
#     notes = serializers.serialize('json', notes, use_natural_foreign_keys=True)
#
#     return JsonResponse({'success': notes})
#
#
# def brainstormUpdate(request, note_id):
#
#     note = brainstormNote.objects.filter(id=note_id)
#
#     pusher2.trigger(u'c_channel', u'cn_event',
#                     {u'noteID': note_id, u'idea': note[0].ideaText,
#                      u'color': note[0].color, u'posTop': request.POST.get('top'),
#                      u'posLeft': request.POST.get('left'),
#                      u'posted_by': request.POST.get('username'),
#                      u'update': 'true'})
#
#     brainstormNote.objects.filter(id=note_id).update(position_top=request.POST.get('top'),
#                                                      position_left=request.POST.get('left'))
#     return HttpResponse('')
#
# def brainstormDelete(request,note_id):
#
#     print('NOTEID', note_id);
#
#     b = brainstormNote.objects.get(pk=note_id)
#     # This will delete the Blog and all of its Entry objects.
#     print(b)
#     b.delete()
#
#     return HttpResponse('no delete?')