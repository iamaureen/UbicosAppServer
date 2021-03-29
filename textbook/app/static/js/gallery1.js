
var host_url = window.location.host
var logged_in = ''
var totalPhoto
var groupArray = ['A', 'B','C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
var middleGroupDiscussion = 'no'
var random_group_list = ''

usernames_array_gallery = ["giraffe", "raccoon", "ant", "tiger", "sheep", "deer", "panda", "liger", "fox", "hippo", "alligator",
                       "dog", "dolphin", "eagle", "zebra", "rabbit", "bear","monkey", "leopard", "frog", "squirrel", "elephant",
                       "bee", "duck", "kangaroo", "penguin", "fish","bat", "lion", "AW", "user1", "user2"];

username_groupID_gallery = ['A', 'A', 'B', 'B', 'B', 'C', 'C', 'C', 'D', 'D', 'D', 'E', 'E', 'E', 'F', 'F', 'F','G', 'G',
                        'G', 'H', 'H', 'H', 'I', 'I', 'I','J', 'J', 'J', 'K', 'K', 'K']

$(function(){

    getLoggedUserName();

    //channel for individual image message
     var pusher_gallery = new Pusher('f6bea936b66e4ad47f97',{
        cluster: 'us2',
        encrypted: true
     });

    //subscribe to the channel you want to listen to
    var my_channel = pusher_gallery.subscribe('b_channel');

    my_channel.bind("bn_event", function (data) {

        //message entered by the current user
        console.log('(server)', data.imageid)
        console.log('(local)', $("input[name='image-db-pk']").val())

        //if student commenting on one image is the same as the other user is viewing show the comment else don't show
        if(data.imageid == $("input[name='image-db-pk']").val())
        {
            //  add in the individual image discussion thread itself
            var li = $("<li/>").appendTo("#image-feed");

            //console.log ('message posted by', data.name);
            //console.log('logged in username (outside):: ', logged_in);
            if(logged_in == data.name){
                   li.addClass('message self');
            }else{
                   li.addClass('message');
            }

            var div = $("<div/>").appendTo(li);
            div.addClass('user-image');

            var span = $('<span/>', {
                text: data.name}).appendTo(div);

             var p = $('<p/>', {
                    text: data.message}).appendTo(li);

            var div_msg = $("<div/>").appendTo(li);
            div_msg.addClass('msg-timestamp');

             var span_timestap = $('<span/>', {
                            text: "add timestamp"}).appendTo(div_msg);


        }


        // Scroll panel to bottom
        //var imageFeedParent = $('#image-feed').closest('.row');
        //imageFeedParent.scrollTop(imageFeedParent[0].scrollHeight);


    });


     //add event listener to the chat button click
    $("#image-msg-send-btn").off().click(function(e){
            //stop page refreshing with click
            e.preventDefault();

            postImageMessage();

        })



        $('#image-msg-text').keypress(function(e){
            if (e.which == 13) {
                postImageMessage();
                return false; 
            }
        });


        //previous image button
        $(".previous-image").click(function(e){
          card_extension();
            e.preventDefault();

            var val = $('input[name=image-index]').val() - 1
            if(val<0)  {
                return !$(this).attr('disabled'); //disable when reached to last image

            }

            $('.section input[name="image-index"]').attr('value', val)
            //console.log('previous image index:: ', val)
            var prev_img = $('#gallery li').eq(val).children('img')[0]
            //console.log($(prev_img))
            openImageView($('#gallery-panel'), $(prev_img));

            enterLogIntoDatabase('image navigation click', 'gallery previous image view click' , 'total photo '+totalPhoto, current_pagenumber)

        })

        //next image button
        $(".next-image").click(function(e){
            card_extension();
            e.preventDefault();

            var val = eval($('input[name=image-index]').val()) + 1

            //console.log('total photo :: ', totalPhoto);
            if(val>=totalPhoto){
                return !$(this).attr('disabled'); //disable when reached to last image
            }

            $('.section input[name="image-index"]').attr('value', val)
            //console.log('previous image index:: ', val)
            var prev_img = $('#gallery li').eq(val).children('img')[0]
            //console.log($(prev_img))
            openImageView($('#gallery-panel'), $(prev_img));

            enterLogIntoDatabase('image navigation click', 'gallery next image view click' , 'total photo '+totalPhoto, current_pagenumber)

        })

        //back to gallery from single image view
        $("#backToGallery").click(function(e){
            $("#gallery-image-user-name").remove();
            $("#gallery-image-group-member").remove();
            e.preventDefault();
            enterLogIntoDatabase('back to gallery button click', 'gallery back view click' , 'total photo '+totalPhoto, current_pagenumber)
            $("#single-image-view").hide()
            //card_extension_close();
            $("#gallery-panel").show()
        })

        //camera click user log
        $('.openCamera').click(function(e){
            enterLogIntoDatabase('camera select', 'camera to take photo' , 'none', current_pagenumber)
        })

 });

 function showImageInGallery(data){

       img_data = data;
       //console.log(img_data)

       $('#gallery').empty();

       $.each(img_data, function(key, value){ //
             //console.log(value)
             var obj = jQuery.parseJSON(value);
             console.log('showgallery from gallery.js',obj)

             if(obj.length === 0) return; //continue;

             //TODO: obj can have multiple image; current code handles only one image
             //var index = obj.length-1; //will show the latest image; index = 0 will show the first image

        $.each(obj, function(index, value){
             var groupID = groupArray[obj[index].fields['group_id']-1];
             var li = $("<li/>").appendTo("#gallery");

             if(logged_in == obj[index].fields['posted_by'][0]){

             //adding image delete span on the image
             var span = $('<span/>')
                .addClass('object_delete')
                .appendTo(li);

             var img = $('<img/>', {
               src : 'http://'+ host_url +'/media/'+obj[index].fields['image'] })
               .css({opacity:1.0})
               .appendTo(li);

             var span_badge = $('<span/>')
                    .addClass('badge')
                    .text(groupID)
                    .appendTo(li);

             //add delete button functionality
             var closeBtn = $('<span class="object_delete"></span>');
               closeBtn.click(function(e){
                    //card_extension_close();
                    e.preventDefault();
                    //get ID of the deleted note
                    var deletedImageID = value.pk;
                    console.log('deleted image id :: ', deletedImageID);
                    $(this).parent().remove(); //remove item from html

                    enterLogIntoDatabase('delete image', 'image delete from gallery' , 'image-delete-'+deletedImageID, 111)


                          //delete note from database
                            $.ajax({
                                type:'POST',
                                url:'/gallery/del/'+deletedImageID,
                                async: false, //wait for ajax call to finish,
                                success: function(e){
                                    console.log(e)
                                    //TODO: add user log

                                }
                            })


                            return false;
                        });

                    li.append(closeBtn);

                     }else{

                       //just add others image to the gallery
                       var img = $('<img/>', {
                       src : 'http://'+ host_url +'/media/'+obj[index].fields['image'] }).appendTo(li);

                        var span_badge = $('<span/>')
                                .addClass('badge')
                                .text(groupID)
                                .appendTo(li);

                    }

                 // Add clickhandler to open the single image view

                    img.on('click', function(event){

                       enterLogIntoDatabase('gallery image view', 'gallery individual image view' , 'image-select-id-'+value.pk , 111)

                       //console.log($(this).parent().siblings().length); //+1 gives me the total number of images in the gallery
                       totalPhoto = $(this).parent().siblings().length+1;

                       //use the following value to navigate through the gallery
                       //console.log($(this).parent().index()) //gives the index of li within the ul id = gallery
                       $('.section input[name="image-index"]').attr('value', $(this).parent().index())

                       openImageView($('#gallery-view'), $(this));


                     });


         });

        //reverse the image order
        var list = $('#gallery');
        var listItems = list.children('li');
        list.append(listItems.get().reverse());

    });

 }

    function readURL(input) {

        if (input.files && input.files[0]) {
            var reader = new FileReader();
                reader.onload = function (e) {
                    $('#default').attr('src', e.target.result);
                }
                reader.readAsDataURL(input.files[0]);
        }

    }

    //function called from digTextBook.js

     function postImageMessage(){

        //get the currently typed message
        var inputEl = $("#image-msg-text");
        var message = inputEl.val();
        if(!message){
        //empty;
            //TODO: display a message for students
            //entry into user log -- TODO fix the language
            enterLogIntoDatabase('input button click', 'image-feed empty message input' , message, current_pagenumber)
            return;
        }
        //console.log('user message :: '+message)

        //get the user name who posted
        var user_name = $("input[name='username']").val()
        //console.log(user_name);

        //console.log("call show prompt here")
        showPrompt(message, "gallery");

        //get the gallery id of the image
        var gallery_id = $("input[name='act-id']").val();
        //console.log('image gallery id :: ', gallery_id)

        var imagePk = $("input[name='image-db-pk']").val();
        //console.log('image pk :: ',imagePk)


        enterLogIntoDatabase('input button click', 'image-feed message input' , message, current_pagenumber)

        //posts student comment in database - can be extracted using image primary key.
        $.post({
            url: '/ajax/imageComment/',
            data: {
            'username': user_name,
            'message':  message,
            'imagePk': imagePk,
            'discussion-type': middleGroupDiscussion,
            },
            success: function (data) {
                //empty the message pane
                $("input[name='image-msg-text']").val('');
                //inputEl.prop('disabled', false);
            },
            error: function(data){
                //inputEl.prop('disabled', false);
            }
        });

    }




function viewDiv(view, number_of_group){

    //clear the individual image username span text
    $("#gallery-image-user-name").remove();
    $("#gallery-image-group-member").remove();


    //class means user upload - specific user will click - so we know the id
    if(view == "class"){
        $('#gallery-user-submission').show();
        //$('#openCamera').show();
        $('#gallery-view-only').show();
        console.log("my group is (gallery.js) ", number_of_group)
        displayGallery(0, number_of_group);

    //comment means user accessing other groups image, should not see their own - any user will click it - so we need to know the id
    }else if(view == "comment"){
        $('#gallery-user-submission').hide();
//        $('#openCamera').hide();
        $('#gallery-view-only').show();

        //console.log($('input[name="act-id"]').val())
        var group_id_user
        //get the group id based on the user
        $.ajax({
            type:'GET',
            url:'http://'+ host_url +'/getGroupID/'+$('input[name="act-id"]').val(),
            async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
            success: function(e){
                group_id_user = e;
            }
        })
        //1 means comment view
        displayGallery(1, group_id_user);
    }
 }


function displayGallery(view, groupValue){


        //get the gallery ID - passed from digTextBook.js to input field
        //console.log('gallery-id, ', $("input[name='act-id").val());
        var gallery_id = $("input[name='act-id']").val();

        console.log("displaying gallery #gallery id", gallery_id)
        console.log("displaying gallery #group id",groupValue)
        console.log('/getImage/'+view+'/'+gallery_id+'/'+groupValue)


        //get images from database for a specific gallery for specific group - 0 means whole class
        $.ajax({

           type:'GET',
           url:'http://'+ host_url +'/getImage/'+view+'/'+gallery_id+'/'+groupValue, //get all the image for the particular group
           success: function(response){

           //TODO: update user with a 'success' message on the screen

           img_data = response.success;
           var obj = jQuery.parseJSON(img_data);
           //random_group_list = response.random_group_list; //this is a list
           random_group_list = capitalize_name(response.random_group_list); //this is a list

           //console.log(img_data)

           //remove previous added items and start afresh
           $('#gallery').empty();

           $.each(obj, function(key,value) {

               //console.log(value.fields) //gives all the value
               // console.log(value.fields['image']); //image field in the model
               //console.log(groupArray[value.fields['group_id']-1]); //group id of the user who uploaded it

               // console.log(logged_in, value.fields['posted_by'][0])
               // console.log('primary id::',value.pk)
               // console.log('total number of images: ', obj.length)

               var groupID = groupArray[value.fields['group_id']-1];

               var li = $("<li/>").appendTo("#gallery"); //<ul id=gallery>
               if(logged_in == value.fields['posted_by'][0]){
                   //adding image delete span on the image
                   var span = $('<span/>')
                        .addClass('object_delete')
                        .appendTo(li);

                   var img = $('<img/>', {
                   src : 'http://'+ host_url +'/media/'+value.fields['image'] })
                   .css({opacity:1.0})
                   .appendTo(li);

                   var span_badge = $('<span/>')
                            .addClass('badge')
                            .text(groupID)
                            .appendTo(li);

                  //add delete button functionality
                   var closeBtn = $('<span class="object_delete"></span>');
                   closeBtn.click(function(e){
                        //card_extension_close();
                        e.preventDefault();
                        //get ID of the deleted note
                        var deletedImageID = value.pk;
                        console.log('deleted image id :: ', deletedImageID);
                        $(this).parent().remove(); //remove item from html

                        enterLogIntoDatabase('delete image', 'image delete from gallery' , 'image-delete-'+deletedImageID, 111)

                        //delete note from database
                        $.ajax({
                            type:'POST',
                            url:'/gallery/del/'+deletedImageID,
                            async: false, //wait for ajax call to finish,
                            success: function(e){
                                console.log(e)
                                //TODO: add user log

                            }
                        })


                        return false;
                    });

                    li.append(closeBtn);

                }else{

                   //just add others image to the gallery
                   var img = $('<img/>', {
                   src : 'http://'+ host_url +'/media/'+value.fields['image'] }).appendTo(li);

                    var span_badge = $('<span/>')
                            .addClass('badge')
                            .text(groupID)
                            .appendTo(li);

                }

               // Add clickhandler to open the single image view
               img.on('click', function(event){

                   enterLogIntoDatabase('gallery image view', 'gallery individual image view' , 'image-select-id-'+value.pk , 111)

                   //console.log($(this).parent().siblings().length); //+1 gives me the total number of images in the gallery
                   totalPhoto = $(this).parent().siblings().length+1;

                   //use the following value to navigate through the gallery
                   //console.log($(this).parent().index()) //gives the index of li within the ul id = gallery
                   $('.section input[name="image-index"]').attr('value', $(this).parent().index())

                   openImageView($('#gallery-view'), $(this));


               });

            });

            //reverse the image order
            var list = $('#gallery');
            var listItems = list.children('li');
            list.append(listItems.get().reverse());

        }

    });

}


var openImageView = function(galleryView, image){
    //card_extension();

    var singleImageViewer = $('#single-image-view');

    // Toggle views: Display or hide the matched elements.
    $('.gallery-panel', galleryView).toggle();

    // Get image element and add it to the DOM
    var image = image.clone();
    image.css({"margin-top":"15px"})

    //hovering effect-start
    image.hover( function () {
    $(this).css({ "-webkit-transform": "scale(1.5)",
           "transform":"scale(1.5) " ,
           "transition":"transform 0.25s ease"
           });
    }, function(){ //remove hovering effect
        $(this).css({ "-webkit-transform": "scale(1)",
               "transform":"scale(1)" ,
               "transition":"transform 0.25s ease"});
    });
    //hovering effect-end

    //remove previous single image before adding new one
    $('.section').children('img').remove();


    $('.section', singleImageViewer).append(image);

    //get image location from image object
    var image_location = image.attr('src').toString();

    //get image file name
    image_filename = image_location.split('/').pop()
    //console.log(image_filename)

    //get ID using filename
    var imageID = '';
    var imagePostedBy = ''
    $.ajax({
        type:'GET',
        async: false,
        url:'/getImageID/'+image_filename+'/',
        success: function(data){
            var image_data = jQuery.parseJSON(data.imageData);
            //console.log('inside openImageView :: ',image_data)
            imageID = image_data[0].pk;
            //console.log('image primary id (openImageView) :: ', imageID);
            imagePostedBy = image_data[0].fields["posted_by"][0]
            //console.log('image posted by (openImageView) :: ', imagePostedBy);
        }
    })

      var get_user_group_id
            $.ajax({
                type:'GET',
                url:'http://'+ host_url +'/getGroupID/'+$('input[name="act-id"]').val(),
                async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
                success: function(e){
                    get_user_group_id = e;
                    console.log("@@@@,", e)
                }
            });



      var val = $('input[name=image-index]').val() - 1
          if(val<0)  {
                $(".previous-image").css("opacity", ".2");
                console.log("previous arrow is disabled");
          }
          else{
               $(".previous-image").css("opacity", "1");
          }

      var val = eval($('input[name=image-index]').val()) + 1

            //console.log('total photo :: ', totalPhoto);
            if(val>=totalPhoto){
                $(".next-image").css("opacity", ".2");
                console.log("next arrow is disabled");
            }
            else{
                $(".next-image").css("opacity", "1");
            }


    //with each click update the input
    $('.section input[name="image-db-pk"]').attr('value', imageID)
    //update feed

    //clear update feed with new image
    $('#image-feed').empty();


   var updateImageURL
    if(middleGroupDiscussion == 'yes'){
        updateImageURL = '/updateDiscussionImageFeed/'+activity_id
    }else{
        updateImageURL = '/updateImageFeed/'+imageID
    }

    if(logged_in == 'AW'){
        updateImageURL = '/updateDiscussionImageFeedTeacherVersion/'+activity_id+'/'+random_group_id
    }

     //update discussion feed with each image
     $.ajax({
         type: 'GET',
         url: updateImageURL, //get image comment using primary id
         success: function(response){

                console.log(response)

                var logged_in_user = response.username //passed from views.py - updateFeed

                msg_data = response.success
                var obj = jQuery.parseJSON(msg_data);

                //console.log(obj)

                $.each(obj, function(key, value){

                    //  add in the thread itself
                    var li = $("<li/>").appendTo("#image-feed");
                    if(value.fields['posted_by'][0] == logged_in_user){
                        li.addClass('message self');
                    }else{
                        li.addClass('message');
                    }

                    var div = $("<div/>").appendTo(li);
                    div.addClass('user-image');

                    var span = $('<span/>', {
                        text: value.fields['posted_by'][0]}).appendTo(div);


                     var p = $('<p/>', {
                            text: value.fields['content']}).appendTo(li);

                    var div_msg = $("<div/>").appendTo(li);
                    div_msg.addClass("msg-timestamp");

                    var span_timestap = $('<span/>', {
                        text: "add timestamp"}).appendTo(div_msg);

                    });




                 var element = document.getElementById("image-feed");
                 element.scrollTop = element.scrollHeight;
                 // Scroll panel to bottom
                 //var imageFeedParent = $('#image-feed').closest('.row');
                 //imageFeedParent.scrollTop(imageFeedParent[0].scrollHeight);
             }
     });


};

//called from digTextBook.js
function populateTeacherViewDiv(list){

    $('.teacher-view').empty();
    $('#gallery-view-only').hide();
    $('#gallery-group-heading').text('Digital Discussion Group Lists')

    for(var i of list) {
        //can use break;
        //console.log(i); //note i returns value
        var li = $("<li/>").appendTo('.teacher-view');
        li.append('<a href="#" class="groupLink" data-random-group-id='+i+'> Group ' + i + '</a>'); //click detect handled in teacherindex.js
    }

    //
}


function getLoggedUserName(){

        //get the logged in user
        $.ajax({
            type:'GET',
            url:'http://'+ host_url +'/getUsername/',
            async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
            success: function(e){
                logged_in  = e.name
                //console.log('logged in username (inside) :: ', logged_in)
            }
        })

}

var capitalize_name = function(list){
    var return_list = []
    jQuery.each(list, function(index, item) {
    // do something with `item` (or `this` is also `item` if you like)
        cap_item = item.substr(0,1).toUpperCase()+item.substr(1);
        return_list.push(cap_item)
    });

    return return_list;

}





