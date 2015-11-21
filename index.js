"use strict";

const util = require("util");
const EventEmitter = require("events");
const net = require("net");
const fs = require("fs");
const url = require("url");
const path = require("path");
const MyReadableStream = require('./myReadableStream');

function ServerEventEmitter(port){
	EventEmitter.call(this);
	
	let server = net.createServer(function (connection) {

		let requestRawData = "";
		let requestStream;

		connection.on("data", function(data){
	
			requestRawData = requestRawData.concat(data);

			let emptyStringIndex = requestRawData.indexOf("\r\n\r\n");
			if (~emptyStringIndex){
				let lineAndHeaders = requestRawData.slice(0, emptyStringIndex);
				let requestLineAndHeaders = parseRequestLineAndHeaders(lineAndHeaders);
				
				//connection.pause();
				requestStream = new MyReadableStream(connection, requestRawData.slice(emptyStringIndex));
				
				for (let property in requestLineAndHeaders){
					requestStream[property] = requestLineAndHeaders[property];
				}
				
				_this.emit("connection", requestStream);
			} 				
		});

		function parseRequestLineAndHeaders(data){
			let result = {};

			let arrDataLines 			= data.toString().split('\r\n');
			let arrRequestData 			= arrDataLines[0].split(" ");

			result.method 				= arrRequestData[0];
			result.url		 			= arrRequestData[1];
			result.protocolVersion 		= arrRequestData[2].split("/")[1];
			result.headers 				= {};

			for (let i=1,length=arrDataLines.length; i<length; i++){
				if (arrDataLines[i] == '\r\n') break;
				let arrHeaderData = arrDataLines[i].split(':');
				result.headers[arrHeaderData[0]] = arrHeaderData[1]; 
			} 

			return result;
		}
	});
		
	server.listen(port, function () {
		console.log("server listening on port " + port);
	});
}

util.inherits(ServerEventEmitter, EventEmitter);

module.exports = new ServerEventEmitter(process.env.PORT || 3000);