
from django.contrib.auth import views as auth_views
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.login_form, name='login_form'),
    url('login', views.login, name='login'),
    url('logout', auth_views.LogoutView.as_view()),
    url('registerUser',views.registerUser),
    url('createBulkUser',views.createBulkUser),
    url('groupAdd', views.groupAdd),
    url('index', views.index, name='index'),
    url('getUsername', views.getUsername),
    url('getGroupID/(?P<act_id>\d+)', views.getGroupID),
    #urls for upload image tool
    url('uploadImage', views.uploadImage, name='uploadImage'),
    url('uploadKAImage', views.uploadKAImage, name='uploadKAImage'),
    #urls for individual image tool
    url('getIndividualImages/(?P<act_id>\d+)', views.getIndividualImages),
    url('saveIndividualCommentMsgs', views.saveIndividualCommentMsgs),
    url('getIndividualCommentMsgs/(?P<imageId>\d+)', views.getIndividualCommentMsgs),
    #urls for gallery image tool
    url('getGalleryImage/(?P<act_id>\d+)', views.getGalleryImage),
    url('imageComment', views.broadcastImageComment),
    url('updateImageFeed/', views.updateImageFeed),
    #urls for self-gallery tool
    url('getSelfGalleryContent/(?P<act_id>\d+)', views.getSelfGalleryContent),
    #urls for student characteristic
    url('saveCharacteristic', views.saveCharacteristic),
    url('getCharacteristic', views.getCharacteristic),
    #url for chat tool
    url(r'^ajax/chat/$', views.broadcast),
    url('updateFeed/(?P<id>\d+)', views.updateFeed),
    #url for khan academy tool
    url('submitKAAnswer',views.submitKAAnswer),

    #badge related urls
    url('insertSupportInfo',views.insertSupportInfo), #used by gallery.js, kaform.js
    url('getBadgeNames',views.getBadgeNames), #used by gallery.js, kaform.js
    url('getPrompt', views.getPrompt), #used by gallery.js, kaform.js
    url('getBadges', views.getBadges), #used by gallery.js, teachable agent.js

    #computational model urls
    url('computationalModel', views.computationalModel),
    url('getCondition', views.getCondition),


    #computational model urls
    url('getCurrentUserGroupID/(?P<act_id>\d+)', views.getCurrentUserGroupID),

    #url('studentID/(?P<std_id>\d+)',views.getAllStudentInfo),
    url('createUser',views.createUser),
    url('userlog', views.userlog),
    #url('addUserToGroups',views.addUserToGroupsForm),

    #urls for different tool utility
    url('insertWhiteboardInfo',views.insertWhiteboardInfo),
    url('getWhiteboardURl/(?P<board_id>\d+)',views.getWhiteboardURl),
    url('insertKhanAcademyInfo', views.insertKhanAcademyInfo),
    url('matchPersonalityProfile', views.matchPersonalityProfile),
    url('saveEditedPersonality', views.saveEditedPersonality),


    # url('getGalleryPerID/(?P<gid>\d+)', views.getGalleryPerID),
    # url('getRandomGroupMemberList/(?P<gallery_id>\d+)', views.getRandomGroupMemberList),
    #url('brainstorm/save/',views.brainstormSave),
    # url('brainstorm/save/',views.broadcastBrainstormNote),
    # url('brainstorm/get/(?P<brainstorm_id>\d+)',views.brainstormGet),
    # url('brainstorm/update/(?P<note_id>\d+)/', views.brainstormUpdate),
    # url('brainstorm/del/(?P<note_id>\d+)', views.brainstormDelete),
    url('tableData/save/',views.tableEntriesSave),





    # url('parser',views.pageParser),
    #url('camera',views.camera),
    #url('randomDiscussionGroupCreate',views.random_discussion_group_generator),
    #url('getMediumGroupDiscussion',views.getMediumGroupDiscussion),
    # url('updateDiscussionImageFeed/(?P<gallery_id>\d+)',views.updateDiscussionImageFeed),
    # url('updateDiscussionImageFeedTeacherVersion/(?P<gallery_id>\d+)/(?P<group_id>\d+)/',views.updateDiscussionImageFeedTeacherVersion),
    #url('getRandomListData/(?P<gallery_id>\d+)/(?P<group_id>\d+)/',views.getRandomListData),
    #url('randomDiscussionList',views.randomDiscussionList),
    # url('getImageID/(?P<img_filename>[\w+._^%$#!~@,-]+)/', views.getImageID), #regular expression checker: https://regex101.com/r/iQ8gG4/1
    # url('getImagePerUser/(?P<act_id>\d+)/(?P<username>[\w+._^%$#!~@,-]+)/', views.getImagePerUser), #regular expression checker: https://regex101.com/r/iQ8gG4/1
    # url('gallery/del/(?P<img_id>\d+)', views.imageDelete),
    #url('getKAPerKAID/(?P<ka_id>[0-9]+)',views.getKAPerKAID),
    #url('checkKAAnswer/(?P<ka_id>\d+)',views.checkKAAnswer),
    #url('dashboardKAInfo/(?P<ka_id>\d+)',views.dashboardKAInfo),
    #badges
    # url('insertBadges',views.insertBadges),

    #url(r'^extensionlog/$', views.userLogFromExtenstion),
    # url('delete', views.deleteAllItems, name='activities'),
    #data analysis
    # url('dataToCSV',views.dataToCSV),
    # url('perUserDataExtract',views.perUserDataExtract),
    # url('getBadgeCount',views.getBadgeCount),
    # url('getBadgeDetails',views.getBadgeDetails),
    # url('getimageCommentCount',views.getimageCommentCount),
    # url('getimageCommentDetails',views.getimageCommentDetails),
    # url('getGeneralChatMsg',views.getGeneralChatMsg),
    # url('getkhanAcademyCount',views.getkhanAcademyCount),
    # url('getKhanAcademyDetails',views.getKhanAcademyDetails),

    #teacherdashboard
    # url('getGalleryTableTD/(?P<act_id>\d+)',views.getGalleryTableTD),
    # url('dashboardGalleryInfo/(?P<act_id>\d+)',views.dashboardGalleryInfo),
    # url('getDashboard',views.getDashboard),
    # url('getGalleryPerID/(?P<gid>\d+)',views.getGalleryPerID)


]