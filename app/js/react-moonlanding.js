import React, { useState, useEffect, useRef } from 'react'

const MoonLanding = () => {
  const [playing, setPlaying] = useState(false)

  const [state, setState] = useState({
    fd: [],
    ga: [],
    currentTime: 0,
    altitude: {},
    speed: {}
  })

  const audioRef = useRef()
  const trackbarRef = useRef()

  useEffect(() => {
    const audio = document.querySelector('audio')

    if (audio) {
      audio.addEventListener('timeupdate', onProgress)
      audio.addEventListener('progress', onProgress)
      window.addEventListener('resize', handleResize)
      handleResize()
    }

    return () => {
      audio.removeEventListener('timeupdate', onProgress)
      audio.removeEventListener('progress', onProgress)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

 const onProgress = (reset = false) => {
    var unbufferedPast = '#90d26a',
        unbufferedFuture = '#565860',
        bufferedPast = '#90d26a',
        bufferedFuture = '#7b7d82',
        activePosition = '#90d26a';

    if (audioRef.current.buffered.length > 0) {
      var tbWidth = trackbarRef.current.clientWidth,
          tbHeight = trackbarRef.current.clientHeight,
          length = audioRef.current.duration,
          currentTime = audioRef.current.currentTime;

      var tbc = trackbarRef.current.getContext("2d");

      var posX = (length > 0) ? (currentTime * (tbWidth - 1) / length) | 0 : 0;

      tbc.clearRect(0, 0, tbWidth, tbHeight);

      if (length <= 0)
        return;

      var nextStartX = 0;

      // first we do the maths for the canvas playbar
      for (var r = 0; r < audioRef.current.buffered.length; r++) {
        var startX = (audioRef.current.buffered.start(r) * tbWidth / length) | 0,
            endX = (audioRef.current.buffered.end(r) * tbWidth / length) | 0;

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

      // now let's sort out the conversation stuff
      let newState = JSON.parse(JSON.stringify(state))

      newState.currentTime = Math.floor(currentTime)

      if (reset) {
        // first sort comms
        let fdTime = false,
            gaTime = false;

        for (let i = cFT; i > 0; i--) {
          if (typeof Descent.fdIndex[i] !== 'undefined' && fdTime === false)
            fdTime = i;

          if (typeof Descent.gaIndex[i] !== 'undefined' && gaTime === false)
            gaTime = i;
        }

        // we can force this as we know for sure that it will return results
        const fd = getLoopText('fd', fdTime, true),
              ga = getLoopText('ga', gaTime, true)

        if (fd !== false)
          newState.fd = fd

        if (ga !== false)
          newState.ga = ga

        // work out altitude and speed
        const aKeys = Object.keys(Descent.altitude),
              sKeys = Object.keys(Descent.speed)

        let aKey, sKey

        for (let i = 0; i < aKeys.length; i++) {
          if (newState.currentTime > aKeys[i])
            aKey = aKeys[i];
        }

        for (let i = 0; i < sKeys.length; i++) {
          if (newState.currentTime > sKeys[i])
            sKey = sKeys[i];
        }

        const aOjb = JSON.parse(JSON.stringify(Descent.altitude[aKey])),
              sOjb = JSON.parse(JSON.stringify(Descent.speed[sKey]))

        aOjb.v = aOjb.v + (aOjb.r * (newState.currentTime - aKey));
        sOjb.v = sOjb.v + (sOjb.r * (newState.currentTime - aKey));

        newState.altitude = aOjb;
        newState.speed = sOjb;
      }
      else {
        // sort out the descent stats for a non-reset command
        // only do this once per second
        if (Descent.altitude[newState.currentTime])
          newState.altitude = JSON.parse(JSON.stringify(Descent.altitude[newState.currentTime]))
        else if (newState.currentTime > state.currentTime)
          newState.altitude.v = newAltitude.v + newAltitude.r

        if (Descent.speed[newState.currentTime])
          newState.speed = JSON.parse(JSON.stringify(Descent.speed[newState.currentTime]));
        else if (newState.currentTime > state.currentTime)
          newState.speed.v = newState.speed.v + newState.speed.r;

        const fd = getLoopText('fd', newState.currentTime, false),
              ga = getLoopText('ga', newState.currentTime, false)

        if (fd)
          newState.fd = fd

        if (ga)
          newState.ga = ga
      }

      if (newState.currentTime > state.currentTime) { // so we only do this once per second
        const fd = getLoopText('fd', newState.currentTime, false),
              ga = getLoopText('ga', newState.currentTime, false)

        if (fd)
          newState.fd = fd

        if (ga)
          newState.ga = ga
      }

      setState(newState)
    }
  }

  const getLoopText = (mode, cFT, force) => {
    const comms = (mode === 'fd') ? 'fdIndex' : 'gaIndex'

    // make sure we only do this once per second, and that there's data
    if ((cFT > state.currentTime || typeof Descent[comms][cFT] === 'undefined') && !force)
      return false

    const relComms = (mode === 'fd') ? FlightDirector : GroundAir
    const incFromKey = Descent[comms][cFT]

    let start = 0

    // get 3 either side
    if (incFromKey >= 5 && incFromKey < relComms.length - 10)
      start = incFromKey - 5
    else if (incFromKey >= 5)
      start = relComms.length - 10

    return relComms.slice(start, start + 10)
  }

  const handleTimeChange = click => {
    let x = click.pageX,
        y = click.pageY

    let currentElement = click.target

    while (currentElement) {
      x -= currentElement.offsetLeft
      y -= currentElement.offsetTop
      currentElement = currentElement.offsetParent
    }

    audioRef.current.currentTime = audioRef.current.duration * x / (trackbarRef.current.clientWidth + 1)

    onProgress(true)
  }

  const handleBookmarkTimeChange = (e) => {
    audioRef.current.currentTime = e.target.dataset.timestamp
    onProgress(true)
  }

  const handleResize = () => {
    trackbarRef.current.setAttribute('height', trackbarRef.current.clientHeight + 'px')
    trackbarRef.current.setAttribute('width', trackbarRef.current.clientWidth + 'px')
    onProgress()
  }

  const togglePlayback = (e) => {
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    }
    else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const toggleVolume = (e) => {
    if (e.target.dataset.volup === '1' && audioRef.current.volume < 1)
      audioRef.current.volume += 0.1;
    else if (e.target.dataset.volup === '0' && audioRef.current.volume > 0)
      audioRef.current.volume -= 0.1;
  }

  const renderAudio = () => {
    return (
      <audio ref={audioRef}>
        <source src="/fly-me-to-the-moon/audio/apollo_11_landing.mp3" type="audio/mpeg" />
        <p>Your browser does not support the audio element.</p>
      </audio>
    )
  }

  const renderComms = (mode) => {
    let list = [];

    for (let i = 0; i < state[mode].length; i++) 
      list[i] = renderCommsList(state[mode][i], mode, i);

    return <ul key={`comms_${mode}`}>{list}</ul>
  }

  const renderCommsList = (item, mode, i) => {
    return (
      <li key={mode + i}>
        <span title={item.name} className="position">{item.position}</span>
        <span title={item.name} className="text">{item.text}</span>
      </li>
    );
  };

  const renderBookmark = ({ key, t, text }) => {
    const percent = (item.t / audioRef.current.duration) * 100;

    return (
      <li
        key={key}
        data-timestamp={t}
        title={text}
        onClick={handleBookmarkTimeChange}
        style={{ left: `${percent}%` }}
      >
        <i className="fa fa-bookmark" data-timestamp={t}></i>
      </li>
    )
  }


  const renderControls = () => {
    const playbackClass = playing ? "fa fa-pause-circle" : "fa fa-play-circle";
    const list = (!audioRef.current || !audioRef.current.duration) ? [] : Descent.bookmarks.map(bookmark => renderBookmark(bookmark));

    return (
      <div className="audioplayer_controls col col-xs-12">
        <ul id="events_panel">{list}</ul>
        <canvas ref={ref => audioRef.current = ref} onClick={handleTimeChange} />
        <i className={playbackClass} onClick={togglePlayback} />
        <i className="fa fa-volume-up" data-volup={1} onClick={toggleVolume} />
        <i className="fa fa-volume-down" data-volup={0} onClick={toggleVolume} />
      </div>
    )
  }

  const renderStats = () => {
    const cFT = (!audioRef.current || !audioRef.current.currentTime) ? 0 : Math.floor(audioRef.current.currentTime)

    let audioTime = "00:00",
        timeToLanding = "15:05"

    if (typeof moment !== 'undefined') {
      const momentAudioTime = moment.duration(cFT | 0, "seconds"),
            momentTimeToLanding = moment.duration(905 - cFT | 0, "seconds")

      const audioTimeMin = (momentAudioTime.minutes() > 9) ? momentAudioTime.minutes() : "" + 0 + momentAudioTime.minutes(),
            audioTimeSec = (momentAudioTime.seconds() > 9) ? momentAudioTime.seconds() : "" + 0 + momentAudioTime.seconds()

      audioTime = audioTimeMin + ':' + audioTimeSec;

      var timeToLandingMin = (momentTimeToLanding.minutes() > 9) ? momentTimeToLanding.minutes() : "" + 0 + momentTimeToLanding.minutes();
      var timeToLandingSec = (momentTimeToLanding.seconds() > 9) ? momentTimeToLanding.seconds() : "" + 0 + momentTimeToLanding.seconds();

      timeToLanding = (momentTimeToLanding.seconds() > 0) ? timeToLandingMin + ':' + timeToLandingSec : "00:00";
    }

    const aFormat = (state.altitude.v % 1 === 0) ? '0,0' : '0,0.0',
          sFormat = (state.speed.v % 1 === 0) ? '0,0' : '0,0.0'

    const formattedA = (typeof state.altitude.v !== 'undefined') ? numeral(state.altitude.v).format(aFormat) : 0,
          formattedS = (typeof state.speed.v !== 'undefined') ? numeral(state.speed.v).format(sFormat) : 0

    return (
      <div className="row" id="stats">
        <div className="col col-xs-6 col-xs-6 col-lg-3">
          <h3>Altitude</h3>
          <p>{formattedA} feet</p>
        </div>
        <div className="col col-xs-6 col-xs-6 col-lg-3">
          <h3>Speed</h3>
          <p>{formattedS} feet per second</p>
        </div>
        <div className="col col-xs-6 col-xs-6 col-lg-3">
          <h3>Time</h3>
          <p>{getAudioTime(currentTime)}</p>
        </div>
        <div className="col col-xs-6 col-xs-6 col-lg-3">
          <h3>Landing</h3>
          <p>{getTimeToLanding(currentTime)}</p>
        </div>
      </div>
    )
  }

  return (
    <div id="moonlanding">
      {renderAudio()}
      {renderControls()}
      {renderStats()}
      <div className="row">
        <div className="col col-xs-12 col-sm-6 dialogue">
          <h3>CAPCOM/Eagle</h3>
          {state.ga !== undefined && state.ga.length > 0 && renderComms('ga')}
        </div>
        <div className="col col-xs-12 col-sm-6 dialogue">
          <h3>Mission Control</h3>
          {state.fd !== undefined && state.fd.length > 0 && renderComms('fd')}
        </div>
      </div>
    </div>
  );
};

export default MoonLanding;
