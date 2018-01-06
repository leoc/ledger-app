import React, { Component } from 'react';

function fuzzyMatch(str,pattern){
    pattern = pattern.split("").reduce(function(a,b){ return a+".*"+b; });
    return (new RegExp(pattern)).test(str);
};

class PayeeList extends Component {
    constructor(props) {
	super(props);
	this.state = { list: window.LATEST_TRANSACTIONS }
    }

    search = (event) => {
	var searchStr = event.target.value.toLowerCase();
	if(searchStr === "") {
	    this.setState({ list: window.LATEST_TRANSACTIONS })
	} else {
	    this.setState({
		list: window.LATEST_TRANSACTIONS.filter((xtn) => { return fuzzyMatch(xtn.payee.toLowerCase(), searchStr); })
	    })
	}
    }

    render() {
	return (
		<div className="react-capture">
		<header>
		<a className="back" onClick={this.props.onBack}></a>
		<a className="submit right" onClick={() => { this.props.onSubmit(this.refs.search.value) } }></a>
		<div className="group">
		<input ref="search" name="search" type="search" placeholder="Payee" defaultValue={this.props.payee} onChange={this.search} autoFocus autocomplete="off" />
		    <span className="bar"></span>
		</div>
		</header>
		<div className="content">
		<ul className="collection">
		{this.state.list.map(item => <li key={item.payee} onClick={() => { console.log(this.props); this.props.onSelect(item) }}><span className="title">{item.payee}</span><p>{item.account}</p></li>)}

		</ul>
    	        </div>
		</div>
	);
    }
}

export default PayeeList;
