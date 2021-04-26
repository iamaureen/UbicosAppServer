var host_url = window.location.host
var badges = [];
var badge_count = [];
var dict = {'suggestion': false, 'social' : false, 'relevance' : false, 'reflection' : false, 'ques' : false, 'feedback' : false, 'explanation' : false, 'cocon' : false};

$(function(){

    //load the first set of badge and highlight it
    updateBadgeCardBody('Understand Better!', 'hg');

    badgeCardActionItems();

})

   //study2020v1 starts here
var badgeCardActionItems = function(){

    $(".badgeDesc").on('click', function(event){
    /* If you call click on a class with jQuery it can bubble to other elements and register multiple clicks.
    Stopping the propagation of that click event to other elements is how to solve this */
        event.stopPropagation();
        event.stopImmediatePropagation();

        $('.badgeDesc').removeClass('badgeDesc-selected');
        $(this).addClass('badgeDesc-selected');

        //access the span element
        var span_text = $(this).find('span.badge-description-name').text();
        //get the data attribute
        var badgeType = $(this).attr('data-id');
        //console.log('line 28 :: ', badgeType)
        updateBadgeCardBody(span_text, badgeType);

    });
}

var updateBadgeCardBody = function(span_text, badgeType){
    //update badgeCardHeader2 of badge.html
    $('.badgeCardHeader2 h5').text("");
    $('.badgeCardHeader2 h5').text(span_text);

    //send badgeType to db and get the badge names
    //TODO update the counts for each platform

     $.ajax({

            type:'POST',
            async: false,
            url:'http://'+ host_url +'/getBadgeNames/',
            data: {'badgeType': badgeType},
            success: function(response){
                badgeNames = response.badgeNames; //array of names
                badgeDescription = response.badgeDesc;
                //console.log(badgeDescription)
                //console.log('awardbanner.js line 49 :: ', badgeNames[0]['badgeName']);
                //loop the variable badgeNames and update the html
                i = 1;
                $.each(badgeNames, function(key,elem){
                    //console.log(badgeNames[key]['badgeName']);
                    //set the badge name
                    $('#badgeCard-badgeName'+i).text(badgeNames[key]);
                    //set the image source
                    var imageName = badgeNames[key].toLowerCase()
                    console.log('awardbanner.js ', imageName)
                    $('#badgeCard-img'+i).attr('src', '/static/pics/'+badgeNames[key]+'.png');

                    i = i + 1;
                });

                i = 1;
                $.each(badgeDescription, function(key,elem){

                    //set the description which is displayed upon hover
                    $('#badgeCard-desc'+i).text(badgeDescription[key]);

                    i = i + 1;
                });

                //update the count now
                badgeCount = response.badgeCount;
                //console.log(badgeCount);
                //outer loop maintaining the three badges
                i=1;
                $.each(badgeCount, function(key,elem){
                    //console.log(elem['badgeName']);
                    //console.log(elem['count_List']); //badge count list for each of the three badges
                    //inner loop for maintaining the count for three platforms
                    j=1;
                    platform = ['Modelbook', 'Khan Academy', 'Cobi'];
                    $.each(elem['count_List'], function(key1, elem1){
                        //updates the span
                        //console.log(elem1);
                        $('#badgePlatformC'+i+' .badge-count-platform-'+j).text(platform[key1]+': '+elem1['badgeCount']);
                        j = j + 1;
                    });
                    i = i + 1;

                });

            }
        });
}
   //study2020v1 ends here


/* march/april 2019 version starts here

//$( document ).ready(function() {
//    setInterval(function(){
//    clearBadges();
//    displayAllBadges();
//    console.log("check check");
//    }, 5000);
//});
var getBadgesFromDB = function(){

    $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/getBadges/',
        async: false,
        success: function(e){
            //returns an array of badges
            //console.log(e.badgeList)
            badges = e.badgeList;
        }
    })
}

function displayAllBadges(){
    //get badges from database
    clearBadges();
    getBadgesFromDB();
    //badges = ["social", "ques"];

    var src = $(".award-holder");

    for(var i = 0; i < badges.length; i++){
        dict[badges[i]] = true;
    }

    for(var key in dict){
        var divBnrHeader = $('<div class = "badge-header" style="margin-left:150px"></div>');

        var divBnr = $('<div class = "badge-divide" style="float:left"></div>');
        $(divBnrHeader).append(divBnr)


        var spandiv = $('<span class="imgtooltip"></span>');
        $(divBnr).append(spandiv)

        var img = document.createElement("img");

        if(dict[key])
            var img = $('<img/>', { class: key, src : 'http://'+ host_url + "/static/pics/" + key + ".png" }).css({"width":"30px","height": "50px", "margin-right": "5px", "margin-left": "5px"}).appendTo(divBnr);
            //img.appendTo(imgDivBnr);
        else
            var img = $('<img/>', { class: key,  src : 'http://'+ host_url + "/static/pics/" + "blank" + ".png" }).css({"width":"30px", "height": "50px","margin-right": "5px", "margin-left": "5px"}).appendTo(divBnr);
            //img.appendTo(imgDivBnr);

        $(src).append(divBnrHeader);
    }

    //hoverBadge();
   // src.append("</center>");
  }

  function clearBadges(){

    for(var key in dict){
    //console.log("remove badge" + key);
    $('img.' + key).remove();
    }

  }

var badge_dict_description = {'suggestion': 'You get this badge when you provide a hint to others.',
'social' : 'You get this badge when you are helpful, nice, and polite',
'relevance' : 'You get this badge when you make a post related to the topic',
'reflection' : 'You get this badge when you explain your understanding to others',
'ques' : 'You get this badge when you ask a question',
'feedback' : 'You get this badge when you provide feedback on someone else\'s work.',
'explanation' : 'You get this badge when you provide an explanation',
'cocon': 'You get this badge by providing comment on others\' contribution'};

var badge_dict_example = {'suggestion': 'Next time try ...',
'social' : 'Good job ...',
'relevance' : 'This reminds me of ...',
'reflection' : 'I agree/disagree with your answer, because....',
'ques' : 'What do you mean by ... ?',
'feedback' : 'Your answer is wrong because...',
'explanation' : 'I think that... This is because...',
'cocon': 'You did... but another way to do it is...'};

var badge_dict_prompt_copy = {'suggestion': 'Next time try ...',
'social' : 'Good job ...',
'relevance' : 'This reminds me of ...',
'reflection' : 'I agree/disagree with your answer, because....',
'ques' : 'What do you mean by ... ?',
'feedback' : 'Your answer is wrong because...',
'explanation' : 'I think that... This is because...',
'cocon': 'You did... but another way to do it is...'};



  function hoverBadge(){

   for(var key in dict){

        //$('#badge-description').children('img').remove();
        //$('#badge-description').show();

        //$("img#"+key).on("mouseover", function () {

        $("img."+key).on("mouseenter", function () {
             //stuff to do on mouseover
             //alert('here') //works
             //$('#badge-description').children('img').remove();
             var banner = $($(this).parents('.award-holder'));
             var descript = $(banner).children('.badge-description');


             $(descript).show();
             $(descript).empty();
             var display = $(this).attr('class');
             var badge_descript = $(descript);

            $(descript).append("<span onclick=this.parentElement.style.display='none' class='badge-description-close-button'>&times</span>")

             var img = $('<img/>', { class: display, src : 'http://'+ host_url + "/static/pics/" + display + ".png" }).css({"width":"50px","height": "80px", "margin-right": "5px", "margin-left": "5px"}).appendTo(badge_descript);


            $(descript).append("<p class = 'badge_name'>" + badge_dict[display] + "</p>");

            $(descript).append("<p class = 'badge_descrip'>"+badge_dict_description[display]+".</p>");


            $(descript).append("<p class = 'badge_example' style='font-style:italic;'>"+badge_dict_example[display]+".</p>");

            var example_string =  "<div class='talkmoves-copy'><p class = 'badge-template-p' style='visibility: hidden;float: left;'>"+badge_dict_prompt_copy[display]+".</p>"+
           "<div class='tm-row'><input class='tm-row-copy-button bannercopy' type='button' name='1' value='Copy'>"+
            "</div>"+
            "</div>"


            $(descript).append(example_string);
            $(descript).css('opacity','.9');
            $(descript).css('color', 'black');


            enterLogIntoDatabase('badge hover', 'badge' , display, current_pagenumber)



        }).on("mouseout", function(){
            //$('#badge-description').css('opacity','0');
            //clearTimeout(setTimeoutConst );


        });
    }

  }


// march/april 2019 version starts here */
