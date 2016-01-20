import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import JsonData from '../json/data.json';

import PageContent from './react-pagecontent.js';
import Social from './react-social.js';

export default class FMttM extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			title: props.title,
			description: props.description,
			content: props.content
		};

		this.componentDidMount = this.componentDidMount.bind(this);
		this.historyUpdate = this.historyUpdate.bind(this);
		this.setSection = this.setSection.bind(this);
	}

	componentDidMount() {
		var self = this;

		if (typeof this.props.section !== 'undefined')
			this.setSection({"target": {"dataset": { "section": this.props.section }}});

		if (typeof window !== 'undefined')
			History.Adapter.bind(window, 'statechange', function() { self.historyUpdate() })
	}

	historyUpdate() {
		var section = (String(window.location.pathname).match(/\/fly-me-to-the-moon\/.+/i) !== null)
			? window.location.pathname.replace('/fly-me-to-the-moon/', '').split('/')[0]
			: 'home';

		this.setSection({"target": {"dataset": { "section": section }}}, false);
	}

	setSection(e, updateHistory) {
		if (typeof e.preventDefault === 'function')
			e.preventDefault();

		// do stuff
		var section = e.target.dataset.section;

		this.setState(JsonData[section]);

		if (typeof updateHistory === 'undefined' || updateHistory !== false)
			History.pushState(null, JsonData[section].title + ' | History of Modern Humanity | Builtvisible', '/fly-me-to-the-moon/' + section);
	}

	render() {
		return (
			React.createElement("div", { id: "fmttmContainer" },
				//React.createElement(Social, null),
				React.createElement(PageContent, this.state.content)
			)
		);
	}
}