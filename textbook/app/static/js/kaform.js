var global_ka_url;
var ka_act_id;
var host_url=window.location.host;
var KA_imgID;

$( function () {

    ka_img_upload_display();

    ka_img_upload();

    ka_response_save();

    ka_button_action();

} );


var load_ka_card=function ( act_id, video_url ) {

    global_ka_url=video_url;
    ka_act_id=act_id;

     //defined in utility.js
    obj = getPrompt(logged_in, "KA", ka_act_id);

    $('#ka-prompt-text').text(obj['promptText']);
    $('#ka-prompt-so').text(obj['promptSO']);

    enterLogIntoDatabase( 'Khan Academy Card Click', 'Khan Academy Card Load', '', global_current_pagenumber );

}

$( "#ka-img-upload" ).hide();

// display img upload option if a student selects 'answer' from the radio button
var ka_img_upload_display=function () {
    //capture the radio button response
    $( function () {
        $( 'input:radio[name="ka-response-type"]' ).change( function () {
            if ( $( this ).val()=="answer a question" ) {
                //if it is 'answer' display the image upload
                $( "#ka-img-upload" ).show();
                $( "#ka-upload-img-form" ).show();
                $( "#default_ka_img_div" ).show();
            } else {
                //if it is 'question' do NOT display the image upload
                $( "#ka-img-upload" ).hide();
                $( "#ka-upload-img-form" ).hide();
                $( "#default_ka_img_div" ).hide();
            }
        } );
    } );




}

//capture whether a student uploaded an image, and complete
//this will be similar to the method in upload.js
//make an ajax call to uploadKAImage
var ka_img_upload=function () {

    //get file information


    $( "#ka_img_upload" ).change( function ( event ) {
        console.log( "file changed" );
        console.log( event )
        var form_data=new FormData( $( '#ka-upload-img-form' )[ 0 ] );
        console.log( "form_data", form_data );

        $.ajax( {
            type: 'POST',
            url: 'http://'+host_url+'/uploadKAImage/',
            processData: false,
            contentType: false,
            async: false,
            cache: false,
            data: form_data,
            success: function ( response ) {
                console.log( response );
                //success message
                $( '.ka-upload-success-msg' ).show();
                console.log(response.ka_imgID)
                KA_imgID = response.ka_imgID;

            }, error: function ( response ) {
                console.log("khan academy image fail to upload")
            }

        } );

    } );


    // update preview image
    $( "#ka_img_upload" ).change( function () {
        //console.log( this )
        ka_img_readURL(this);
    } );

}



function ka_img_readURL( input) {
    console.log( input.files )
    
    //console.log( input.files[ 0 ] )
    
    if ( input.files&&input.files[ 0 ] ) {
        var reader=new FileReader();
        reader.onload=function ( e ) {
            $( '#default_ka_img' ).attr( 'src', e.target.result );
        }
        reader.readAsDataURL( input.files[ 0 ] );
    }
}



// capture students' response and save it in the database when pressed submit
var ka_response_save=function () {

    //detect when submit button is pressed, check for conditions, and then save
    $( '#ka-submit' ).off().on( 'click', function ( event ) {

        //get the response type
        var ka_response_type=$( 'input:radio[name="ka-response-type"]:checked' ).val();
        console.log( ka_response_type )

        //get the response type
        var ka_response_type=$( 'input:radio[name="ka-response-type"]:checked' ).val();
        console.log( ka_response_type )

        //get the response from the text area
        var ka_response=$( '#KAAnswer' ).val();
        console.log( "ka_response:: ", ka_response );

        var wasChecked=$( this ).data( 'checked' )

        if ( !$( '.ka-radio' ).is( ':checked' ) ) {
            $( "#failure_text" ).text( "Please select an option!" )
            //$( '.upload-failure-msg' ).show();
            $(".upload-failure-msg").css("display", "block");

        } else if ( $( "#KAAnswer" ).val()=== "" ||$( "#KAAnswer" ).val()===undefined ) {
            console.log("KA input text is empty, show error message");
            $( "#failure_text" ).text( "Please enter text into the textbox!" )
            //$( '.upload-failure-msg' ).show();
            $(".upload-failure-msg").css("display", "block");
        }
        else {

            $( '.upload-failure-msg' ).hide();

            $.post({

               url:'/submitKAAnswer',
               async: false,
               data: {
                    'activity_id': ka_act_id,
                    'imgID': KA_imgID,
                    'response_type': ka_response_type,
                    'answer': ka_response,
                    },
               success: function(data){

                //populate the reward-div
                if(data.praiseText != "empty"){
                    $("#ka-reward").css("display", "block");
                    $('#ka-reward-div-selection').text("You earned the " + data.rewardType + " badge!");
                    $('#ka-reward-div-prompt').text(data.praiseText);
                    console.log(data.rewardType.toLowerCase())
                    $('#ka-reward img').attr('src','/static/pics/'+data.rewardType+'.png');


                }

                //clear the textarea and the radio button
                $( '#KAAnswer' ).val('');
                $('.ka-radio').prop('checked', false);
                $( '#default_ka_img' ).attr( 'src', API_URL.picsBase+"/default.png" );
                $(".ka-upload-success-msg").css("display", "none");

                $(".ka-submit-success").css("display", "block");


            }

            });


        }





        //event for failure message close button
        $( ".upload-failure-msg-closebtn" ).on( 'click', function () {
//            var div=this.parentElement;
//            div.style.opacity="0";
//            setTimeout( function () {div.style.display="none";}, 300 );
              $(".upload-failure-msg").css("display", "none");

        } );


        enterLogIntoDatabase( 'KA Form Submit Click', 'Button Click', global_badge_selected, global_current_pagenumber );


    } );
}

var ka_button_action = function(){

    $('.ka-prompt-button').off().on('click', function(e){
             $("#ka-prompt").toggle();
      });

     //reward-close-button click event
      $('.ka-reward-closebtn').off().on('click', function(e){
             $("#ka-reward").css("display", "none");
             $("#ka-prompt").css("display", "none");
      });

      //success msg close event
      $('.ka-upload-success-msg-closebtn').off().on('click', function(e){

            $(".ka-upload-success-msg").css("display", "none");
            $(".ka-submit-success").css("display", "none");
      })

      //copy button
      $('#ka-so-copy').off().on('click', function(e){

            //get the sentence starter from the text area
            var sentOpener = $('#ka-prompt-so').text();
            //console.log(sentOpener)p
            //set it to the message textbox
          $( '#KAAnswer' ).text( sentOpener );
          $( ".ka-copy-success-msg" ).show( 0 ).delay( 5000 ).hide( 0 );
          



      })

}




