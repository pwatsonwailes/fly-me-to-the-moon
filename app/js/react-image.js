import React from 'react';

const Image = (props) => {
  const renderCaption = (caption) => {
    return <figcaption key={props.key + 'Caption'}>{props.caption}</figcaption>;
  };

  const classes = props.className !== undefined ? props.className : '';
  const alt = props.alt !== undefined ? props.alt : '';
  const caption = props.caption !== undefined && props.caption !== '' ? renderCaption() : null;

  return (
    <div className={'media_widget image ' + classes} id={props.id} key={props.key}>
      <figure className="image_container">
        <img src={props.src} alt={alt} />
        {caption}
      </figure>
    </div>
  );
};

export default Image;
