import React from 'react';
import GroundAir from '../json/air_ground.json';
import FlightDirector from '../json/flight_director.json';

export default class MoonLanding extends React.Component {
	constructor() {
		super();

		this.togglePlayback = this.togglePlayback.bind(this);
		this.toggleVolume = this.toggleVolume.bind(this);

		this.state = { time: 0 };
	}

	togglePlayback(e) {
		console.log(e.target.dataset);
		if (e.target.dataset.playback === true)
			this.refs.audio.play();
		else
			this.refs.audio.pause();
	}

	toggleVolume(e) {
		console.log(e.target.dataset);
		if (e.target.dataset.volup && this.refs.audio.volume < 1)
			this.refs.audio.volume += 0.1;
		else if (e.target.dataset.volup === false && this.refs.audio.volume > 0)
			this.refs.audio.volume -= 0.1;
	}

	renderAudio() {
		return (
			React.createElement("audio", { ref: "audio" },
			  React.createElement("source", { src: "/fly-me-to-the-moon/audio/apollo_11_landing.mp3", type: "audio/mpeg"}),
				React.createElement("p", null, "Your browser does not support the audio element.")
			)
		)
	}

	renderControls() {
		return (
			React.createElement("div", null,
				React.createElement("button", { "data-playback": true, onClick: this.togglePlayback }, "Play the Audio"),
				React.createElement("button", { "data-playback": false, onClick: this.togglePlayback }, "Pause the Audio"),
				React.createElement("button", { "data-volup": true, onClick: this.toggleVolume }, "Increase Volume"),
				React.createElement("button", { "data-volup": false, onClick: this.toggleVolume }, "Decrease Volume")
			)
		)
	}

	render() {
		var audio = this.renderAudio();
		var controls = this.renderControls();

		return (
			React.createElement("div", null,
				audio,
				controls
			)
		);
	}
}