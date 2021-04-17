var gallery_act_id;
var global_badge_selected = '';
var global_char = ''; //to be used in postImageMessage
var gallery_group_list

$(function(){

    galleryMsgBtnAction();
    realTimeMsgTransfer();

 });

//this method is used to load digital discussion gallery feed
//called from digTextBook.js
var loadGalleryFeed=function ( act_id ) {

    //clear the feed each time

    //based on the activity id, load the image, group member names, and set of comment made by the members
    gallery_act_id = act_id;
    //steps implemented
    //1. make an ajax call to get the image
    //2. display the image
     $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/getGalleryImage/'+act_id, //this should return image outside this group randomly
        async: false, //wait for ajax call to finish
        success: function(data){
            //console.log(data);
            //if no image is uploaded for this activity, data will be empty then we don't have
            //any id or src to attach to the image
            if(data){
                //display a random image which outside the group
                imageInfo = data.imageData;
                //console.log('line 27 :: ', imageInfo);
                //set the src
                $('.section img').attr('src','/media/'+imageInfo['url']);
                //set the primary key
                $('input[name="image-db-pk"]').val(imageInfo['imagePk']);
            }

        }
     } );
    
    // zoomInImage()

    //get the image primary key which is set above
    var imagePk=$( 'input[name="image-db-pk"]' ).val();
    console.log( "imagePk", imagePk)

    //todo if imagePk is null i.e., no image is uploaded for this activity id, then it generates an error, handle it
    //3. make an ajax call to get the comments and update discussion feed with each image
     $.ajax({
         type: 'GET',
         url: '/updateImageFeed/',
         data: {'act_id': gallery_act_id, 'img_id': imagePk}, //get image comment using primary id for this activity
         success: function(response){
                //console.log(response) //this returns the image comment img_msg as well as the group-member names

                //clear the image feed so it doesn't add to the previously loaded feed
                $('#image-feed').empty();

                //if there is no image, then there is no comment
                if(response.success) {
                    msg_data = response.success;
                    var obj = jQuery.parseJSON(msg_data);
                    //console.log(obj)

                    //iterate through the response data to display the comments in the interface
                    $.each(obj, function(key, value){
                        //this method is defined in individual_gallery.js
                        //defined in utility.js
                        time = formatTime(value.fields['posted_at'])
                        //console.log(time);
                        buildFeedwithMsgs(value.fields['content'], "#image-feed",value.fields['posted_by'][0], time);
                    });

                    //scrollbar
                    var element = document.getElementById("image-feed");
                    element.scrollTop = element.scrollHeight;
                }


                //update group member ingo
                group_member_list = response.group_member;
                //also update the global variable which will check real time messaging
                gallery_group_list = response.group_member;
                //console.log(group_member_list)
                total_member = group_member_list.length
                //update number span
                $('.gallery-group-user span').text(total_member);
                //update the user names
                $.each( group_member_list, function(key, value ){
                            //console.log(value);
                            i=key+1;
                            $('li#gallery-member-'+i).text(value);
                        });

             }
     });

    //https://stackoverflow.com/questions/18045867/post-jquery-array-to-django
    //4. call the computational model method to see whether the student will participate or not; display badge based on that
    //defined in utility.js
    //computationalModelMethod(logged_in, 'MB', gallery_act_id);

    //defined in utility.js
    promptText = getPrompt(logged_in, "MB", gallery_act_id);
    $('#gallery-prompt-text').text(promptText);




    enterLogIntoDatabase('Gallery Card Icon Click', 'Gallery Card Load' , '', global_current_pagenumber);
} //end of loadGalleryFeed method


var galleryMsgBtnAction = function(){

    //adding event listener to the chat button click
    $("#image-msg-send-btn").off().on('click', function(e){
        e.preventDefault();
        //alert("im clicked");
        postImageMessage();

    });


    //adding event lister for 'enter' button
    $('#image-msg-text').off().on('keypress', function (e) {
        if (e.which == 13) {

            postImageMessage();
            return false;
        }
      });

      //badge-option-div related button clicks -- start

      //reward-close-button click event
      $('.gallery-reward-closebtn').off().on('click', function(e){
             $("#gallery-reward").css("display", "none");
             $("#gallery-prompt").css("display", "none");
      });

      $('.gallery-prompt-button').off().on('click', function(e){
             $("#gallery-prompt").toggle();

      });



} //end of galleryMsgBtnAction method

var postImageMessage = function () {

        //get the currently typed message
        var inputEl = $("#image-msg-text");
        var message = inputEl.val();

        if(!message){
            //message = 'Your answer is too brief. Try writing a more specific answer.';
            //displayNotifier("#gallery-notifier", message);
            enterLogIntoDatabase('Gallery Input Button Click', 'Gallery feed empty message input' , '', global_current_pagenumber);
            return false;

        }

        //get the user name who posted
        var user_name = $("input[name='username']").val()
        console.log('logged in user when posting in the gallery from client side', user_name);

        var imagePk = $("input[name='image-db-pk']").val();
        console.log('image pk gallery image comment is making :: ',imagePk)

        //posts student comment in database - can be extracted using image primary key.
        $.post({
            url: '/imageComment/',
            data: {
            'username': user_name,
            'message':  message,
            'imagePk': imagePk,
            'activityID': gallery_act_id,
            },
            success: function (data) {
                //empty the message pane
                $("input[name='image-msg-text']").val('');


                //populate the reward-div
                if(data.praiseText != "empty"){
                    $("#gallery-reward").css("display", "block");
                    $('#reward-div-selection').text("You earned the " + data.rewardType + " badge!");
                    $('#reward-div-prompt').text(data.praiseText);
                    console.log(data.rewardType.toLowerCase())
                    $('#gallery-reward img').attr('src','/static/pics/'+data.rewardType.toLowerCase()+'.png');
                }

                if(data.promptInMiddle){
                    console.log("true")
                    promptText = getPrompt(logged_in, "MB", gallery_act_id);
                    $("#gallery-prompt").css("display", "block");
                    $('#gallery-prompt-text').text(promptText);
                }





            },
            error: function(data){
                //inputEl.prop('disabled', false);
            }
        });

}// end of postImageMessage method

var realTimeMsgTransfer = function(){

    //channel for individual image message
    var pusher_gallery = new Pusher('f6bea936b66e4ad47f97',{
        cluster: 'us2',
        encrypted: true
    });

    //subscribe to the channel you want to listen to
    var my_channel = pusher_gallery.subscribe('b_channel');

     my_channel.bind("bn_event", function (data) {

        console.log('during real time conversation through the channel in the gallery.js', data.name);

        //if the element is not found in the list, returns -1
        //if found will return the index
        //so, if the data.name (user who is posting) is in the gallery_group_list continue else do nothing
        if(jQuery.inArray(data.name, gallery_group_list) !== -1){
            //console.log('(server)', data.imageid)
            //console.log('(local)', $("input[name='image-db-pk']").val())
            //if student commenting on one image is the same as the other user is viewing show the comment else don't show
            if(data.imageid == $("input[name='image-db-pk']").val()){

                //defined in utility.js
                time = getCurrentTime();
                console.log('from gallery.js', time);

                //defined in utility.js
                buildFeedwithMsgs(data.message, "#image-feed", data.name, time);

            }
        }

    });

}// end of realTimeMsgTransfer method


var displayNotifier = function(container, message){

    $(container).text('');
    $(container).text(message);
    $(container).hide().slideDown().delay(5000).fadeOut();

}
