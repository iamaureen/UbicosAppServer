var host_url = window.location.host

$(function(){


});


var setupPersonality = function(){
    //alert('load init personality from the survey measures');

    //match the closest profile --
    $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/matchPersonalityProfile/',
        async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
        success: function(e){
            //console.log('personality.js', e.profile);

            //update the p-tag (id=matchedPersonality) based on the responses
            $('span.personality-msc').text(e.profile['msc']);
            $('span.personality-hsc').text(e.profile['hsc']);
            $('span.personality-con').text(e.profile['con']);
            $('span.personality-fam').text(e.profile['fam']);


            $('span.namePersonality').text(e.profile['name']);

            //set the image src here
            $('.persona-image img').attr('src', '/static/pics/'+e.profile['name']+'.png');

        }
    });


}

var editPersonalityOptionBtnYes_method = function(){

        $( "#editPersonality" ).toggle();
        $( "#matchedPersonality" ).toggle();
        $( "#editPersonality_div" ).toggle();

        enterLogIntoDatabase( 'Personality Edit Button Click', 'Personality Edit Button Click', logged_in, global_current_pagenumber );

        let user_inputed_personality_msc=localStorage.getItem( "personality_msc" );
        let user_inputed_personality_hsc=localStorage.getItem( "personality_hsc" );
        let user_inputed_personality_con=localStorage.getItem( "personality_con" );
        let user_inputed_personality_fam=localStorage.getItem( "personality_fam" );

        if ( user_inputed_personality_msc&&user_inputed_personality_hsc&&
            user_inputed_personality_con&&user_inputed_personality_fam ) {

            $( `#dropdown-msc option:contains(${ user_inputed_personality_msc })` ).attr( 'selected', true );
            $( `#dropdown-hsc option:contains(${ user_inputed_personality_hsc })` ).attr( 'selected', true );
            $( `#dropdown-con option:contains(${ user_inputed_personality_con })` ).attr( 'selected', true );
            $( `#dropdown-fam option:contains(${ user_inputed_personality_fam })` ).attr( 'selected', true );
        }

        // console.log($(`#dropdown-msc option:contains(${ user_inputed_personality_msc })`).text());


        $( '.dropdown_btn' ).on( 'change', function ( e ) {
            console.log( $( `#${ e.currentTarget.id } :selected` ).text() );
            console.log( $( `#${ e.currentTarget.id } :selected` ).text().length );
            // $("#select_tmp_option").html($(`#${ e.currentTarget.id } :selected`).text());
            // console.log('width', $("#select_tmp").width());
            $( $( this ) ).width( $( `#${ e.currentTarget.id }` ).width() );
            // console.log($(this))
        } );

}

var editPersonalityOptionBtnNo_method = function(){

}

var changepersonality_method = function(){

        $( "#editPersonality" ).toggle();
        $( "#matchedPersonality" ).toggle();
        $( "#editPersonality_div" ).toggle();

        //get the value for the checkboxes
        personality_msc=$( '#dropdown-msc :selected' ).text();
        personality_hsc=$( '#dropdown-hsc :selected' ).text();
        personality_con=$( '#dropdown-con :selected' ).text();
        personality_fam=$( '#dropdown-fam :selected' ).text();


        console.log( personality_msc );
        console.log( personality_hsc );
        console.log( personality_con );
        console.log( personality_fam );

        //save into localstorage
        localStorage.setItem( "personality_msc", personality_msc );
        localStorage.setItem( "personality_hsc", personality_hsc );
        localStorage.setItem( "personality_con", personality_con );
        localStorage.setItem( "personality_fam", personality_fam );

        //update the p-tag (id=matchedPersonality) based on the responses
        $( 'span.personality-msc' ).text( personality_msc );
        $( 'span.personality-hsc' ).text( personality_hsc );
        $( 'span.personality-con' ).text( personality_con );
        $( 'span.personality-fam' ).text( personality_fam );

        personality_name=$( 'span#namePersonality' ).text();
        console.log( personality_name );


        //todo the matched personality thing

        //saves to the database
        $.ajax( {
            type: 'POST',
            url: '/saveEditedPersonality/',
            //async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
            data: {
                'msc': personality_msc,
                'hsc': personality_hsc,
                'fam': personality_fam,
                'con': personality_con,
                'name': personality_name
            },
            success: function ( e ) {

                //todo the matched personality thing

            }
        } );




        enterLogIntoDatabase( 'Personality Profile Page Button Click', 'Changed Personality options', logged_in, global_current_pagenumber );

}





