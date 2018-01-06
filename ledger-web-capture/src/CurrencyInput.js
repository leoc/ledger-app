import React, { Component } from 'react';

class CurrencyInput extends Component {
    constructor(props) {
	super(props);

	if(this.props.value) {
            this.state = {
		value: this.props.value,
		raw: this.props.value.toString().replace('.', '')
            };
	} else {
            this.state = {
		value: '0.00',
		raw: ''
	    };
	}
    }

    componentWillReceiveProps(nextProps) {
	this.setState({
	    value: nextProps.value || '0.00',
	    raw: nextProps.value.toString().replace('.', '')
	});
    }

    formatValue = (value) => {
	var str = value.toString().replace('.', '');
	str = str.replace(new RegExp('^0+'), '');
	if(str.length === 0) return '0.00';
	str = (str.length <= 3 ? '000'.slice(0, -str.length) + str : str);
	str = str.slice(0, -2) + "." + str.slice(-2);
	return str;
    }

    trackInput = (event) => {
	event.persist();
	var value = event.target.value;
	this.props.onChangeEvent(event, this.formatValue(value));
	this.setState({ value: this.formatValue(value), raw: value });
    }

    render() {
	return (
            <div className="currency-input group">
	      <input
		ref="currencyInput"
		className="hidden-currency-input"
	        type="number"
	        placeholder=""
		pattern="\d+\.\d{2}"
		value={this.state.raw}
		onChange={this.trackInput}
		onFocus={(e) => {
		    var val = e.target.value;
		    e.target.value = '';
		    e.target.value = val;
		}}
		required={this.props.required}
		autoFocus={this.props.autoFocus}
		/>
		<div className="overlay">{this.state.value}</div>
		<span className="bar"></span>
		<label>Amount</label>
            </div>
	);
    }
}

export default CurrencyInput;
