import React, { useEffect, useState } from 'react';
import JsonData from '../json/data.json';

import PageContent from './react-pagecontent.js';

const FMttM = (props) => {
  const [state, setState] = useState({
    title: props.title,
    description: props.description,
    content: props.content
  });

  const historyUpdate = () => {
    const section = String(window.location.pathname).match(/\/fly-me-to-the-moon\/.+/i) !== null
      ? window.location.pathname.replace('/fly-me-to-the-moon/', '').split('/')[0]
      : 'home';

    setSection({ target: { dataset: { section: section } } }, false);
  };

  const setSection = (e, updateHistory = true) => {
    if (e.preventDefault)
      e.preventDefault();

    const section = e.target.dataset.section;
    setState(JsonData[section]);

    if (updateHistory)
      history.pushState(null, `${JsonData[section].title} | Fly Me to the Moon`, `/fly-me-to-the-moon/${section}`);
  };

  useEffect(() => {
    if (typeof props.section !== 'undefined')
      setSection({ target: { dataset: { section: props.section } } });

    if (typeof window !== 'undefined')
      History.Adapter.bind(window, 'statechange', historyUpdate);

    return () => {
      if (typeof window !== 'undefined')
        History.Adapter.unbind(window, 'statechange', historyUpdate);
    };
  }, []);

  return (
    <div id="fmttmContainer">
      <PageContent {...state.content} />
    </div>
  );
};

export default FMttM;