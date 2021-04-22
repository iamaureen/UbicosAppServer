// // add responsive design for the next and previous page button

$(document).ready(function() {

    //896
    var initialWidth = $('#textbook-content').width();
    // alert(initialWidth)
    init_page_button(initialWidth);
});

const init_page_button = function(initialWidth) {
    $('#page-controls #page-control-previous').css("left", `${ initialWidth-100 }px`);

    $('#page-controls #page-control-next').css("left", `${ initialWidth-100+45 }px`);
}

$(window).resize(function() {

    var currentWidth = $('#textbook-content').width();

    // console.log("current width", width);
    $('#page-controls #page-control-previous').css("left", `${ currentWidth-100 }px`);
    //add 45px */

    $('#page-controls #page-control-next').css("left", `${ currentWidth-100+45 }px`);

    // submit_KaForm_Button_Position(currentWidth)

});


// let submit_KaForm_Button_Position = function(currentWidth) {

//     console.log(currentWidth)

//     if (currentWidth >= 555) {
//         $('#ka-submit').css("margin-left", `${ currentWidth-405 }px`);
//     }

// }