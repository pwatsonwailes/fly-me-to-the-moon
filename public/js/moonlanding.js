import React, { useState, useRef, useEffect } from 'react'

import FlightDirector from '/assets/fmttm/js/flight_director.json'
import GroundAir from '/assets/fmttm/js/air_ground.json'
import Descent from '/assets/fmttm/js/descent.json'

const initialState = {
	fd: [],
	ga: [],
	altitude: {},
	speed: {},
	currentTime: 0,
	playing: false
}

const MoonLanding = props => {
	const [state, dispatch] = useReducer((state, changes) => { return { ...state, ...changes } }, initialState)

	const audioRef = useRef()
	const trackbarRef = useRef()

	useEffect(() => {
		window.addEventListener('resize', handleResize)

		audioRef.addEventListener('timeupdate', onProgress)
		audioRef.addEventListener('progress', onProgress)

		return function cleanup() {
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	const onProgress = (reset) => {
		const unbufferedPast = '#90d26a',
					unbufferedFuture = '#565860',
					bufferedPast = '#90d26a',
					bufferedFuture = '#7b7d82',
					activePosition = '#90d26a'

		if (typeof reset === 'undefined' || reset !== true)
			reset = false

		if (audioRef.buffered.length > 0) {
			var tbWidth = trackbarRef.clientWidth,
					tbHeight = trackbarRef.clientHeight,
					length = audioRef.duration,
					cFT = Math.floor(audioRef.currentTime)

			var tbc = trackbarRef.getContext("2d")

			var posX = (length > 0) ? (audioRef.currentTime * (tbWidth - 1) / length) | 0 : 0

			tbc.clearRect(0, 0, tbWidth, tbHeight)

			if (length <= 0)
				return

			var nextStartX = 0

			// first we do the maths for the canvas playbar
			for (var r = 0; r < audioRef.buffered.length; r++) {
				var startX = (audioRef.buffered.start(r) * tbWidth / length) | 0,
						endX = (audioRef.buffered.end(r) * tbWidth / length) | 0

				if (startX > nextStartX) {
					if (posX > nextStartX) {
						tbc.fillStyle = unbufferedPast
						tbc.fillRect(nextStartX, 0, Math.min(posX - 1, startX) - nextStartX, tbHeight)
					}

					if (posX < startX) {
						tbc.fillStyle = unbufferedFuture
						tbc.fillRect(Math.max(posX + 1, nextStartX), 0, startX, tbHeight)
					}
				}

				if (posX > startX) {
					tbc.fillStyle = bufferedPast
					tbc.fillRect(startX, 0, Math.min(posX, endX) - 1 - startX, tbHeight)
				}

				if (posX < endX) {
					tbc.fillStyle = bufferedFuture
					tbc.fillRect(Math.max(posX + 1, startX), 0, endX - 1, tbHeight)
				}

				nextStartX = endX
			}

			if (posX > nextStartX) {
				tbc.fillStyle = unbufferedPast
				tbc.fillRect(nextStartX, 0, posX - 1 - nextStartX, tbHeight)
			}

			nextStartX = Math.max(posX + 1, nextStartX)

			if (nextStartX < tbWidth) {
				tbc.fillStyle = unbufferedFuture
				tbc.fillRect(nextStartX, 0, tbWidth - nextStartX, tbHeight)
			}

			tbc.fillStyle = activePosition
			tbc.fillRect(Math.max(0, posX - 1), 0, 3, tbHeight)

			// now let's sort out the conversation stuff
			let newState = { currentTime: cFT }

			if (reset) {
				// first sort comms
				let fdTime = false
						gaTime = false

				for (var i = cFT; i > 0; i--) {
					if (typeof Descent.fdIndex[i] !== 'undefined' && fdTime === false)
						fdTime = i;

					if (typeof Descent.gaIndex[i] !== 'undefined' && gaTime === false)
						gaTime = i
				}

				// we can force this as we know for sure that it will return results
				var newFd = getLoopText('fd', fdTime, true)
				var newGa = getLoopText('ga', gaTime, true)

				if (newFd !== false)
					newState.fd = newFd

				if (newGa !== false)
					newState.ga = newGa

				// work out altitude and speed
				var aKeys = Object.keys(Descent.altitude)
				var sKeys = Object.keys(Descent.speed)

				for (var i = 0; i < aKeys.length; i++) {
					if (cFT > aKeys[i])
						var aKey = aKeys[i]
				}

				for (var i = 0; i < sKeys.length; i++) {
					if (cFT > sKeys[i])
						var sKey = sKeys[i]
				}

				var aOjb = JSON.parse(JSON.stringify(Descent.altitude[aKey]))
				var sOjb = JSON.parse(JSON.stringify(Descent.speed[sKey]))

				aOjb.v = aOjb.v + (aOjb.r * (cFT - aKey))
				sOjb.v = sOjb.v + (sOjb.r * (cFT - aKey))

				newState.altitude = aOjb
				newState.speed = sOjb
			}
			else {
				// sort out the descent stats for a non-reset command
				if (Descent.altitude[cFT])
					newState.altitude = JSON.parse(JSON.stringify(Descent.altitude[cFT]));
				else if (cFT > state.currentTime) { // so we only do this once per second
					var newAltitude = state.altitude
					newAltitude.v = newAltitude.v + newAltitude.r

					newState.altitude = newAltitude
				}

				if (Descent.speed[cFT])
					newState.speed = JSON.parse(JSON.stringify(Descent.speed[cFT]));
				else if (cFT > state.currentTime) { // so we only do this once per second
					var newSpeed = state.speed
					newSpeed.v = newSpeed.v + newSpeed.r

					newState.speed = newSpeed
				}

				const newFd = getLoopText('fd', cFT, false)
				const newGa = getLoopText('ga', cFT, false)

				if (newFd !== false)
					newState.fd = newFd

				if (newGa !== false)
					newState.ga = newGa
			}

			if (cFT > state.currentTime) { // so we only do this once per second
				var newFd = getLoopText('fd', cFT, false)
				var newGa = getLoopText('ga', cFT, false)

				if (newFd !== false)
					newState.fd = newFd

				if (newGa !== false)
					newState.ga = newGa
			}

			dispatch(newState)
		}
	}

	const getLoopText = (mode, cFT, force) => {
		const comms = (mode === 'fd') ? 'fdIndex' : 'gaIndex'

		// make sure we only do this once per second, and that there's data
		if ((cFT > state.currentTime || typeof Descent[comms][cFT] === 'undefined') && !force)
			return false

		const relComms = (mode === 'fd') ? FlightDirector : GroundAir
		const incFromKey = Descent[comms][cFT]

		// get 3 either side
		let start = 0

		if (incFromKey >= 5 && incFromKey < relComms.length - 10)
			start = incFromKey - 5
		else if (incFromKey >= 5)
			start = relComms.length - 10

		return relComms.slice(start, start + 10)
	}

	const getRelativeLocation = click => {
		var x = click.pageX,
			y = click.pageY

		var currentElement = click.target

		while (currentElement) {
			x -= currentElement.offsetLeft
			y -= currentElement.offsetTop
			currentElement = currentElement.offsetParent
		}

		return { x, y }
	}

	const handleTimeChange = properties => {
		const offset = getRelativeLocation(properties)

		audioRef.currentTime = audioRef.duration * offset.x / (trackbarRef.clientWidth + 1)
		onProgress(true)
	}

	const handleBookmarkTimeChange = e => {
		audioRef.currentTime = e.target.dataset.timestamp
		onProgress(true)
	}

	const handleResize = () => {
		trackbarRef.setAttribute('height', trackbarRef.clientHeight + 'px')
		trackbarRef.setAttribute('width', trackbarRef.clientWidth + 'px')
		onProgress()
	}

	const togglePlayback = e => {
		if (state.playing === true) {
			audioRef.pause()
			dispatch({ playing: false })
		}
		else {
			audioRef.play()
			dispatch({ playing: true })
		}
	}

	const toggleVolume = e => {
		if (e.target.dataset.volup === '1' && audioRef.volume < 1)
			audioRef.volume += 0.1
		else if (e.target.dataset.volup === '0' && audioRef.volume > 0)
			audioRef.volume -= 0.1
	}

	const renderCommsList = (item, mode, i) => {
		return (
			<li key={mode + i}>
				<span title={item.name} className="position">{item.position}</span>
				<span title={item.name} className="text">{item.text}</span>
			</li>
		)
	}

	const renderBookmark = (item) => {
		var percent = (item.t / audioRef.duration) * 100

		return (
			<li key={item.key} data-timestamp={item.t} title={item.text} onClick={handleBookmarkTimeChange} style={{ left: percent + "%" }}>
				<i className="fa fa-bookmark" data-timestamp={item.t} />
			</li>
		)
	}

	const renderStats = () => {
		var cFT = (!audioRef || !audioRef.currentTime) ? 0 : Math.floor(audioRef.currentTime)

		if (typeof moment !== 'undefined') {
			var momentAudioTime = moment.duration(cFT | 0, "seconds")

			var audioTimeMin = (momentAudioTime.minutes() > 9) ? momentAudioTime.minutes() : "" + 0 + momentAudioTime.minutes()
			var audioTimeSec = (momentAudioTime.seconds() > 9) ? momentAudioTime.seconds() : "" + 0 + momentAudioTime.seconds()

			var audioTime = audioTimeMin + ':' + audioTimeSec
		}
		else
			var audioTime = "00:00"
		
		if (typeof moment !== 'undefined') {
			var momentTimeToLanding = moment.duration(905 - cFT | 0, "seconds")

			var timeToLandingMin = (momentTimeToLanding.minutes() > 9) ? momentTimeToLanding.minutes() : "" + 0 + momentTimeToLanding.minutes()
			var timeToLandingSec = (momentTimeToLanding.seconds() > 9) ? momentTimeToLanding.seconds() : "" + 0 + momentTimeToLanding.seconds()

			var timeToLanding = (momentTimeToLanding.seconds() > 0) ? timeToLandingMin + ':' + timeToLandingSec : "00:00"
		}
		else
			var timeToLanding = "15:05"

		var aFormat = (state.altitude.v % 1 === 0) ? '0,0' : '0,0.0'
		var sFormat = (state.speed.v % 1 === 0) ? '0,0' : '0,0.0'

		var formattedA = (typeof state.altitude.v !== 'undefined') ? numeral(state.altitude.v).format(aFormat) : 0
		var formattedS = (typeof state.speed.v !== 'undefined') ? numeral(state.speed.v).format(sFormat) : 0

		return (
			<div className="row" id="stats">
				<div className="col col-xs-6 col-xs-6 col-lg-3">
					<h3>Altitude</h3>
					<p>{formattedA + ' feet'}</p>
				</div>
				<div className="col col-xs-6 col-xs-6 col-lg-3">
					<h3>Speed</h3>
					<p>{formattedS + ' feet per second'}</p>
				</div>
				<div className="col col-xs-6 col-xs-6 col-lg-3">
					<h3>Time</h3>
					<p>{audioTime}</p>
				</div>
				<div className="col col-xs-6 col-xs-6 col-lg-3">
					<h3>Landing</h3>
					<p>{timeToLanding}</p>
				</div>
			</div>
		)
	}

	const playbackClass = (state.playing === true) ? "fa fa-pause-circle" : "fa fa-play-circle"
	const list = (!audioRef || !audioRef.duration) ? [] : Descent.bookmarks.map(renderBookmark)

	return (
		<div id="moonlanding">
			<audio ref={audioRef}>
				<source src="/assets/fmttm/audio/landing.mp3" type="audio/mpeg" />
				<p>Your browser does not support the audio element.</p>
			</audio>
			<div className="audioplayer_controls col col-xs-12">
				<ul id="events_panel">{list}</ul>
				<canvas ref={trackbarRef} onClick={handleTimeChange} />
				<i className={playbackClass} onClick={togglePlayback} />
				<i className="fa fa-volume-up" data-volup='1' onClick={toggleVolume} />
				<i className="fa fa-volume-down" data-volup='0' onClick={toggleVolume} />
			</div>
			{renderStats()}
			<div className="row">
				<div className="col col-xs-12 col-sm-6 dialogue">
					<h3>CAPCOM/Eagle</h3>
					{typeof state.ga !== 'undefined' && state.ga.length > 0 && <ul>{state.ga.map((item, i) => { return renderCommsList(item, 'ga', i) })}</ul>}
				</div>
				<div className="col col-xs-12 col-sm-6 dialogue">
					<h3>Mission Control</h3>
					{typeof state.fd !== 'undefined' && state.fd.length > 0 && <ul>{state.fd.map((item, i) => { return renderCommsList(item, 'fd', i) })}</ul>}
				</div>
			</div>
		</div>
	)
}

ReactDOM.render(<MoonLanding />, document.getElementById("moonlanding"))