// Define range of melodies the retriev
let counter = 0;
let quantity = 4; 

// Variable of the melody template 
let melodyTemplate;

// Colors
let colorVote = '#ff0000';
let colorNoVote = '#000000';

let personalMelodies = true;

// When DOM loads, render melodies
document.addEventListener('DOMContentLoaded', () => {

	if(document.URL.includes('my_melodies')) {
		personalMelodies = true;
	} else {
		personalMelodies = false;
	}

	// Template of melodies
	melodyTemplate = Handlebars.compile(document.querySelector('#melody-template').innerHTML);

	load();
});

// If scroll to the bottom load next melodies
window.onscroll = () => {
	if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
		load();
	};
};

// Load next set of melodies
function load() {

	// Set start and end melodies number and update counter
	const start = counter;
	const end = counter + quantity;
	counter = end + 1;
	const filter = document.getElementById('id_m_filter').value;
	const order = document.getElementById('id_m_order').value;

	// Get new melodies and add them
	fetch(`/get_melodies?start=${start}&end=${end}&personal=${personalMelodies}&filter=${filter}&order=${order}`)
	.then(response => response.json())
	.then(data => {
		data.melodies.forEach(add_melody);
	});
};

// Add a new melody with given information to DOM
function add_melody(melody) {

	// CHECK HOW YO FACTOR OUT SINCE IT IS ALSO USED IN HOME
	let notes = melody.notes;
	let bpm = melody.bpm;
	let model = melody.aimodel;
	let score = melody.score;
	let date = melody.date_created;
	let convertDate = new Date(date);

	// Options for formatter date
	let optionsDate = { year: 'numeric', month: 'long', day: 'numeric'};

	let parseDate = convertDate.toLocaleString('en-US', optionsDate);


	let magentaSequence = {notes,
		quantizationInfo: {stepsPerQuarter: 4},
		tempos: [{time: 0, qpm: bpm}],
		totalQuantizedSteps: 64
	};

	let quantizedSequence = core.sequences.quantizeNoteSequence(magentaSequence, 4);

	// Create midi file out of magenta note sequence
	const midi = core.sequenceProtoToMidi(quantizedSequence);

	// Convert byte array to file
	const mFile = new Blob([midi], { type: 'audio/midi' });

	// Get url of the file
	const mURL = URL.createObjectURL(mFile);

	// Add midi element to the dom
	let	melodyContent = melodyTemplate({'id': melody.id, 'src': mURL, 'model': model, 'bpm': bpm, 'score': score, 'date': parseDate});

	var div = document.getElementById('melodies');

	div.insertAdjacentHTML('beforeend', melodyContent);

	// Add scoreboard
	document.getElementById('scoreboard' + melody.id).classList.remove('display-none');
	let visualizer = document.querySelector('.padding-1');
	visualizer.classList.remove('padding-1');
	visualizer.classList.add('padding-0');

	// Update votes view
	if(melody.user_score) {
		update_votes_view(melody.id, melody.user_score);
	};

	// Remove save icon add delete if is in my_melodies
	if (personalMelodies) {
		document.getElementById('save-melody' + melody.id).parentNode.classList.add('display-none');
		document.getElementById('delete-melody' + melody.id).parentNode.classList.remove('display-none');
	} else {
		document.getElementById('save-melody' + melody.id).addEventListener('click', () => {
			saveMelody(mURL, bpm, model, melody.id);
		});
	}
	
	// Add bpm and info
	document.getElementById('bpm-render' + melody.id).classList.remove('display-none');
	document.getElementById('info-melody' + melody.id).classList.remove('display-none');

	// Add event listener to remove melodies from this user
	document.getElementById('delete-melody' + melody.id).addEventListener('click', () => {
		delete_melody(melody.id);
	});

	// Add event listener to vote melodies
	document.getElementById('upvote' + melody.id).addEventListener('click', () => {
		vote_melody(melody.id, 1);
	});
	document.getElementById('downvote' + melody.id).addEventListener('click', () => {
		vote_melody(melody.id, -1);
	});
}

function delete_melody(melodyID) {
	fetch(`/delete_melody?melody_id=${melodyID}`)
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			melodyDiv = document.getElementById('melody-render' + melodyID);
			melodyDiv.style.animationPlayState = 'running';
			melodyDiv.addEventListener('animationend', () => {
				melodyDiv.remove();
			});
		} else {
			alertDialog(data.message);
		};
	});
};

function vote_melody(melodyID, vote) {
	fetch(`/add_vote?melody_id=${melodyID}&vote=${vote}`)
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			document.getElementById('score-number' + melodyID).innerHTML = data.score;
			update_votes_view(melodyID, data.user_score)
		}
		
		alertDialog(data.message);
	});
};

function update_votes_view(melodyID, userScore) {

	if (userScore === 1) {
		document.getElementById('upvote' + melodyID).style.color = colorVote;
		document.getElementById('downvote' + melodyID).style.color = colorNoVote;
	}
	if (userScore === 0) {
		document.getElementById('upvote' + melodyID).style.color = colorNoVote;
		document.getElementById('downvote' + melodyID).style.color = colorNoVote;
	}
	if (userScore === -1) {
		document.getElementById('upvote' + melodyID).style.color = colorNoVote;
		document.getElementById('downvote' + melodyID).style.color = colorVote;
	}

}