var global_ka_url;
var ka_act_id;

$(function(){

    ka_img_upload_display();

    ka_img_uplaod();

    ka_response_save();

 });

var load_ka_card = function(act_id, video_url) {

    global_ka_url = video_url;
    ka_act_id = act_id;

    //this method is defined in utility.js
    computationalModelMethod(logged_in, 'KA', act_id);

    enterLogIntoDatabase('Khan Academy Card Click', 'Khan Academy Card Load' , '', global_current_pagenumber);

}

// display img upload option if a student selects 'answer' from the radio button
var ka_img_upload_display = function () {
    //capture the radio button response

    //if it is 'answer' display the image upload
}

//capture whether a student uploaded an image, and complete
//this will be similar to the method in upload.js
//make an ajax call to uploadKAImage
var ka_img_uplaod = function(){

}

// capture students' response and save it in the database when pressed submit
var ka_response_save = function(){

    //detect when submit button is pressed, check for conditions, and then save
    $('#ka-submit').off().on('click', function(event){

        //get the response from the text area
        var ka_response = $('#KAAnswer').val();

        //save selected badge info to the database
        $.ajax({
         type: 'POST',
         url: '/saveKApost',
         data: {'username': logged_in, 'platform': 'KA', 'activity_id': ka_act_id, 'title': global_ka_url,
            'response' : ka_response},
         success: function(response){
                console.log(response);
             }
        });

        enterLogIntoDatabase('KA Bagde Copy Button Click', 'Button Click' , global_badge_selected, global_current_pagenumber);

    });
 }

