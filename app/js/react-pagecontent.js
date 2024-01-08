import React from 'react';
import Markdown from './react-markdown.js';
import Image from './react-image.js';
import Gallery from './react-gallery.js';
import YouTube from './react-youtube.js';
import MoonLanding from './react-moonlanding.js';

const components = { MoonLanding, Markdown, Image, Gallery, YouTube }

const PageContent = ({ props }) => {
  const renderElement = (item) => {
    if (typeof window !== 'undefined') {
      const id = item.id || 'No id';
      const path = window.location.pathname;
      const eventType = item.type;
    }

    Component = Components[item.type]

    return <Component {...item} />;
  };

  const recurseElements = (item) => {
    return Array.isArray(item)
      ? item.map(recurseElements)
      : renderElement(item);
  };

  return (
    <div id="content">
      {Object.keys(props).map(i => recurseElements(props[i]))}
    </div>
  );
};

export default PageContent;
