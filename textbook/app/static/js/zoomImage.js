// function zoomInImage() {


//     $("#zoom_image").click(function() {
//         alert("called.");
//     });

//     $('#zoom_in_image_button').off().on('click', function(e) {
//         console.log("is click!")
//     });

//     var myImg = document.getElementById("gallery_image");
//     var currWidth = myImg.clientWidth;

//     if (currWidth == 2500) return false;
//     else {
//         myImg.style.width = (currWidth + 100) + "px";
//     }

//     console.log(currWidth)
// }


function zoomInImage() {

    var myImg = document.getElementById("gallery_image");
    var currWidth = myImg.clientWidth;

    if (currWidth == 2500) return false;
    else {
        myImg.style.width = (currWidth + 100) + "px";
    }

    console.log(currWidth)

}


function zoomout() {
    var myImg = document.getElementById("gallery_image");
    var currWidth = myImg.clientWidth;
    if (currWidth == 100) return false;
    else {
        myImg.style.width = (currWidth - 100) + "px";
    }
}