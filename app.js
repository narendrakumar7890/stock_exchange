"use strict";

const express = require('express');
var API = require('./index');

var BSEAPI = API.BSE;
var NSEAPI = API.NSE;

//const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
var io = require('socket.io')();

const https = require("https");

const app = require("express")();
const server = require("http").createServer(app);



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};

const changeInterval = 5000;

app.use(cors(corsOptions));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/front/index.html');
});

app.use(express.static(__dirname + '/front'));
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 3000;


        io.on('connection', (socket) => {

            if(changeInterval > 0)
            {
                setInterval(() => {
                    /*NSEAPI.getGainers()
                        .then(function (response) {
                           socket.emit("get_stocks", response.data);
                        }).catch(error => {
                        console.log('error: ',error);

                    });*/

                }, changeInterval);
            }

          socket.on("request_stock", (data) => {
                NSEAPI.getGainers()
                    .then(function (response) {
                        //console.log('request_stock response: ',response.data);
                        socket.emit("get_stocks", response.data);
                    }).catch(error => {
                    console.log('error: ',error);

                });
            });

            socket.on("request_stock_data", (data) => {
                console.log('request_stock_data data ',data);
                NSEAPI.getChartDataNew(data.symbol, data.time)
                    .then(function (response) {
                        console.log('request_stock_data response.data ',response.data);
                        //socket.emit("get_stocks", response.data);
                    }).catch(error => {
                    //console.log(error);

                });

            });


});

server.listen(port, function() {
    console.log('Server listening on port http://localhost:' + port );
});
io.attach(server, {
    'pingInterval': 15000,
    'pingTimeout': 15000
});
