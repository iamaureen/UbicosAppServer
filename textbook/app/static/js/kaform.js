var global_ka_url;
var ka_act_id;

$(function(){

    ka_badge_form_Btn();

 });

var load_ka_card = function(act_id, video_url) {

    global_ka_url = video_url;
    ka_act_id = act_id;

    //this method is defined in utility.js
    computationalModelMethod(logged_in, 'KA', act_id);

    enterLogIntoDatabase('Khan Academy Card Click', 'Khan Academy Card Load' , '', global_current_pagenumber);

}

var ka_badge_form_Btn = function(){

    $('#ka-copy-button').off().on('click', function(event){


        var $temp = $("<input>");
        $("body").append($temp);
        text = $('.badge-option-textarea textarea').val();
        //todo not working, check later
        if (text === 'Select an option to get the sentence starter'){
            console.log('here');
            message = 'Select a badge option first to copy a sentence starter.';
            displayNotifier("#ka-notifier", message);
            return false; //we don't copy
        }
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();

        message = 'Your selected sentence starter is copied to the clipboard. Paste it Khan Academy and modify as needed.';
        displayNotifier("#ka-notifier", message);

        //get the selected badge
        console.log('kaform.js (line 43):: ', global_badge_selected);

        //save selected badge info to the database
        $.ajax({
         type: 'POST',
         url: '/saveBadgeSelection/',
         data: {'username': logged_in, 'platform': 'KA', 'activity_id': ka_act_id, 'title': global_ka_url,
            'selected_badge' : global_badge_selected},
         success: function(response){
                console.log(response);
             }
        });

        enterLogIntoDatabase('KA Bagde Copy Button Click', 'Button Click' , global_badge_selected, global_current_pagenumber);

    });
 }

