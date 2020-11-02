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
var loadGalleryFeed = function(act_id){
    //clear the feed each time


    //based on the activity id, load the image, group member names, and set of comment made by the members
    gallery_act_id = act_id;
    //steps implemented
    //1. make an ajax call to get the image
    //2. display them
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
     });

    //get the image primary key which is set above
    var imagePk = $('input[name="image-db-pk"]').val();

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
    computationalModelMethod(logged_in, 'MB', gallery_act_id);

    // make the badge-option-div draggable
    $('#badge-option').draggable(draggableConfig);


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

      $('.badge-option-closebtn, .gallery-reward-closebtn').off().on('click', function(e){
             var className = $(this).attr('class');
             var remove = className.split('-').pop(); //will return closebtn
             var itemToClose = className.replace("-"+remove, "");
             //console.log(itemToClose);
             $("#"+itemToClose).css("display", "none");
      });

      $('.badgeRequest img').on('click', function(e){
            computationalModelMethod(logged_in, 'MB', gallery_act_id);
            //if the badge-option div is visible do nothing, else toggle
            if($('#badge-option').is(":visible")){
                //alert("visible");
            }else{
                //alert("not visible");
                $("#badge-option").css("display", "block");
            }
      });

        //this works both in khan academy and gallery divs

      $('.badge-option-display div').off().on('click', function(e){
        //set all background color to original
        $(this).siblings().css({backgroundColor: '#f4f4f4'});
        //set the selected background color to
        $(this).css({backgroundColor: '#d9d9d9'});
        var char = $(this).attr('data-char');
        global_char = char;
        //console.log(char);
        //get the badgeName
        global_badge_selected = $(this).children('span').text(); //gets saved into badge selected database
        console.log('gallery.js global_badge_selected :: ', global_badge_selected);
        var prompt;
        var sentence_opener;
        if(char === 'other'){
            prompt = "You can proceed without selecting any of the three options. Hit the close button and continue.";
            sentence_opener = "";
        }else{
            prompt = global_badgeList[char][0]['prompt'];
            sentence_opener = global_badgeList[char][0]['sentence_opener1'];
        }

        //set the prompt
        //console.log(global_badgeList[char][0]['prompt']);
        $('.badge-prompt-text p').text(''); //clear the p tag first
        $('.badge-prompt-text p').text(prompt);
        //set the sentence opener
        $('.badge-option-textarea textarea').text(''); //clear the p tag first
        $('.badge-option-textarea textarea').text(sentence_opener);


      });

        //copy button
      $('#gallery-copy-button').off().on('click', function(e){
            //if not badge is selected, and still clicks the <copy to the textbox> button
            if(global_badge_selected == '') {
                //no badge is selected
                message = 'Select a badge option first to copy a sentence starter.';
                displayNotifier("#gallery-notifier", message);
                return false;
            }

            //get the sentence starter from the text area
            var badge_textarea_value = $('.badge-option-textarea textarea').val();
            console.log(badge_textarea_value);
            //set it to the message textbox
            $('#image-msg-text').val(badge_textarea_value);

            //notify the user that the sentence starter is copied
            message = 'Your selected sentence starter is copied to the input box. Modify as needed.';
            displayNotifier("#gallery-notifier", message);

            //$("div#badge-option").css("display", "none");
            $(this).closest('div#badge-option').fadeOut();

      });

      //badge-option-div related button clicks -- end

      //reward-close-button click event
      $('.reward-div-close-btn').off().on('click', function(e){
             $("#gallery-reward-div").css("display", "none");
      });

} //end of galleryMsgBtnAction method

var postImageMessage = function () {

        //get the currently typed message
        var inputEl = $("#image-msg-text");
        var message = inputEl.val();

        if(!message){
            message = 'Your answer is too brief. Try writing a more specific answer.';
            displayNotifier("#gallery-notifier", message);
            enterLogIntoDatabase('Gallery Input Button Click', 'Gallery feed empty message input' , '', global_current_pagenumber);
            return false;

        }

        //if we come until here, there is a message
        //console.log('user message :: '+message)
        //check for the message length and get the length of the message
        var msg = message.split(" ");
        var lengthOfMsg = msg.length;
        //cif it is less than 7 words
        if(lengthOfMsg < 7){
            message = 'Your answer is too brief. Try writing a more specific answer.';
            displayNotifier("#gallery-notifier", message);
            enterLogIntoDatabase('Gallery Input Button Click', 'Gallery feed less than seven words message input' , '', global_current_pagenumber);
            return false;
        }


        //1. if the user has selected any of the three badge, we want to pass it to the server; else we want to skip checking
        if(global_badge_selected != 'None' && global_badge_selected != ''){
               if(global_badgeList[global_char][0]['sentence_opener1'] === message) {
                    message = 'Your message exactly matches with suggestion. Try adding your thoughts.';
                    displayNotifier("#gallery-notifier", message);
                    return false;
                }
                //user selected any of the three badges
                //2. save the selected badge in the database
                //save selected badge info to the database
                $.ajax({
                 type: 'POST',
                 url: '/saveBadgeSelection/',
                 data: {'username': logged_in, 'platform': 'MB', 'activity_id': gallery_act_id, 'title': '',
                    'selected_badge' : global_badge_selected},
                 success: function(response){
                        console.log(response);
                     }
                });
                //3. make the keyword matching API call and send the user message and selected badge in the server
                //to do make this a function in utility.js
                console.log('selected badge for gallery.js ::', global_badge_selected);
                $.ajax({
                    type: 'POST',
                    url: '/matchKeywords/',
                    data: {'username': logged_in, 'message': message, 'selected_badge' : global_badge_selected,
                    'platform': 'MB', 'activity_id': gallery_act_id},
                    success: function(response){
                        console.log(response);
                        console.log(response.isMatch); //returns true if match found, else false
                        if(response.isMatch){
                            console.log('inside the if else loop');
                            $("#gallery-reward").css("display", "block");
                            //set up the values
                            var imgName = global_badge_selected.toLowerCase();
                            $('#gallery-reward img').attr('src', '/static/pics/'+imgName+'.png');
                            $('#reward-div-selection').text('You earned the '+global_badge_selected+' badge!');
                            $('#reward-div-prompt').text(response.praiseText);

                        }
                 }
            });
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
