import React from 'react';

export default class YouTube extends React.Component {
	constructor() {
		super();
	}

	render() {
		var classes = (typeof this.props.className !== 'undefined') ? this.props.className : '';

		return (
			React.createElement("div", { className: 'media_widget youtube ' + classes, id: this.props.id, key: this.props.key },
				React.createElement("figure", { className: 'video_container' },
					React.createElement("iframe", { src: 'https://www.youtube.com/embed/' + this.props.sourceId + '?iv_load_policy=3', className: 'youtube' })
				)
			)
		)
	}
}