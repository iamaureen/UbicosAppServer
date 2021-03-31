const hoverButtonMessage = function() {
    const className = "hover-text";
    $(".page a").hover(
        //if mouse is hovering the button
        function() {
            // console.log("mouse over")
            const activityButton = $(this);
            let type = activityButton.attr('class').replace('activity-button', '').trim();
            // console.log(type)

            if (type == 'video') {
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

        },
        // if mouse leave the button
        function() {
            // console.log("mouse leave");
        }
    );
};

module.exports = {
    hoverButtonMessage: hoverButtonMessage
};