"use strict";

let selected_row = {};


var socket = io.connect("http://localhost:3000/", { reconnection: false, secure: true });

socket.on("connect", function() {
    console.log("Connected to socket server");
    socket.emit("request_stock",{
        isTyping: true,
        user_id: 1,
        person: "Client"
    });
});

socket.on("connect_error", function(error)  {
    //console.log(error);
});


socket.on("get_stocks",function (stockList)  {
   // console.log('stockList: ', stockList);

    var table = document.getElementById("stock_List");

    var rowCount = table.rows.length;
     table.innerHTML ='<tr></tr>';


    for (let stock of stockList.data) {
        //console.log('i: ',i);

        var myTable = document.getElementById("stock_List");
        var currentIndex = myTable.rows.length;
        var currentRow = myTable.insertRow(-1);
         var linksBox = document.createElement("div");

        linksBox.innerHTML = stock.symbol;
        linksBox.addEventListener('click', function () {

            $(this).parents("tr").addClass('selected');
            StartNewChat(stock);
        });


        var keywordsBox = document.createElement("div");
        keywordsBox.innerHTML = stock.ltp;
        keywordsBox.addEventListener('click', function () {

            $(this).parents("tr").addClass('selected');
            StartNewChat(stock);
        });

        var violationsBox = document.createElement("div");
        violationsBox.innerHTML = stock.openPrice;
        violationsBox.addEventListener('click', function () {

            $(this).parents("tr").addClass('selected');
            StartNewChat(stock);
        });

        var timeagobox = document.createElement("div");
        timeagobox.innerHTML = stock.lastCorpAnnouncementDate;
        timeagobox.addEventListener('click', function () {

            $(this).parents("tr").addClass('selected');
            StartNewChat(stock);
        });

        var currentCell = currentRow.insertCell(-1);
        currentCell.appendChild(linksBox);

        currentCell = currentRow.insertCell(-1);
        currentCell.appendChild(keywordsBox);

        currentCell = currentRow.insertCell(-1);
        currentCell.appendChild(violationsBox);

        currentCell = currentRow.insertCell(-1);
        currentCell.appendChild(timeagobox);



        /*var addRowBox = document.createElement("button");
        addRowBox.innerHTML = "Start Chat";
        addRowBox.setAttribute("class", "button");
        addRowBox.addEventListener('click', function () {
            StartNewChat(stock);
        });*/

        //currentCell = currentRow.insertCell(-1);
        //currentCell.appendChild(addRowBox);

    }

    if(selected_row && selected_row.id){
        //console.log('selected_row: ',selected_row);
        StartNewChat(selected_row);


        currentRow.className = 'yourclassname';
    }else{
        if(stockList.data.length>0){
            StartNewChat(stockList.data[0]);

        }

    }
});


function StartNewChat(data) {
    //console.log('StartNewChat data: ', data);
    selected_row = data;

    socket.emit("request_stock_data",{
        symbol: data.symbol ,
        time:  'year'
    });

    socket.on("get_stock_data",function (stock_chart_data)  {
        console.log('get_stock_data stock_chart_data: ', stock_chart_data);
    });

    Highcharts.getJSON('https://demo-live-data.highcharts.com/aapl-c.json', function (data) {
        // Create the chart
        //console.log('Highcharts data: ', data);
        Highcharts.stockChart('container', {
            chart: {
                events: {
                    load: function () {
                        var chart = this;

                        // Select the save button of the popup and assign a click event
                        document
                            .querySelectorAll('.highcharts-popup-annotations button')[0]
                            .addEventListener(
                                'click',
                                // Function which saves the new background color.
                                function () {
                                    var color = document.querySelectorAll(
                                        '.highcharts-popup-annotations input[name="stroke"]'
                                    )[0].value;

                                    // Update the circle
                                    chart.currentAnnotation.update({
                                        shapes: [{
                                            fill: color
                                        }]
                                    });

                                    // Close the popup
                                    chart.annotationsPopupContainer.style.display = 'none';
                                }
                            );
                    }
                }
            },
            navigation: {
                // Informs Stock Tools where to look for HTML elements for adding
                // technical indicators, annotations etc.
                bindingsClassName: 'tools-container',
                events: {
                    // On selecting the annotation the showPopup event is fired
                    showPopup: function (event) {
                        var chart = this.chart;

                        if (!chart.annotationsPopupContainer) {
                            // Get and store the popup annotations container
                            chart.annotationsPopupContainer = document
                                .getElementsByClassName('highcharts-popup-annotations')[0];
                        }

                        // Show the popup container, but not when we add the annotation.
                        if (
                            event.formType === 'annotation-toolbar' &&
                            !chart.activeButton
                        ) {
                            chart.currentAnnotation = event.annotation;
                            chart.annotationsPopupContainer.style.display = 'block';
                        }
                    },

                    closePopup: function () {
                        // Hide the popup container, and reset currentAnnotation
                        this.chart.annotationsPopupContainer.style.display = 'none';
                        this.chart.currentAnnotation = null;
                    },

                    selectButton: function (event) {
                        // Select button
                        event.button.classList.add('active');
                        // Register this is current button to indicate we're adding
                        // an annotation.
                        this.chart.activeButton = event.button;
                    },

                    deselectButton: function (event) {
                        // Unselect the button
                        event.button.classList.remove('active');
                        // Remove info about active button:
                        this.chart.activeButton = null;
                    }
                }
            },
            stockTools: {
                gui: {
                    enabled: false // disable the built-in toolbar
                }
            },

            series: [{
                id: 'aapl',
                name: 'AAPL',
                data: data,
                tooltip: {
                    valueDecimals: 2
                }
            }]
        });
    });
}


function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
}

