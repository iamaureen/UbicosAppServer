// add responsive design for the next and previous page button
$(window).resize(function() {
    var width = $('#textbook-content').width();
    // console.log("current width", width);

    $('#page-controls #page-control-previous').css("left", `${ width-100 }px`);
    //add 45px */

    $('#page-controls #page-control-next').css("left", `${ width-100+45 }px`);

});