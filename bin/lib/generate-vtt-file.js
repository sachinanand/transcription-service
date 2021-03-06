/*
A WebVTT timestamp consists of the following components, in the given order:

Optionally (required if hours is non-zero):
Two or more ASCII digits, representing the hours as a base ten integer.
A U+003A COLON character (:)
Two ASCII digits, representing the minutes as a base ten integer in the range 0 ≤ minutes ≤ 59.
A U+003A COLON character (:)
Two ASCII digits, representing the seconds as a base ten integer in the range 0 ≤ seconds ≤ 59.
A U+002E FULL STOP character (.).
Three ASCII digits, representing the thousandths of a second seconds-frac as a base ten integer.
*/

const debug = require('debug')('bin:lib:generate-vtt-file');

function padNumber(num){
	
	if(num === 0){
		num = '00';
	} else if(num < 10){
		num = `0${num}`;
	} else {
		num = num;
	}

	return num;

}

function convertSecondsToTimestamp(seconds){

	const d = Number(seconds);
	const h = Math.floor(d / 3600);
	const m = Math.floor(d % 3600 / 60);
	const s = Math.floor(d % 3600 % 60);

	const Hours = padNumber(h);
	const Minutes = padNumber(m);
	const Seconds = padNumber(s);

	return `${Hours}:${Minutes}:${Seconds}.000`;

};

module.exports = function(transcriptions){

	let VTT = 'WEBVTT\n\n';

	transcriptions.forEach( (t, idx) => {
		const VTTContent = (idx + 1) + "\n" + convertSecondsToTimestamp(t.timeOffsets.start) + " --> " + convertSecondsToTimestamp(t.timeOffsets.end) + "\n" + t.transcription + "\n\n";
		debug(VTTContent);
		VTT += VTTContent;
	});

	return Promise.resolve(VTT);

};