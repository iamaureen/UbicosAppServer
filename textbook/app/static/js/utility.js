logged_in = '';
var global_badgeList;

$( function() {
    getLoggedUserName();

});



var getLoggedUserName = function(){

    //get the logged in user
    $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/getUsername/',
        async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
        success: function(e){
            logged_in  = e.name
            //console.log('logged in username (inside) :: ', logged_in)
        }
    });

}

//called from gallery.js
//called from khan academy.js
//called from teacheable agent.js //handle its own method; but will use this API
var computationalModelMethod = function(logged_in, platform, activity_id){
    $.ajax({
        url: '/computationalModel',
        type: 'POST',
        async: false,
        data: {"username": logged_in, 'platform' : platform, 'activity_id': activity_id}, //passing username so TA code can use the same API
        success: function (data) {
            //here data is a dict, where each key element is a list
            //console.log('utility.js', data.badgeList);
            //assigning it to a global variable, so we can access it outside this call and update promp/sentence opener as needed
            global_badgeList = data.badgeList;
            //call the method and update the badge-option-view
            badge_option_div_update(data.badgeList, platform.toLowerCase());
        }
    }); //end of computational model ajax call
}

//this method updates the badge option div (images) based on the info retrieved from the database
//for gallery.html and khanacademy_table.html≠
var badge_option_div_update = function(badgeList, platform){
    //TODO: change the dict to list of lists
    //console.log("utility.js :: ", badgeList)
    i = 1;
    $.each(badgeList, function(key, element){
        //console.log(element[0]['badgeName']);
        //update the badge-option-display div elements with badgeNames but not the prompt
        $("div#"+platform+"-badge"+i+" span").text(element[0]['badgeName']);
        //update the data-char
        //https://stackoverflow.com/questions/51278220/how-to-set-data-attribute-with-jquery
        $("div#"+platform+"-badge"+i).attr('data-char',key);
        //console.log($("div#"+platform+"-badge"+i).attr('data-char'));
        //update the badge display option images
        $("div#"+platform+"-badge"+i+" img").attr('src', '/static/pics/'+element[0]['badgeName'].toLowerCase()+'.png');
        //increment the counter
        i = i + 1;
    });

}

//this method is used in three places: TODO
//1) individual_gallery.js (#ind-feed)
//2) gallery.js (#image-feed)
//3) activityfeed.js (#activity-feed)
var buildFeedwithMsgs = function(message, container, username, time){
    var li = $("<li/>").appendTo(container);
    if(logged_in == username){
       li.addClass('message self');
    }else{
       li.addClass('message');
    }
    var div = $("<div/>").appendTo(li);
    div.addClass('user-image');
    var span = $('<span/>', {text: username}).appendTo(div); //logged_in from utility.js
    var p = $('<p/>', {text: message}).appendTo(li);
    var div_msg = $("<div/>").appendTo(li);
    div_msg.addClass('msg-timestamp');
    // todo fix with the database

    var span_timestap = $('<span/>', {
              text: time}).appendTo(div_msg);

    //TODO change this into a dynamic if else
    $(container).animate({ scrollTop: $(container).height() }, 400);
    //$(container).scrollTop($(container)[0].scrollHeight);

}// end of buildFeedwithMsgs method


//get the current time for real time message passing
var getCurrentTime = function(){
    //call to the method to post the message in the feed
    var currentdate = new Date();
    var datetime = "" + currentdate.getFullYear() + "-"
    + (currentdate.getMonth()+1)  + "-"
    + currentdate.getDate() + " "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();

    console.log(datetime);

    return datetime;

}

//format time coming from django query
var formatTime = function(raw_time){

    //format of raw_time: 2020-10-30T03:44:56.323Z
    var t1 = raw_time.split('.').pop()
    time = raw_time.replace("."+t1, ""); //2020-10-30T03:44:56
    time = time.replace("T", " ") //2020-10-30 03:44:56 //this is probably server time

    //console.log(time)

    return time;
}

var getWhiteboardURl = function(board_id){

    //get the whiteboard URL
    whiteboard_url = ''
    $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/getWhiteboardURl/'+board_id,
        async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
        success: function(e){
             //console.log(e.url);
             whiteboard_url = e.url;
             //console.log('logged in username (inside) :: ', logged_in)
        }
    });

    return whiteboard_url;

}