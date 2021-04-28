var host_url = window.location.host;
var ind_act_id; //digTextbook.js --> loadIndividualFeed --> postIndMessages --> database
var loaded_comments;

$(function(){
    //adding user input button event action
    teacherGalleryImageButtonAction();

});


//call this function when individual comment is loaded for a particular number of activity
var loadGalleryImage = function(act_id) {
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
            url:'http://'+ host_url +'/imageGalleryPerActivity/'+act_id,
            async: false, //wait for ajax call to finish
            success: function(data){

                data = JSON.parse(data.imageData);
                console.log('loadGalleryImage :: ', data)
                //console.log(data[0].fields['gallery_id']);

                $('#ind-feed').empty()
                //loop through the data to access each image and display the images
                var imageID = 1;
                $.each(data, function(key, value){



                    var image_holder = $('#ind-feed');

                    var li = $("<li/>").appendTo(image_holder);

                    image_src = value['url'];
                    image_pk = value['image_id'];
                    image_posted_by = value['posted_by'];
                    image_whiteboardGroupID = value['whiteboardGroupID']

                    var img = $('<img />').attr({
                        'id': 'gallaryImage'+image_pk,
                        'src': image_src
                    }).appendTo(li);

                    var span_badge = $('<span/>')
                            .addClass('image_num_span')
                            .text('uploaded by group' + image_whiteboardGroupID)
                            .appendTo(li)


                    imageID = imageID + 1;

                    img.on('click', function(event){

                        alert(imageID);
                    })

//                    var id=key+1;
//                    console.log(id);
//                    //we are only updating the a tags with the appropriate values;
//                    //update the image src in the a tag
//                    $("a[href='#slide-"+id).attr('data-imgSrc', image_src);
//                    //console.log($("a[href='#slide-"+id).attr('data-imgSrc'));
//                    //update the img primary key in the a tag
//                    $("a[href='#slide-"+id).attr('data-imgID', image_pk);
//                    //console.log($("a[href='#slide-"+id).attr('data-imgID'));

                });//end of the each loop
            }//end of the success for the post ajax

        });//end of the ajax call

        //step #3 is done below
        //display the comments of the first image, clear the feed first to remove any previous additions
        //$('#ind-feed').empty();
//
        //get the primary key of the first image from the a tag
//




} //end of loadIndividualFeed method


var teacherGalleryImageButtonAction = function(){


} //end of teacherGalleryImageButtonAction method








