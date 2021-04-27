var host_url = window.location.host

$( function () {


    getRadioBtnValue();

    let user_inputed_personality_msc=localStorage.getItem( "personality_msc" );
    let user_inputed_personality_hsc=localStorage.getItem( "personality_hsc" );
    let user_inputed_personality_fam=localStorage.getItem( "personality_fam" );
    let user_inputed_personality_con=localStorage.getItem( "personality_con" );

//    console.log( user_inputed_personality_msc )
//    console.log( user_inputed_personality_hsc )
//    console.log( user_inputed_personality_fam )
//    console.log( user_inputed_personality_con )

    editBtnClick()
} );


var getRadioBtnValue=function () {
    // alert( $( "#deliveryNext" ).is( ":disabled" ))
    $( ".edit_btn" ).hide();

    $( ".personality_radio" ).change( function ( e ) {

        //console.log( e.target.defaultValue )
        window.localStorage.setItem( "personality_radio_value", e.target.defaultValue );

        $( ".personality_radio" ).attr( "disabled", true );
        $( ".edit_btn" ).show();
    } )


}

var editBtnClick=function () {
    $( ".edit_btn" ).click( function () {
        $( ".personality_radio" ).attr( "disabled", false );
    })
}




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
            $('.persona-image img').attr('src', '/static/pics/'+e.profile['name']+'_robot.png');

            //load the local storage as well, so when hit change it uses the value
            //save into localstorage
            localStorage.setItem( "personality_msc", e.profile['msc'] );
            localStorage.setItem( "personality_hsc", e.profile['hsc'] );
            localStorage.setItem( "personality_fam", e.profile['fam'] );
            localStorage.setItem( "personality_con", e.profile['con'] );



        }
    });


}

var editPersonalityOptionBtnYes_method = function(){

        $( "#editPersonality" ).toggle();
        $( "#matchedPersonality" ).toggle();
         $( "#editPersonality_div" ).toggle();

       console.log( $( '#dropdown-msc .selected' ).text() )

        enterLogIntoDatabase( 'Personality Edit Button Click', 'Personality Edit Button Click', logged_in, global_current_pagenumber );

        let user_inputed_personality_msc=localStorage.getItem( "personality_msc" );
        let user_inputed_personality_hsc=localStorage.getItem( "personality_hsc" );
        let user_inputed_personality_fam=localStorage.getItem( "personality_fam" );
        let user_inputed_personality_con=localStorage.getItem( "personality_con" );

//        console.log(`${user_inputed_personality_msc}`)
//        console.log(user_inputed_personality_hsc)
//        console.log(user_inputed_personality_fam)
//        console.log(user_inputed_personality_con)

        //TODO: set the dropdown values based on the localstorage items
    // $( `#dropdown-msc option[value=${ user_inputed_personality_msc }]` ).attr( "selected", true );

        $( `#dropdown-msc option:contains(${ user_inputed_personality_msc })` ).attr( 'selected', true );
        $( `#dropdown-hsc option:contains(${ user_inputed_personality_hsc })` ).attr( 'selected', true );
        $( `#dropdown-con option:contains(${ user_inputed_personality_con })` ).attr( 'selected', true );
        $( `#dropdown-fam option:contains(${ user_inputed_personality_fam })` ).attr( 'selected', true );

        // $('select[name^="dropdown-msc"] option:selected').attr("selected",null);
        // $('select[name^="dropdown-msc"] option[value='+user_inputed_personality_msc+']').attr("selected","selected");

        // $('select[name^="download-hsc"] option:selected').attr("selected",null);
        // $('select[name^="download-hsc"] option[value='+user_inputed_personality_hsc+']').attr("selected","selected");


//        if ( user_inputed_personality_msc&&user_inputed_personality_hsc&&
//                    user_inputed_personality_con&&user_inputed_personality_fam ) {
//
//                    $( `#dropdown-msc option:contains(${ user_inputed_personality_msc })` ).attr( 'selected', true );
//                    $( `#dropdown-hsc option:contains(${ user_inputed_personality_hsc })` ).attr( 'selected', true );
//                    $( `#dropdown-con option:contains(${ user_inputed_personality_con })` ).attr( 'selected', true );
//                    $( `#dropdown-fam option:contains(${ user_inputed_personality_fam })` ).attr( 'selected', true );
//                }



}

var editPersonalityOptionBtnNo_method = function(){

    //saves to the database
        $.ajax( {
            type: 'POST',
            url: '/saveEditedPersonality/',
            //async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
            data: {
                'msc': localStorage.getItem( "personality_msc" ),
                'hsc': localStorage.getItem( "personality_hsc" ),
                'fam': localStorage.getItem( "personality_fam" ),
                'con': localStorage.getItem( "personality_con" ),
                'name': $( 'span#namePersonality' ).text(),
                'likeness': window.localStorage.getItem( "personality_radio_value"),
                'event': "no change in html inputs"
            },
            success: function ( e ) {

                //todo the matched personality thing

            }
        } );

}

var changepersonality_method=function () {

        $( "#editPersonality" ).toggle();
        $( "#matchedPersonality" ).toggle();
        $( "#editPersonality_div" ).toggle();

        //get the value for the checkboxes
        personality_msc=$( '#dropdown-msc :selected' ).text();
        personality_hsc=$( '#dropdown-hsc :selected' ).text();
        personality_fam=$( '#dropdown-fam :selected' ).text();
        personality_con=$( '#dropdown-con :selected' ).text();



//        console.log( personality_msc );
//        console.log( personality_hsc );
//        console.log( personality_con );
//        console.log( personality_fam );

        //save into localstorage
        localStorage.setItem( "personality_msc", personality_msc );
        localStorage.setItem( "personality_hsc", personality_hsc );
        localStorage.setItem( "personality_fam", personality_fam );
        localStorage.setItem( "personality_con", personality_con );


        //update the p-tag (id=matchedPersonality) based on the responses
        $( 'span.personality-msc' ).text( personality_msc );
        $( 'span.personality-hsc' ).text( personality_hsc );
        $( 'span.personality-fam' ).text( personality_fam );
        $( 'span.personality-con' ).text( personality_con );


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
                'name': personality_name,
                'likeness': window.localStorage.getItem( "personality_radio_value"),
                'event': "changed html inputs"
            },
            success: function ( e ) {

                //todo the matched personality thing

            }
        } );

        setupPersonality();




        enterLogIntoDatabase( 'Personality Profile Page Button Click', 'Changed Personality options', logged_in, global_current_pagenumber );

}




