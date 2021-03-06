import React, { Component } from 'react';

function fuzzyMatch(str,pattern){
    pattern = pattern.split("").reduce(function(a,b){ return a+".*"+b; });
    return (new RegExp(pattern)).test(str);
};

class AccountList extends Component {
    constructor(props) {
	super(props);

	var initialAccounts = [];
	if(this.props.payee && this.props.payee !== "") {
	    var payee = window.PAYEE_ACCOUNTS.find((account) => {
		return account.name.toLowerCase() === this.props.payee.toLowerCase();
	    });
	    var latestAccounts = [];
	    if(payee) latestAccounts = payee['latestAccounts'];
	    initialAccounts = window.ACCOUNTS.filter((name) => {
		return latestAccounts.includes(name) || fuzzyMatch(name.toLowerCase(), this.props.payee.toLowerCase());
	    });
	}

	if(initialAccounts === undefined || initialAccounts === null || initialAccounts.length === 0) {
	    initialAccounts = window.ACCOUNTS;
	}

	this.state = {
	    list: initialAccounts
	};
    }

    search = (event) => {
	var searchStr = event.target.value.toLowerCase();
	if(searchStr === "") {
	    this.setState({ list: window.ACCOUNTS });
	} else {
	    this.setState({
		list: window.ACCOUNTS.filter((name) => { return fuzzyMatch(name.toLowerCase(), searchStr); })
	    });
	}
    }

    submitValue = (event) => {
	event.preventDefault();
	this.props.onSelect(this.refs.search.value);
    }

    render() {
	return (
	    <div className="react-capture">
	      <header>
		<form onSubmit={this.submitValue}>
		  <button className="back" onClick={this.props.onBack} type="button"></button>
		  <button className="submit right" type="submit"></button>
		  <div className="group">
		    <input
		      ref="search"
		      name="search"
		      defaultValue={this.props.account || ''}
		      type="search"
		      placeholder="Filter account ..."
		      onChange={this.search}
		      onFocus={(e) => {
			  var val = e.target.value;
			  e.target.value = '';
			  e.target.value = val;
		      }}
		      autoFocus
		      autoComplete="off" />
		    <span className="bar"></span>
		  </div>
		</form>
	      </header>
	      <div className="content">
		<ul className="collection">
		  {this.state.list.map(item => <li key={item} onClick={() => { this.props.onSelect(item); }}><span className="title">{item}</span></li>)}
	        </ul>
	      </div>
	    </div>
	);
    }
}

export default AccountList;
