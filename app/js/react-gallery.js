import React from 'react';

export default class Gallery extends React.Component {
	constructor(props) {
		super();

		this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
		this.renderGalleryImg = this.renderGalleryImg.bind(this);
		this.setGallerySettings = this.setGallerySettings.bind(this);
		this.buttonHandler = this.buttonHandler.bind(this);

		this.state = {
			galleryPointer: 0,
			maxHeight: 600,
			maxWidth: 600,
			showImgs: 0
		};
	}

	componentDidMount() {
		if (typeof window !== 'undefined') {
			this.setGallerySettings();
			window.addEventListener('resize', this.setGallerySettings);
		}
	}

	componentWillUnmount(){ window.removeEventListener('resize', this.setGallerySettings) }
	componentWillReceiveProps() { this.setState({ galleryPointer: 0 }) }
		
	setGallerySettings() {
		var dims = (typeof getViewportSize === 'function') ? getViewportSize() : false;
		var showImgs = (typeof this.props.showImgs !== 'undefined' && dims !== false && dims.width > 1120) ? this.props.showImgs : 1;

		this.setState({
			maxHeight: (dims !== false) ? dims.height : 0,
			maxWidth: (dims !== false) ? dims.width : 0,
			showImgs: showImgs
		});
	}

	renderGalleryImg(imgData) {
		// width and height are less than max settings
		if (typeof imgData.height !== 'undefined' && imgData.height < this.state.maxHeight && typeof imgData.width !== 'undefined' && imgData.width < this.state.maxWidth) {
			var height = imgData.height;
			var width = imgData.width;
		}
		// height and width too big
		else if (typeof imgData.height !== 'undefined' && typeof imgData.width !== 'undefined' && imgData.height > this.state.maxHeight && imgData.width > this.state.maxWidth) {
			var height = imgData.height * (this.state.maxWidth / imgData.width);
			var width = this.state.maxWidth;
		}
		// height too big, reduce height, width needs altering to respect aspect ratio
		else if (typeof imgData.height !== 'undefined' && typeof imgData.width !== 'undefined' && imgData.height > this.state.maxHeight) {
			var height = this.state.maxHeight;
			var width = imgData.width * (this.state.maxHeight / imgData.height);
		}
		// width too big, reduce width, height needs altering to respect aspect ratio
		else if (typeof imgData.height !== 'undefined' && typeof imgData.width !== 'undefined' && imgData.width > this.state.maxWidth) {
			var height = imgData.height * (this.state.maxWidth / imgData.width);
			var width = this.state.maxWidth;
		}
		// height or width aren't set, let the browser work it out
		else {
			var height = '';
			var width = '';
		}

		return React.createElement("img", { key: 'img' + imgData.path, className: 'galleryImg', src: imgData.path, height: height, width: width })
	}

	buttonHandler(e) {
		// detect activation on the icon, or on the parent
		if (e.target.dataset.direction === 'forward')
			var newPointerPosition = (this.state.galleryPointer + this.state.showImgs < this.props.images.length) ? this.state.galleryPointer + 1 : false;
		else
			var newPointerPosition = (this.state.galleryPointer - 1 < 0) ? false : this.state.galleryPointer - 1;

		// need to explicitly check for false, as if () checks ==, not ===
		if (newPointerPosition !== false)
			this.setState({ galleryPointer: newPointerPosition });
	}

	leftPointer() {
		return (
			React.createElement("span", { className: 'fa_button', id: 'galleryBack', 'data-direction': 'backward', onClick: this.buttonHandler },
				React.createElement("i", { className: 'fa fa-angle-double-left', 'data-direction': 'backward' })
			)
		)
	}

	rightPointer() {
		return (
			React.createElement("span", { className: 'fa_button', id: 'galleryForward', 'data-direction': 'forward',  onClick: this.buttonHandler },
				React.createElement("i", { className: 'fa fa-angle-double-right', 'data-direction': 'forward' })
			)
		)
	}

	render() {
		var n = (this.state.galleryPointer + this.state.showImgs <= this.props.images.length)
			? this.state.galleryPointer + this.state.showImgs
			: this.props.images.length;

		var gallery = [];
		for (var i = this.state.galleryPointer; i < n; i++) {
			gallery.push(this.renderGalleryImg(this.props.images[i]));
		}

		var leftPointer = (this.state.galleryPointer > 0) ? this.leftPointer() : [];
		var rightPointer = (this.state.galleryPointer + this.state.showImgs < this.props.images.length) ? this.rightPointer() : [];

		return (
			React.createElement("div", { className: 'gallery_widget', id: this.props.id, key: this.props.key },
				React.createElement("h4", null, this.props.title),
				React.createElement("div", { className: 'gallery' },
					leftPointer,
					rightPointer,
					gallery
				)
			)
		)
	}
}