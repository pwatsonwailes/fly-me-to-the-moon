import React from 'react';

export default class Image extends React.Component {
	constructor() {
		super();
	}

	renderCaption(caption) {
		return React.createElement("figcaption", { key: this.props.key + 'Caption' }, this.props.caption)
	}

	render() {
		var classes = (typeof this.props.className !== 'undefined') ? this.props.className : '';
		var alt = (typeof this.props.alt !== 'undefined') ? this.props.alt : '';
		var caption = (typeof this.props.caption !== 'undefined' && this.props.caption !== '') ? this.renderCaption() : '';

		return (
			React.createElement("div", { className: 'media_widget ' + classes, id: this.props.id, key: this.props.key },
				React.createElement("figure", { className: 'image_container' },
					React.createElement("img", { src: this.props.src, alt: alt }),
					caption
				)
			)
		)
	}
}