const hoverButtonMessage = function() {
    const className = "hover-text";
    $(".page a").hover(
        //if mouse is hovering the button
        function() {
            // console.log("mouse over")
            const activityButton = $(this);

            // console.log("button", activityButton);
            let type = activityButton.attr('class').replace('activity-button', '').trim();

            if ($(this).find("span").length == 0) {
                if (type == 'video') {
                    console.log($(this).attr("class") + "has" + $(this).find("span").length);
                    $('.activity-button.' + type).append(`<span class=${ className }> Watch Video </span>`);
                }
                if (type == 'whiteboard') {
                    $('.activity-button.' + type).append(`<span class=${ className }> Go To White Board </span>`);
                }
                if (type == 'chatCard') {
                    $('.activity-button.' + type).append(`<span class=${ className }> Chat With Others </span>`);
                }
                if (type == 'upload') {
                    $('.activity-button.' + type).append(`<span class=${ className }> Upload Your Image </span>`);
                }
                if (type == 'individual') {
                    $('.activity-button.' + type).append(`<span class=${ className }> Leave Comments On Images </span>`);
                }
                if (type == 'gallery') {
                    $('.activity-button.' + type).append(`<span class=${ className }> Buggy Gallery </span>`);
                }
                if (type == 'self-gallery') {
                    $('.activity-button.' + type).append(`<span class=${ className }> Review Comments </span>`);
                }
                if (type == 'khanacademy') {
                    $('.activity-button.' + type).append(`<span class=${ className }> Badge Options </span>`);
                }
                if (type == 'table') {
                    $('.activity-button.' + type).append(`<span class=${ className }> Buggy Lab Table </span>`);
                }
            }



        },
        // if mouse leave the button
        function() {
            // console.log("mouse leave");
        }
    );
};


// const leftSideMenuBtnHover = function() {


//     $("#mySidenav a.nav").hover(
//         console.log("go to here")
//     );
//     // $('#mySidenav a.nav').off().on('touch click', function() {
//     //     alert("go to here")
//     // });
// };