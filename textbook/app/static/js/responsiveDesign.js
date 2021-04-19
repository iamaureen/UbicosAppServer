// // add responsive design for the next and previous page button

$(document).ready(function() {
    var currentWidth = $('#textbook-content').width();
    init_page_button(currentWidth);

});

const init_page_button = function(currentWidth) {
    $('#page-controls #page-control-previous').css("left", `${ currentWidth-100 }px`);

    $('#page-controls #page-control-next').css("left", `${ currentWidth-100+45 }px`);
}

$(window).resize(function() {

    var width = $('#textbook-content').width();

    // console.log("current width", width);
    $('#page-controls #page-control-previous').css("left", `${ width-100 }px`);
    //add 45px */

    $('#page-controls #page-control-next').css("left", `${ width-100+45 }px`);

});