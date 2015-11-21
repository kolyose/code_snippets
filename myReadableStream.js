'use strict';

const Readable = require('stream').Readable;
const inherits = require('util').inherits;

let _source;

function MyReadableStream(sourceStream, initialData){
	Readable.call(this);
	this.arrChunks = [initialData];
	
	sourceStream.on('readable', function(){
		let chunk;
		while(true){
			chunk = sourceStream.read();
			this.arrChunks.push(chunk);		
			if (chunk === null) 
				break;
		}			
	}.bind(this));
}
inherits(MyReadableStream, Readable);

MyReadableStream.prototype._read = function(){
	this.push(this.arrChunks.shift());
}

module.exports = MyReadableStream;
