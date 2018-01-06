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

    submitValue = (event) => {
	event.preventDefault();
	this.props.onSubmit(this.refs.search.value);
    }

    render() {
	return (
	    <div className="react-capture">
	      <header>
		<form onSubmit={this.submitValue}>
		  <button className="back" type="button" onClick={this.props.onBack}></button>
		  <button className="submit right" type="submit"></button>
		  <div className="group">
		    <input
		      ref="search"
		      name="search"
		      type="search"
		      placeholder="Payee"
		      defaultValue={this.props.payee}
		      onChange={this.search}
		      autoFocus
		      autoComplete="off" />
		    <span className="bar"></span>
		  </div>
		</form>
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
