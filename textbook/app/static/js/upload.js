var host_url = window.location.host

$(function(){

        $("#file-upload").change(function(event){




                console.log("file changed");

                //get file information
                var form_data = new FormData($('#upload-img')[0]);
                //console.log('form_data', form_data)

                var img_data //variable to store the image

                //ajax call to post the uploaded image in the database and with successful entry show the image at the beginning of the list
                $.ajax({
                      type:'POST',
                      url:'http://'+ host_url +'/uploadImage/',
                      processData: false,
                      contentType: false,
                      async: false,
                      cache: false,
                      data : form_data,
                    success: function ( response ) {

                         //adjust the height and width of the image
                        $("#gallery-upload-div img").width('100%').height('auto');

                        //success message upon uploading an image
                        $('.upload-success-msg').css("display", "block");


                        enterLogIntoDatabase('upload image', 'Attemped gallery image upload' , 'Uploading Image was successful', global_current_pagenumber)

                    }, error: function(response){
                           enterLogIntoDatabase('upload image', 'Attemped gallery image upload' , 'Something went wrong while gallery image upload', global_current_pagenumber);
                           $( ".upload-success-msg-p" ).text( "Something went wrong, try again" );
                    }

                  });

            });


             //update preview image
            $("#file-upload").change(function(){
                readURL(this);
            });

            //event for success message close button
            $(".upload-success-msg-closebtn").on('click', function(){
//                var div = this.parentElement;
//                div.style.opacity = "0";
//                setTimeout(function(){ div.style.display = "none"; }, 600);
                  $('.upload-success-msg').css("display", "none");

            });

 });


    function readURL(input) {

        if (input.files && input.files[0]) {
            var reader = new FileReader();
                reader.onload = function (e) {
                    $('#default').attr('src', e.target.result);
                }
                reader.readAsDataURL(input.files[0]);
        }

    }





