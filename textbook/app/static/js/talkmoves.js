$(function(){

    copy_tm_text_button();


})

var copy_tm_text_button = function(value){

    $('#tm-row-copy-button').click(function(value){
        //alert($(this).attr('name'));
        //https://jqueryhouse.com/copy-data-to-clipboard-using-jquery/
        var copied_text = $(this).parent().siblings().text();
        console.log("talkmoves.js", copied_text)
        if(!copied_text.trim()) {


        }else{
            console.log(copied_text);

            var value = '<input value="'+ copied_text +'" id="selVal" />';
            $(value).insertAfter($(this));
            $("#selVal").select(); //select works for input //https://stackoverflow.com/questions/50941892/copy-to-clipboard-value-of-selected-option
            document.execCommand("copy");
            $('div#talkmoves-copy').find("#selVal").remove();

            alert("Copied the text: " + copied_text);

        }

    })
}
