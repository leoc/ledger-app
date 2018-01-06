import React, { Component } from 'react';

function fuzzyMatch(str,pattern){
    pattern = pattern.split("").reduce(function(a,b){ return a+".*"+b; });
    return (new RegExp(pattern)).test(str);
};

class AccountList extends Component {
    constructor(props) {
	super(props);

	var initialAccounts = [];
	if(this.props.payee !== "") {
	    var payee = window.PAYEE_ACCOUNTS.find((account) => {
		return account.name.toLowerCase() === this.props.payee.toLowerCase();
	    });
	    if(payee) initialAccounts = payee['latestAccounts'];
	}

	if(initialAccounts === undefined || initialAccounts === null || initialAccounts.length === 0) {
	    initialAccounts = window.ACCOUNTS;
	}

	console.log(initialAccounts);

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

    render() {
	return (
	    <div className="react-capture">
	      <header>
		<button className="back" onClick={this.props.onBack}></button>
		<div className="group">
		  <input name="search" type="search" placeholder="Filter account ..." onChange={this.search} autoFocus autocomplete="off" />
		  <span className="bar"></span>
		</div>
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
