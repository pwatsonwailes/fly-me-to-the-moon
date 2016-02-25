import React from 'react';
import marked from 'marked';

export default class Markdown extends React.Component {
	constructor() {
		super();
	}

	render() {
		var classes = (typeof this.props.className !== 'undefined') ? this.props.className : '';

		return React.createElement("div", { key: this.props.key, id: this.props.id, className: classes, dangerouslySetInnerHTML: { __html: marked(this.props.content) } });
	}
}