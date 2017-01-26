const debug = require('debug')('bin:lib:transcribe-audio');
const fs = require('fs');

const wait = require('./wait');

const projectId = process.env.GCLOUD_PROJECT;

const gcloud = require('google-cloud')({
	projectId: projectId,
	credentials: JSON.parse(process.env.GCLOUD_CREDS)
});

const Speech = gcloud.speech;

const speech = new Speech({
	projectId,
	credentials: JSON.parse(process.env.GCLOUD_CREDS)
});

function splitPhrases(phrase = "", chunkSize = 100, respectSpaces = true){

	debug('PASSED PHRASE', phrase);
	const words = phrase.split(' ');

	const chunks = [];

	let currentChunk = '';

	debug(words, chunks, currentChunk);

	words.forEach(word => {

		if(`${currentChunk} `.length + word.length < chunkSize){
			currentChunk = `${currentChunk} ${word}`;
		} else {
			chunks.push(currentChunk);
			currentChunk =` ${word}`;
		}
		
		debug(words, chunks, currentChunk);

	});

	return chunks;

}

function transcribeAudio(audioFile, phrase = ''){

	return new Promise( (resolve, reject) => {
		debug('PROMISE PHRASES', phrase);
		const phrases = splitPhrases(phrase);
		const config = {
			encoding: 'LINEAR16',
			sampleRate: 16000,
			profanityFilter : true,
			speechContext : {
				phrases
			},
			verbose: true
		};

		speech.asyncrecognize(audioFile, config, function(err, result) {
				
				if(err){
					reject(err);
				} else {
					debug('Transcription result', result);
					resolve(result[0].transcript);
				}

			}
		);

	} );

}

module.exports = function(audioFiles, phrase){

	debug("audioFiles", audioFiles);

	if(audioFiles.constructor !== Array){
		audioFiles = [audioFiles];
	}
	
	return Promise.all( audioFiles.map(file => { return transcribeAudio(file, phrase) } ) )
		.then(transcriptions => {
			if(transcriptions.length === 1){
				return transcriptions[0];
			} else {
				return transcriptions;
			}
		})
		.catch(err => {
			debug('Transcription error:', err);
			throw Error('An error occurred in the transcription process');
		})
	;

};