// Salamander Piano
const salamanderSampler = new Tone.Sampler({
	urls: {
		A0: "A0.mp3",
		C1: "C1.mp3",
		"D#1": "Ds1.mp3",
		"F#1": "Fs1.mp3",
		A1: "A1.mp3",
		C2: "C2.mp3",
		"D#2": "Ds2.mp3",
		"F#2": "Fs2.mp3",
		A2: "A2.mp3",
		C3: "C3.mp3",
		"D#3": "Ds3.mp3",
		"F#3": "Fs3.mp3",
		A3: "A3.mp3",
		C4: "C4.mp3",
		"D#4": "Ds4.mp3",
		"F#4": "Fs4.mp3",
		A4: "A4.mp3",
		C5: "C5.mp3",
		"D#5": "Ds5.mp3",
		"F#5": "Fs5.mp3",
		A5: "A5.mp3",
		C6: "C6.mp3",
		"D#6": "Ds6.mp3",
		"F#6": "Fs6.mp3",
		A6: "A6.mp3",
		C7: "C7.mp3",
		"D#7": "Ds7.mp3",
		"F#7": "Fs7.mp3",
		A7: "A7.mp3",
		C8: "C8.mp3"
	},
	release: 1,
	baseUrl: "https://tonejs.github.io/audio/salamander/"
}).toDestination();


// Use Tone Transport to schedule the notes
class TonePlayer {

	// Use the salamander sampler
	constructor() {
		this.sampler = salamanderSampler;
	}

	/**
     * Use Tone.js Transport to play a series of notes encoded as strings
     * @param notes
     */
     play(notes, bpm) {
     	const sampler = this.sampler;

     	// Reset from the Transport and set bpm
     	Tone.Transport.bpm.value = bpm;
     	Tone.Transport.stop();
     	Tone.Transport.position = 0;
     	Tone.Transport.cancel();

     	// Schedule the notes, time represents absolute time in seconds
     	Tone.Transport.schedule((time) => {

     		// Relative time of note with respect to start of measure, in seconds
     		let relativeTime = 0;

     		// Loop over the notes
     		for (const note of notes) {

     			// Remove dot and rest
     			let noteDuration = note.duration.replace('.', '');
     			noteDuration = noteDuration.replace('r', '');

     			// Time of the note, remove 'r' if rest
     			let duration = noteDuration + 'n';

     			if (note.dot) {
     				duration = duration + '.';
     			}

     			// Only schedule if it is not a rest
     			if (!note.duration.includes('r')) {

     				// Schedule the note to be played in Transport timeline
     				// after previous notes have been played (-> relative time)
     				sampler.triggerAttackRelease(note.note, duration, time + relativeTime)
     			}

     			// Update relative time
     			relativeTime += Tone.Time(duration).toSeconds();
     		}
     	});

     	Tone.Transport.start();
     }
}