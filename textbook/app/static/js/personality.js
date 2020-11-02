var host_url = window.location.host

$(function(){


});


var setupPersonality = function(){
    //alert('load init personality from the survey measures');

    $(".initPersonality").toggle();
    $(".personalityProfiles").toggle();
    //match the closest profile --
    $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/matchPersonalityProfile/',
        async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
        success: function(e){
            //console.log('personality.js', e.profile);

            //update the p-tag (id=matchedPersonality) based on the responses
            $('span.personality-msc').text(e.profile['msc']);
            $('span.personality-hsc').text(e.profile['hsc']);
            $('span.personality-con').text(e.profile['con']);
            $('span.personality-fam').text(e.profile['fam']);


            $('span.namePersonality').text(e.profile['name']);

            //set the image src here
            $('.initPersonality img').attr('src', '/static/pics/'+e.profile['name']+'.png');

        }
    });


}





