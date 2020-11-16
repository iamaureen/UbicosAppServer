var POINTS = [];
var EQUATION_POINTS = [];
var isTableLineVisible = false;

$(function(){
    fixVerticalTabindex('#TimeDistance', 2);
    updateTableStatus();
    handleChange();
    handleClear();
    createGraph();
    handleDrawLine();
    handleDrawEquation();

    $('#sourceOptions a').click(function(){
        // Toggle li
        var li = $('#graphSources .' + $(this).data('li'));
        $('#graphSources li').hide();
        li.show();
        // Change button
        $('#sourceOptions .active').removeClass('active');
        $(this).addClass('active');
    });
});

/*
    Takes a string and returns a number if it is an int, float, or fraction. Otherwise, return NaN
*/
function checkNumber(str){
    if(str.indexOf('/') > -1){
        // There is a '/', so treat as a fraction
        var fraction = str.split('/');
        console.dir(str);
        console.dir(fraction);
        if(fraction.length !== 2){
            // Not a fraction
            return num;
        } else {
            // A fraction
            return parseFloat(fraction[0]) / parseFloat(fraction[1])
        }
    } else {
        return parseFloat(str);
    }
};

/*
    Updates the table visual status based on the points input into it
*/
function updateTableStatus(){
    xRow = $('.x-row td');
    yRow = $('.y-row td');
    clearRow = $('.clear-row td');

    previousPoints = POINTS.slice();
    POINTS = [];

    disableNext = false;
    for (let i = 0; i < xRow.length; i++) {
        var tdX = $(xRow[i]);
        var tdY = $(yRow[i]);
        var tdClear = $(clearRow[i]);

        if(disableNext){
            // Disable point
            toggleColumn(tdX, tdY, tdClear, false);
        } else {
            // Enable point
            toggleColumn(tdX, tdY, tdClear, true);
            // Check if the next point needs to be disabled
            var point = {x: checkNumber($('input', tdX).val()), y: checkNumber($('input', tdY).val())};
            if (!(!isNaN(point.x) && !isNaN(point.y))) {
                /*
                If either point is not present, or if one of the points is not numeric,
                set flag to disable next columns
                */
                disableNext = true;
                if(i == 0 && EQUATION_POINTS.length == 0){ // If this is the first point and there is no equation plotted
                    toggleGraph(false);
                }
            } else {
                // point is present. Add it to array
                POINTS.push([point.x, point.y]);
                if(i == 0){
                    toggleGraph(true);
                }
            }
        }
    }
    if (!arraysEqual(previousPoints, POINTS)){
        tableUpdated();
    }


}

// used to clear the table so that each click the table clears out;
// values from one table dont show at other table
// called from digtextbook.js when table card is clicked

function clearTableStatus(){

    xRow = $('.x-row td');
    $.each(xRow, function(index, value){

        var inputX = $($('.x-row input')[index]);
        var inputY = $($('.y-row input')[index]);
        inputX.val('');
        inputY.val('');

    });


    updateTableStatus();

    //clear equation
    $('[name=m]').val('');
    $('[name=b]').val('');

     $('div#graph-container').css("display", "none");


}



function persistTableStatus(points){

        points = JSON.parse(points)
        xRow = $('.x-row td');

        $.each(points, function(index, value){
            //console.log(value[0])

            var inputX = $($('.x-row input')[index]);
            var inputY = $($('.y-row input')[index]);
            inputX.val(value[0]);
            inputY.val(value[1]);
        })

        updateTableStatus();
}

function tableUpdated(){
    createGraph();
}

// From https://stackoverflow.com/questions/4025893/how-to-check-identical-array-in-most-efficient-way
function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if((arr1[i][0] !== arr2[i][0]) || (arr1[i][1] !== arr2[i][1])) // This only works for arrays of length == 2
            return false;
    }
    return true;
}

function toggleGraph(graphVisible){
    var message = $('#message-container');
    var graph = $('#graph-container');
    if(graph.is(':visible') != graphVisible){ // Check if state needs to change
        var first = graphVisible ? message : graph;
        var second = graphVisible ? graph: message;
        first.fadeToggle(false, function(){
            second.fadeToggle(true);
        });
    }
}


function toggleColumn(tdX, tdY, tdClear, enabled){
//    tdX.toggleClass('disabled', !enabled);
//    tdY.toggleClass('disabled', !enabled);
//    tdClear.toggleClass('disabled', !enabled);
//    $('input', tdX).prop('disabled', !enabled);
//    $('input', tdY).prop('disabled', !enabled);
}

function handleChange(){
    $("#TimeDistance input").keyup(function (e) {
        updateTableStatus();
    });
}

function fixVerticalTabindex(selector, nRows) {
    $(selector).each(function(i, tbl) {
        // For each row
        var row_i = 0;
        $('tr', tbl).each(function(j, row){
            var inputs = $('input', row);
            if(inputs.length > 0){ // Check if there are inputs in this row
                // For each input
                input_i = 0;
                inputs.each(function(k, input){
                    $(input).attr('tabindex', row_i + input_i + 1);
                    input_i += nRows;
                });
                row_i++;
            }
        });
    });
}

function handleClear(){
    $('a.clear').click(function(){
        td_index = $(this).closest('td').index() - 1;
        table = $(this).closest('table');
        // Clear all points at this index
        var inputX = $($('.x-row input')[td_index]);
        var inputY = $($('.y-row input')[td_index]);
        inputX.val('');
        inputY.val('');
        // TODO cascade values from items ahead of this one back one position
        // Update table status
        updateTableStatus();
    });
}

function handleDrawLine(){
    $('#plot_table').click(drawLine);
    $('#plot_table').click(function(e){
        isTableLineVisible = true;
    });


}

function checkIfEquationTextboxSelected(){
        //error displayed when m or b was empty, clear that message
        //when they attempt to fill in m or b
        $('[name=m]').focus(function(){
            $('#equation-error-message-p').text('');
        })
        $('[name=b]').focus(function(){
            $('#equation-error-message-p').text('');
        })
}

function handleDrawEquation(){
    $('#plot_equation').click(function(){
        // Generate range for x
        XRANGE = 10;
        EQUATION_POINTS = [];
        var xList = [];
        var equationLi = $('li.equation');
        var m =  checkNumber($('[name=m]', equationLi).val());
        var b = checkNumber($('[name=b]', equationLi).val());

  //check if m and b are empty
        console.log(m)
        if(isNaN(m) || isNaN(b)){
            console.log("empty input")
            $('#equation-error-message-p').text("You need to fill in both m and b before the line can be plotted.")
            return;
        }

        // If there are points, use those for x instead
//        if(POINTS.length > 0){
//            // There are points. Display equation in the x range
//            for (let i = 0; i < POINTS.length; i++) {
//                const point = POINTS[i];
//                xList.push(point[0]);
//            }
//        } else {
//            // There are no points. Use XRANGE
//            for (let x = 0; x < XRANGE; x++) {
//                xList.push(x+1);
//            }
//            xList.push(0);
//            xList.push(XRANGE);
//        }

// go through the origin - start
        for (let x = 0; x < XRANGE; x++) {
                xList.push(x+1);
            }
            xList.push(0);
            xList.push(XRANGE);
// go through the origin - start

        // Create points
        for (let i = 0; i < xList.length; i++) {
            const x = xList[i];
            y = m * x + b;
            EQUATION_POINTS.push([x, y]);
        };

        //change started here - IA

        //change ended here - IA
        // Update and display graph
        createGraph();
        toggleGraph(true);

        //enter log
        var inputEquationLine = 'y = ' + m + ' x + ' + b;
        enterLogIntoDatabase('plot equation pressed', 'table plot equation' , inputEquationLine, global_current_pagenumber)

    });
}

function createGraph(){

    var margin = {top: 20, right: 15, bottom: 45, left: 45}
    , width = 450 - margin.left - margin.right
    , height = 340 - margin.top - margin.bottom;

    var maxPoints = d3.max([
        d3.max(POINTS.concat(EQUATION_POINTS), function(d) { return d[0]; }),
        d3.max(POINTS.concat(EQUATION_POINTS), function(d) { return d[1]; })
    ])
    var x = d3.scaleLinear()
                .domain([0, maxPoints])
                .range([ 0, width ]);

    var y = d3.scaleLinear()
                .domain([0, maxPoints])
                .range([ height, 0 ]);

    d3.select('svg').remove(); // Ideally we should just update the data and animate

    var chart = d3.select('#graph')
    .append('svg:svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'chart')

    var main = chart.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'main')

    var maxTicks = 15;
    var numTicks = maxPoints <= maxTicks ? maxPoints : maxTicks;

    // draw the x axis
    var xAxis = d3.axisBottom(x)
    .ticks(numTicks);//d3.max(POINTS, function(d) { return d[0]; }));

    main.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'main axis date')
    .call(xAxis);

    // draw the y axis
    var yAxis = d3.axisLeft(y)
    .ticks(numTicks);

    main.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class', 'main axis date')
    .call(yAxis);

    // Attach labels
    main.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(-"+ (margin.left/1.5) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .style('fill', 'white')
        .text("Circumference, cm (Y)");

    main.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (width/2) +","+(height+(margin.bottom)) + ")")  // text is drawn off the screen top left, move down and out and rotate
        .style('fill', 'white')
        .text("Diameter, cm (X)");

    var g = main.append("svg:g");

    // Draw both
    if(isTableLineVisible){
        drawPointsAndLine(POINTS, g, x, y, 'table-points1');
    }else{
        drawPointsAndLine(POINTS, g, x, y, 'table-points');
    }

    //drawPointsAndLine(POINTS, g, x, y, 'table-points');
    drawPointsAndLine(EQUATION_POINTS, g, x, y, 'equation-points');
}

function drawPointsAndLine(points, g, x, y, cssClass){
    // Draw lines
    var line = d3.line()
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return y(d[1]); });
    for (let i = 0; i < points.length-1; i++) {
        var point1 = points[i];
        var point2 = points[i+1];

        g.append('path')
            .attr('class', cssClass)
            .datum([point1,point2])
            .attr('d', line);

    }

    // Draw points
    g.selectAll("scatter-dots")
        .data(points)
        .enter().append("svg:circle")
            .attr('class', cssClass)
            .attr("cx", function (d,i) { return x(d[0]); } )
            .attr("cy", function (d) { return y(d[1]); } )
            .attr("r", 8);
}

function drawLine(draw){
    // Show lines
    var visibility = draw ? 'visible' : 'hidden';
    $('path').css('visibility', visibility);
    //save the data points in database

    localStorage.setItem('table'+$("input[name='table-id']").val(), JSON.stringify(POINTS))
    enterLogIntoDatabase('plot line pressed', 'table plot line' , JSON.stringify(POINTS), global_current_pagenumber)
    tableDataInsert('table', POINTS);
}

 var tableDataInsert = function(type, points){
        //log

         var pointsAsJSON = JSON.stringify(points);
         console.log(pointsAsJSON)
          //send to database
          $.post({
          async: false,
          url:'/tableData/save/', //save table data
          data: {
                'table_id': $("input[name='table-id']").val(),
                'plot_type': type ,
                'plot_data': pointsAsJSON
                },
           success: function(response){
         }
         });
    }
