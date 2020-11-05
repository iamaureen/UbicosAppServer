
$(function(){

        //side navigation bar click events -- start

        //open the right-side-menu
        //$('#right-side-menu').click(function(e){
        $('#study-menu').click(function(e){
            $("#mySidenav").css("width", "350px");
            enterLogIntoDatabase('Activity Index Button Click', 'Button Click' , logged_in, global_current_pagenumber);
        });

        //close the right-side-menu
        $('.right-menu-closebtn').click(function(e){
             $("#mySidenav").css("width", "0px");
        });

        //event handler for all four higher level tabs e.g., general, week1, week2, week3
        $('.showLinkgeneral, .showLinkweek1, .showLinkweek2, .showLinkweek3, .showLinkweek4').click(function (e) {
                //toggle the up/down image, except the current selected "a" tab, set uparrow/downarrow for the rest of the tabs -- start
                $(this).find('img').toggle();

                var navBars = ['showLinkgeneral', 'showLinkweek1', 'showLinkweek2', 'showLinkweek3', 'showLinkweek4']
                var selected = $(this).attr('class');

                navBars.splice($.inArray(selected,navBars), 1);
                $.each(navBars, function(id, element){
                    $("a."+element+" img.uparrow").css("display","none");
                    $("a."+element+" img.downarrow").css("display","");
                })

                //toggle the up/down image -- end

                //expand the selected tab
                var className = $(this).attr('class').replace('showLink','').trim();
                //alert(className);
                //toggle the currently selected <ul> tag element
                $(this).next('.'+className).toggle();
                //remove active class for other <a> links
                $(this).toggleClass('active').siblings().removeClass('active');
                //remove active class for module <a> links
                $("#mySidenav a.nav").removeClass('active');

                //console.log($('#mySidenav ul').not('.'+className));
                //untoggle the other <ul> tag element
                $('#mySidenav ul').not('.'+className).each(function(id,element){
                    //if they are open, then untoggle them..else no need
                    if($(element).is(':visible')) {
                        $(element).toggle();
                    }
                });

            }
        );

        //event handler for each modules within each higher levels
        $('#mySidenav a.nav').off().on('touch click', function(){

            //highlight one module one at a time within respective <ul> tag
            $("#mySidenav a.nav").removeClass('active'); //remove all the active class so far
            //console.log('activityindex.js line 60', $(this));
            $(this).toggleClass('active'); //then add active class in the current selected <a> tag

            //get the page id, load that page, save the page id as the last accessed page
            var pageID = $(this).attr("data-pageId");
            reloadPage(pageID); //the following function is defined in digTextBook.js
            localStorage.setItem("pageToBeRefreshed", pageID);//next reload will load this page

            //close the side navigation bar once a module is selected
            $("#mySidenav").css("width", "0px");

            enterLogIntoDatabase('activity index opened', 'activity page click', $(this).text() , global_current_pagenumber);

        });

        //side navigation bar click events -- end

})


