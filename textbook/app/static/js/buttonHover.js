function hover_text() {
    const new_element = document.createElement("SPAN");
    const message = document.createTextNode("this sis a span");
    new_element.appendChild(message);
    document.body.appendChild(new_element);
    console.log("hi", new_element)
}

const activity_button = document.getElementsByClassName('activity-button');
activity_button.addEventListener("click", hover_text());

$('.activity-button').on('click', function(e) {
    alert("click");
    $('.activity-button').append('<span>' + 'this is a message' + '</span>');
});

$('page.p.a.activity-button').on('click', function(e) {
    alert("click");
});

$(document).ready(function() {
    $(".page a").hover(function() {
        alert("hello");
        console.log("hhh")
    }, function() {
        alert("hello");
    });
});


var bindActivityButtons = function() {
    $('.page a').off().on('click', function() {
        $(this).css("background-color", "yellow");
        alert("hoving");
        // console.log('this', this)
        // console.log('$(this)', $(this))
        // var activityButton = $(this);
        // console.log(activityButton);
        // activityButton.append('<span>' + 'hello' + '</span>');
    });
}