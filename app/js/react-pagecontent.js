import React from 'react';
import marked from 'marked';
import YouTube from './react-youtube.js';

export default class PageContent extends React.Component {
	constructor() {
		super();

		this.renderElement = this.renderElement.bind(this);
		this.recurseElements = this.recurseElements.bind(this);
	}

	renderElement(item) {
		var components = {
			'YouTube': YouTube
		};

		return (item.type === 'markdown')
			? React.createElement("div", { key: item.key, className: item.className, dangerouslySetInnerHTML: { __html: marked(item.content) } })
			: React.createElement(components[item.type], item);
	}

	recurseElements(item) {
		return (Object.prototype.toString.call(item) === '[object Array]')
			? item.map(this.recurseElements)
			: this.renderElement(item);
	}

	render() {
		var content = [];

		for (var i = 0; i < Object.keys(this.props).length; i++) {
			content.push(this.recurseElements(this.props[i]));
		}

		return React.createElement("div", { id: "content" }, content)
	}
}