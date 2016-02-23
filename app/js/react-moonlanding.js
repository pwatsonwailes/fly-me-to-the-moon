import React from 'react';
import GroundAir from '../json/air_ground.json';
import FlightDirector from '../json/flight_director.json';

export default class MoonLanding extends React.Component {
	constructor(){
		super();

		this.togglePlayback = this.togglePlayback.bind(this);
		this.toggleVolume = this.toggleVolume.bind(this);

		this.onPlayStart = this.onPlayStart.bind(this);
		this.onProgress = this.onProgress.bind(this);
		this.handleTimeChange = this.handleTimeChange.bind(this);
		this.handleBookmarkTimeChange = this.handleBookmarkTimeChange.bind(this);
		this.handleResize = this.handleResize.bind(this);

		this.renderControls = this.renderControls.bind(this);
		this.renderComms = this.renderComms.bind(this);
		this.renderCommsList = this.renderCommsList.bind(this);
		this.renderBookmark = this.renderBookmark.bind(this);

		this.state = {
			ga: [],
			fd: [],
			playing: false,
			currentTime: 0,
			loaded: 0,
			played: 0
		};
	}

	componentDidMount(){
		this.refs.audio.addEventListener('timeupdate', this.onProgress);
		this.refs.audio.addEventListener('progress', this.onProgress);
		this.refs.audio.addEventListener('playing', this.onPlayStart);
		this.refs.audio.addEventListener('ended', this.onEnded);

		window.addEventListener('resize', this.handleResize);

		this.handleResize();
	}

	componentWillUnmount(){ window.removeEventListener('resize', this.handleResize) }

	onProgress(reset){
		var unbufferedPast = '#90d26a',
				unbufferedFuture = '#565860',
				bufferedPast = '#90d26a',
				bufferedFuture = '#7b7d82',
				activePosition = '#90d26a';

		if (typeof reset === 'undefined' || reset !== true)
			reset = false;

		if (this.refs.audio.buffered.length > 0) {
			var tbWidth = this.refs.trackbar.clientWidth,
					tbHeight = this.refs.trackbar.clientHeight,
					length = this.refs.audio.duration,
					currentTime = this.refs.audio.currentTime;

			var tbc = this.refs.trackbar.getContext("2d");

			var posX = (length > 0) ? (currentTime * (tbWidth - 1) / length) | 0 : 0;

			tbc.clearRect(0, 0, tbWidth, tbHeight);

			if (length <= 0)
				return;

			var nextStartX = 0;

			// first we do the maths for the canvas playbar
			for (var r = 0; r < this.refs.audio.buffered.length; r++) {
				var startX = (this.refs.audio.buffered.start(r) * tbWidth / length) | 0,
						endX = (this.refs.audio.buffered.end(r) * tbWidth / length) | 0;

				if (startX > nextStartX) {
					if (posX > nextStartX) {
						tbc.fillStyle = unbufferedPast;
						tbc.fillRect(nextStartX, 0, Math.min(posX - 1, startX) - nextStartX, tbHeight);
					}

					if (posX < startX) {
						tbc.fillStyle = unbufferedFuture;
						tbc.fillRect(Math.max(posX + 1, nextStartX), 0, startX, tbHeight);
					}

				}

				if (posX > startX) {
					tbc.fillStyle = bufferedPast;
					tbc.fillRect(startX, 0, Math.min(posX, endX) - 1 - startX, tbHeight);
				}

				if (posX < endX) {
					tbc.fillStyle = bufferedFuture;
					tbc.fillRect(Math.max(posX + 1, startX), 0, endX - 1, tbHeight);
				}

				nextStartX = endX;
			}

			if (posX > nextStartX) {
				tbc.fillStyle = unbufferedPast;
				tbc.fillRect(nextStartX, 0, posX - 1 - nextStartX, tbHeight);
			}

			nextStartX = Math.max(posX + 1, nextStartX);

			if (nextStartX < tbWidth) {
				tbc.fillStyle = unbufferedFuture;
				tbc.fillRect(nextStartX, 0, tbWidth - nextStartX, tbHeight);
			}

			tbc.fillStyle = activePosition;
			tbc.fillRect(Math.max(0, posX - 1), 0, 3, tbHeight);

			var currentFloorTime = Math.floor(currentTime);

			// now let's sort out the conversation stuff
			var newState = {
				ga: (reset) ? [] : this.state.ga,
				fd: (reset) ? [] : this.state.fd,
				currentTime: currentFloorTime,
				loaded: this.refs.audio.buffered.end(0) / this.refs.audio.duration,
				played: currentTime / this.refs.audio.duration
			};

			if (currentFloorTime > this.state.currentTime) { // so we only do this once per second
				if (typeof GroundAir[currentFloorTime] !== 'undefined') {
					for (var i = 0; i < GroundAir[currentFloorTime].length; i++) {
						newState.ga.unshift(GroundAir[currentFloorTime][i]);
					}

					while (newState.ga.length > 6) {
						newState.ga.pop();
					}
				}

				if (typeof FlightDirector[currentFloorTime] !== 'undefined') {
					for (var i = 0; i < FlightDirector[currentFloorTime].length; i++) {
						newState.fd.unshift(FlightDirector[currentFloorTime][i]);
					}

					while (newState.fd.length > 6) {
						newState.fd.pop();
					}
				}
			}

			this.setState(newState);
		}
	}

	onPlayStart() { this.setState({ played: 0, loaded: 0 }) }

	getRelativeLocation(click) {
		var x = click.pageX,
			y = click.pageY;

		var currentElement = click.target;

		while (currentElement) {
			x -= currentElement.offsetLeft;
			y -= currentElement.offsetTop;
			currentElement = currentElement.offsetParent;
		}

		return { x: x, y: y };
	}

	handleTimeChange(properties){
		var offset = this.getRelativeLocation(properties);

		this.refs.audio.currentTime = this.refs.audio.duration * offset.x / (this.refs.trackbar.clientWidth + 1);

		this.onProgress(true);
	}

	handleBookmarkTimeChange(e){
		this.refs.audio.currentTime = e.target.dataset.timestamp;
		this.onProgress(true);
	}

	handleResize(){
		this.refs.trackbar.setAttribute('height', this.refs.trackbar.clientHeight + 'px');
		this.refs.trackbar.setAttribute('width', this.refs.trackbar.clientWidth + 'px');
		this.onProgress();
	}

	togglePlayback(e){
		if (this.state.playing === true) {
			this.refs.audio.pause();
			this.setState({ playing: false });
		}
		else {
			this.refs.audio.play();
			this.setState({ playing: true });
		}
	}

	toggleVolume(e){
		if (e.target.dataset.volup === '1' && this.refs.audio.volume < 1)
			this.refs.audio.volume += 0.1;
		else if (e.target.dataset.volup === '0' && this.refs.audio.volume > 0)
			this.refs.audio.volume -= 0.1;
	}

	renderAudio(){
		return (
			React.createElement("audio", { ref: "audio" },
			  React.createElement("source", { src: "/fly-me-to-the-moon/audio/apollo_11_landing.mp3", type: "audio/mpeg"}),
				React.createElement("p", null, "Your browser does not support the audio element.")
			)
		)
	}

	renderComms(mode) {
		var list = [];

		if (this.state[mode].length > 0) {
			for (var i = 0; i < this.state[mode].length; i++) {
				list[i] = this.renderCommsList(this.state[mode][i], mode, i);
			}

			return React.createElement("ul", { key: 'comms' + mode }, list);
		}
		else
			return list;
	}

	renderCommsList(item, mode, i) { return React.createElement("li", { key: mode + i }, item.name + "  (" + item.position + "): " + item.text) }
	
	renderBookmark(item) {
		var percent = (item.t / this.refs.audio.duration) * 100;

		return (
			React.createElement("li", { key: item.key, "data-timestamp": item.t, title: item.text, onClick: this.handleBookmarkTimeChange, style: { left: percent + "%" }},
				React.createElement("i", { className: "fa fa-bookmark", "data-timestamp": item.t })
			)
		)
	}

	renderControls(){
		var playbackClass = (this.state.playing === true) ? "fa fa-pause-circle" : "fa fa-play-circle";

		var bookmarks = [
			{ t: 380, text: "Go NoGo", key: "GoNoGo1" },
			{ t: 467, text: "First Program Alarm, 1202", key: "FirstProgramAlarm1202" },
			{ t: 515, text: "Second Program Alarm, 1202", key: "SecondProgramAlarm1202" },
			{ t: 668, text: "Go NoGo", key: "GoNoGo2" },
			{ t: 698, text: "Third Program Alarm, 1201", key: "ThirdProgramAlarm1201" },
			{ t: 739, text: "Fourth Program Alarm, 1202", key: "FourthProgramAlarm1202" },
			{ t: 838, text: "Low Level Fuel Warning", key: "LowLevelFuelWarning" },
			{ t: 857, text: "60 Seconds of Fuel Warning", key: "60SecondsofFuelWarning" },
			{ t: 885, text: "30 Seconds of Fuel Warning", key: "30SecondsofFuelWarning" },
			{ t: 901, text: "Contact Light", key: "ContactLight" },
			{ t: 920, text: "The Eagle has Landed!", key: "TheEaglehasLanded" },
			{ t: 973, text: "T1 Stay NoStay", key: "T1StayNoStay" }
		];

		var list = (!this.refs || !this.refs.audio || !this.refs.audio.duration) ? [] : bookmarks.map(this.renderBookmark);

		return (
			React.createElement("div", { className: "audioplayer_controls col col-xs-12" },
				React.createElement("ul", { id: "events_panel" }, list),
				React.createElement("canvas", { ref: "trackbar", onClick: this.handleTimeChange }),
				React.createElement("i", { className: playbackClass, onClick: this.togglePlayback }),
				React.createElement("i", { className: "fa fa-volume-up", "data-volup": 1, onClick: this.toggleVolume }),
				React.createElement("i", { className: "fa fa-volume-down", "data-volup": 0, onClick: this.toggleVolume })
			)
		)
	}

	renderStats(){
		var altitude = 0,
				hSpeed = 0,
				dRate = 0,
				tLeft = 0;

		return (
			React.createElement("div", { className: "row" },
				React.createElement("div", { className: "col col-xs-3" },
					React.createElement("h3", null, "Altitude"),
					React.createElement("p", null, altitude)
				),
				React.createElement("div", { className: "col col-xs-3" },
					React.createElement("h3", null, "Horizontal Speed"),
					React.createElement("p", null, hSpeed)
				),
				React.createElement("div", { className: "col col-xs-3" },
					React.createElement("h3", null, "Descent Rate"),
					React.createElement("p", null, dRate)
				),
				React.createElement("div", { className: "col col-xs-3" },
					React.createElement("h3", null, "Time to Landing"),
					React.createElement("p", null, tLeft)
				)
			)
		)
	}

	render(){
		var audio = this.renderAudio();
		var controls = this.renderControls();
		var stats = this.renderStats();
		var groundAir = this.renderComms('ga');
		var flightDirector = this.renderComms('fd');

		return (
			React.createElement("div", null,
				audio,
				controls,
				stats,
				React.createElement("div", { className: "row" },
					React.createElement("div", { className: "col col-xs-6" },
						React.createElement("h3", null, 'CAPCOM/Eagle'),
						groundAir
					),
					React.createElement("div", { className: "col col-xs-6" },
						React.createElement("h3", null, 'Flight Director COMMs'),
						flightDirector
					)
				)
			)
		);
	}
}