import React from 'react';
import marked from 'marked';

const Markdown = (props) => {
  const classes = props.className !== undefined ? props.className : '';

  return <div key={props.key} id={props.id} className={classes} dangerouslySetInnerHTML={{ __html: marked(props.content) }} />
};

export default Markdown;
