import React from 'react';

const YouTube = (props) => {
  const classes = props.className || '';

  return (
    <div className={`media_widget youtube ${classes}`} id={props.id} key={props.key}>
      <figure className="video_container">
        <iframe
          src={`https://www.youtube.com/embed/${props.sourceId}?iv_load_policy=3`}
          className="youtube"
          title="YouTube Video"
        ></iframe>
      </figure>
    </div>
  );
};

export default YouTube