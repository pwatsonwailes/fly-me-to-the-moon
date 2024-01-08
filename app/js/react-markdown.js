import React from 'react';
import Markdown from 'marked-react';

const Markeddown = (props) => {
  const classes = props.className !== undefined ? props.className : '';

  return <div key={props.key} id={props.id} className={classes}><Markdown>{props.content}</Markdown></div>
};

export default Markeddown;
