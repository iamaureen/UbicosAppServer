var host_url = window.location.host;
var ind_act_id; //digTextbook.js --> loadIndividualFeed --> postIndMessages --> database
var loaded_comments;

$(function(){
    //adding user input button event action
    individiualMsgBtnAction();

});


//call this function when individual comment is loaded for a particular number of activity
var loadIndividualFeed = function(act_id) {
//    //this method will load images from the current users' group members uploaded photo
//    //the messages associated with each photo is only visible to the current student
        ind_act_id = act_id;
//      steps to be implemented:
//      1. get all the images using the the current users group-mate info -- done in the server side
//      2. make a query to retrieve the images and send back to the client side -- done in the server side with the following ajax
//      3. display the first images along with any comments made -- done with the following ajax

        //this ajax completes the 1-2 steps
        $.ajax({
            type:'GET',
            url:'http://'+ host_url +'/getIndividualImages/'+act_id,
            async: false, //wait for ajax call to finish
            success: function(data){

                data = JSON.parse(data.imageData);
                //console.log('individual_gallery :: ', data)
                //console.log(data[0].fields['gallery_id']);

                //loop through the data to access each image and display the images
                $.each(data, function(key, value){
                    image_src = value['url'];
                    image_pk = value['image_id'];
                    image_posted_by = value['posted_by'];
                    var id=key+1;
                    //we are only updating the a tags with the appropriate values;
                    //update the image src in the a tag
                    $("a[href='#slide-"+id).attr('data-imgSrc', image_src);
                    //console.log($("a[href='#slide-"+id).attr('data-imgSrc'));
                    //update the img primary key in the a tag
                    $("a[href='#slide-"+id).attr('data-imgID', image_pk);
                    //console.log($("a[href='#slide-"+id).attr('data-imgID'));

                });//end of the each loop
            }//end of the success for the post ajax

        });//end of the ajax call

        //step #3 is done below
        //display the comments of the first image, clear the feed first to remove any previous additions
        $('#ind-feed').empty();
//
        //get the primary key of the first image from the a tag
        var imagePk = $("a[href='#slide-1").attr("data-imgID");
        //console.log('line 62 :: ', typeof(imagePk));
        if(imagePk !== "") {
            //console.log(imagePk);
            //get the src from the first a tag, set the img src, and display the image
            $('.slider img').attr("src", $("a[href='#slide-1").attr("data-imgSrc"));
            //add the img imgID to be used when saving comments in the database
            $('.slider img').attr("data-imgID", imagePk);
            //console.log($('.slider img').attr("data-imgID"))
            //get the comments
            retrieveComments(imagePk);
         }else{
            //if no image has been uploaded in this activity id, then imagePk can be null
            console.log('no image currently added');
         }




} //end of loadIndividualFeed method


var individiualMsgBtnAction = function(){
    //adding event listener to the chat button click
    $("#ind-msg-send-btn").off().on('click', function(e){
        e.preventDefault();
        postIndMessage();
        //alert($("input[name='ind-msg-text']").val());
    });

    //adding event lister for 'enter' button
    $('#ind-msg-text').off().on('keypress', function (e) {
        if (e.which == 13) {
         postIndMessage();
         //alert($("input[name='ind-msg-text']").val());
         return false;
        }
      });

    //todo add hovering effect

    //navigation button clicks and respective updates in the img src and imgID
    //image numbers navigation detection
     $('.slider a').off().on('click', function(event){
        //change the background color for currently selected number
        $('.slider a').removeClass('slider-image-selected');
        $(this).addClass('slider-image-selected');

        //update the feed with the image selection
        //1. with each click of the button empty the ind-feed first
        $('#ind-feed').empty();

         //2. get the selected images src from the a tag
         var imgSrC = $(this).attr('data-imgSrc');
         //console.log(imgSrC);
         //set the image src
         $('.slider img').attr("src", imgSrC);

        var imagePk = $(this).attr('data-imgID');

         if(imagePk !== "") {
            //console.log(imagePk);
            //3. set the imgID which can be used to save comment respective to this image
            $('.slider img').attr("data-imgID", imagePk);
            //4.update the feed
            retrieveComments(imagePk);
         }else{
            console.log('no image currently added');
         }

     });

} //end of individiualMsgBtnAction method

var postIndMessage = function (){

    //get the currently typed message
    var message = $("input[name='ind-msg-text']").val();

    if(!message){
        //message is empty;
        //entry into user log -- TODO fix the language
        enterLogIntoDatabase('input button click', 'image-feed empty message input' , message, global_current_pagenumber);
        return;
    }

    //get the user name who posted
    var user_name = $("input[name='username']").val()
    enterLogIntoDatabase('click', 'activity-feed message input' , message, global_current_pagenumber);

    //check which image is open, extract that image data attribute (image PK) and pass that with the data to the server
    var imagePk = $('.slider a.slider-image-selected').attr('data-imgID');

    if(imagePk == $('.slider img').attr('data-imgID')) {
        //just an additional verification that the selected image and displayed image are the same
        //console.log(imagePk);
    }else{
        //console.log(imagePk);
        console.log($('.slider img').attr('data-imgID'))
        console.log('not the same image, check');
    }


//    //triggers the event in views.py
    $.post({
        url:'/saveIndividualCommentMsgs',
        async: false,
        data: {
         'activityID': ind_act_id,
         'message': message,
         'imagePK': imagePk,
        },
        success: function (data) {
            //empty the message pane
            $("input[name='ind-msg-text']").val('');

            time = getCurrentTime();
            //display the message in the feed when posted
            buildFeedwithMsgs(message, "#ind-feed", logged_in, time);

        },
        error: function(){
            //inputEl.prop('disabled', false);
            $("input[name='ind-msg-text']").val('');
            alert("No image is associated with the selected number. Try a number that has an image with it.");

            return false;
        }
    });

} // end of postIndMessage method



var retrieveComments = function(imagePk){

    $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/getIndividualCommentMsgs/'+imagePk,
        async: false, //wait for ajax call to finish
        success: function(data){
              //display this data
              loaded_comments = JSON.parse(data.imageCommments); // converts from string type to array format
              console.log("when the page is loading :: ", loaded_comments);
              //console.log(jQuery.type(data));
              if(loaded_comments==0){//if no comment this data will be empty
                console.log("no comment in this photo", imagePk);
              }else{
                //show the first image comments with the loading of the images
                //console.log(loaded_comments[0].fields['content']);
                //TODO loop through loaded_comments to display all the messages; [0] only displays the first comment
                //defined in utility.js

                    $.each(loaded_comments, function(key, value){
                        //console.log(value['fields']['content']);
                        time = formatTime(value.fields['posted_at'])
                        buildFeedwithMsgs(value['fields']['content'], "#ind-feed",logged_in, time);
                    });

              }

        },
    });

} //end of retrieveComments (imagePk) method

//called for self-gallery
var loadSelfImageFeed = function(act_id) {

        //this ajax completes the 1-4 steps
        $.ajax({
            type:'GET',
            url:'http://'+ host_url +'/getSelfGalleryContent/'+act_id,
            async: false, //wait for ajax call to finish
            success: function(data){

                //console.log(data.success);
                if(jQuery.isEmptyObject(data.success)) {
                    //no image uploaded by the user for this activity id
                    //todo a message to the user
                }else{
                    var img_data = data.success['img_data'];
                    var img_msg = data.success['img_msg'];
                    //console.log(img_msg);

                    var imgID = img_data[0]['id'];
                    var imgSrc =img_data[0]['image'];

                    //update the image src
                    $('div#self-gallery-div img').attr('src','/media/'+imgSrc);
                    //update the img primary key
                    $('div#self-gallery-div img').attr('data-imgID', imgID);
                    //console.log($('div#self-gallery-div img').attr('data-imgID'));

                    //clear out previously loaded comments
                    $('#ind-comment-feed').empty();
                    //loop through the img msg data to access each commment and display under the images
                    $.each(img_msg, function(key, value){
                        //console.log(value);
                        //defined in utility.j
                        buildFeedwithMsgs(value['content'], "#ind-comment-feed",value['posted_by__username'],value['posted_at']);
                    });//end of the each loop
                }//end of the else

            }//end of the success for the post ajax

        });//end of the ajax call


}


