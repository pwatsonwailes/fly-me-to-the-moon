import React, { useState, useEffect } from 'react';

const Gallery = (props) => {
  const [galleryPointer, setGalleryPointer] = useState(0);
  const [maxHeight, setMaxHeight] = useState(600);
  const [maxWidth, setMaxWidth] = useState(600);
  const [showImgs, setShowImgs] = useState(0);

  const setGallerySettings = () => {
    const dims = typeof getViewportSize === 'function' ? getViewportSize() : false;
    const newShowImgs =
      typeof props.showImgs !== 'undefined' && dims !== false && dims.width > 1120
        ? props.showImgs
        : 1;

    setMaxHeight(dims !== false ? dims.height : 0);
    setMaxWidth(dims !== false ? dims.width : 0);
    setShowImgs(newShowImgs);
  };

  const buttonHandler = (e) => {
    let newPointerPosition;

    if (e.target.dataset.direction === 'forward')
      newPointerPosition = galleryPointer + showImgs < props.images.length ? galleryPointer + 1 : false;
    else
      newPointerPosition = galleryPointer - 1 < 0 ? false : galleryPointer - 1;

    if (newPointerPosition !== false) {
      setGalleryPointer(newPointerPosition);
    }
  };

  const leftPointer = () => (
    <span className="fa_button" id="galleryBack" data-direction="backward" onClick={buttonHandler}>
      <i className="fa fa-angle-double-left" data-direction="backward"></i>
    </span>
  );

  const rightPointer = () => (
    <span className="fa_button" id="galleryForward" data-direction="forward" onClick={buttonHandler}>
      <i className="fa fa-angle-double-right" data-direction="forward"></i>
    </span>
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGallerySettings();
      window.addEventListener('resize', setGallerySettings);
    }

    return () => {
      window.removeEventListener('resize', setGallerySettings);
    };
  }, []);

  useEffect(() => {
    setGalleryPointer(0);
  }, [props]);

  const renderGalleryImg = (imgData) => {
    let height = '';
    let width = '';

    if (
      typeof imgData.height !== 'undefined' &&
      imgData.height < maxHeight &&
      typeof imgData.width !== 'undefined' &&
      imgData.width < maxWidth
    ) {
      height = imgData.height;
      width = imgData.width;
    } else if (
      typeof imgData.height !== 'undefined' &&
      typeof imgData.width !== 'undefined' &&
      imgData.height > maxHeight &&
      imgData.width > maxWidth
    ) {
      height = imgData.height * (maxWidth / imgData.width);
      width = maxWidth;
    } else if (
      typeof imgData.height !== 'undefined' &&
      typeof imgData.width !== 'undefined' &&
      imgData.height > maxHeight
    ) {
      height = maxHeight;
      width = imgData.width * (maxHeight / imgData.height);
    } else if (
      typeof imgData.height !== 'undefined' &&
      typeof imgData.width !== 'undefined' &&
      imgData.width > maxWidth
    ) {
      height = imgData.height * (maxWidth / imgData.width);
      width = maxWidth;
    }

    return <img key={'img' + imgData.path} className="galleryImg" src={imgData.path} height={height} width={width} />;
  };

  const n = galleryPointer + showImgs <= props.images.length ? galleryPointer + showImgs : props.images.length;

  const gallery = [];
  for (let i = galleryPointer; i < n; i++) {
    gallery.push(renderGalleryImg(props.images[i]));
  }

  return (
    <div className={'gallery_widget show_' + showImgs} id={props.id} key={props.key}>
      <h4>{props.title}</h4>
      <div className="gallery">
        {galleryPointer > 0 && leftPointer()}
        {galleryPointer + showImgs < props.images.length && rightPointer()}
        {gallery}
      </div>
    </div>
  );
};

export default Gallery;
