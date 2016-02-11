import React from 'react';

export default class Gallery extends React.Component {
	constructor() {
		super();

		this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
		this.renderGalleryImg = this.renderGalleryImg.bind(this);
		this.buttonHandler = this.buttonHandler.bind(this);

		this.state = {
			galleryPointer: 0,
			maxHeight: 600
		};
	}

	componentDidMount() {
		if (typeof window !== 'undefined')
			this.setState({ maxHeight: getViewportSize().height - 20 })
	}
	
	componentWillReceiveProps() { this.setState({ galleryPointer: 0 }); }

	renderGalleryImg(imgUrl) { return React.createElement("img", { key: 'img' + imgUrl, className: 'galleryImg', src: imgUrl }) }

	buttonHandler(e) {
		var id = (isset(e.target.id) &&(e.target.id === 'galleryBack' || e.target.id === 'galleryForward')) ? e.target.id : e.target.parentNode.id;

		if (id === 'galleryForward')
			var newPointerPosition = (this.state.galleryPointer + 3 < this.props.images.length) ? this.state.galleryPointer + 1 : false;
		else
			var newPointerPosition = (this.state.galleryPointer - 1 < 0) ? false : this.state.galleryPointer - 1;

		if (newPointerPosition)
			this.setState({ galleryPointer: newPointerPosition });
	}

	render() {
		var gallery = [];

		//var n = (this.state.galleryPointer <= this.props.images.length)
		//	? this.state.galleryPointer
		//	: this.props.images.length;

		//for (var i = this.state.galleryPointer; i < n; i++) {
		//	var img = this.renderGalleryImg(this.props.images[i]);
		//	gallery.push(img);
		//}

		return (
			React.createElement("div", { className: 'gallery_widget', key: this.props.key }, 'hello'
				/*React.createElement("h4", null, this.props.title),
				React.createElement("div", { class: 'gallery_controls' },
					React.createElement("span", { className: 'fa_button', id: 'galleryBack', onClick: this.buttonHandler },
						React.createElement("i", { className: 'fa fa-angle-double-left' })
					),
					React.createElement("span", { className: 'fa_button', id: 'galleryForward',  onClick: this.buttonHandler },
						React.createElement("i", { className: 'fa fa-angle-double-right' })
					)
				),
				React.createElement("div", { class: 'gallery' }, gallery)*/
			)
		)
	}
}