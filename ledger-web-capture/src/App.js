import React, { Component } from 'react';
import CurrencyInput from './CurrencyInput';
import PayeeList from './PayeeList';
import LocationList from './LocationList';
import AccountList from './AccountList';
import './App.sass';

var api_headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};
if(window.HTTP_AUTH) { api_headers['Authorization'] = window.HTTP_AUTH; }

var currentDate = () => {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10) dd = '0'+dd;
    if(mm < 10) mm = '0' + mm;
    return yyyy + "-" + mm + "-" + dd;
};

class App extends Component {
    state = {
	view: 'form',
	date: currentDate(),
	payee: '',
	location: '',
	account: '',
	creditAccount: 'Assets:Cash',
	amount: '',
	note: ''
    }

    guessAccountByLocation = (types) => {
	if (types.includes("cafe")) {
	    return "Expenses:Drinks:Coffee";
	} else if (types.includes("bar")) {
	    return "Expenses:Drinks:Alcohol";
	} else if (types.includes("store")) {
	    return "Expenses:Food:Groceries";
	} else if (types.includes("restaurant")) {
	    return "Expenses:Food:Restaurant";
	} else if (types.includes("hair_care")) {
	    return "Expenses:Beauty:Hair Care";
	} else {
	    return "Expenses:Unknown";
	}
    }

    chooseTransaction = (transaction) => {
	this.setState({
	    payee: transaction.payee,
	    location: transaction.location || '',
	    account: transaction.account,
	    view: 'form'
	});
    }

    choosePayee = (payee) => {
	this.setState({
	    payee: payee,
	    view: 'form'
	});
    }

    chooseLocation = (location) => {
	this.setState((prevState) => {
	    return {
		payee: location.name,
		location: location.vicinity,
		account: prevState.account || this.guessAccountByLocation(location.types),
		view: 'form'
	    }
	});
    }
    chooseLocationAddress = (location) => {
	this.setState((prevState) => {
	    return {
		location: location,
		view: 'form'
	    }
	});
    }

    submitCaptureForm = () => {
	if(!this.refs.form.checkValidity()) return;
	fetch(
	    "/transactions",
	    {
		method: "POST",
		headers: api_headers,
		body: JSON.stringify(this.state)
	    }
	)
	    .then(() => {
		this.setState({
		    payee: '',
		    location: '',
		    account: '',
		    creditAccount: 'Assets:Cash',
		    amount: '',
		    note: ''
		});
	    });
    }

    chooseAccount = (account) => {
	this.setState({ account: account, view: 'form' });
    }

    chooseCreditAccount = (account) => {
	this.setState({ creditAccount: account, view: 'form' });
    }

    changeNote = (event) => {
	this.setState({ note: event.target.value, view: 'form' });
    }

    viewPayeeList = () => {
	this.setState({ view: 'payeeList' });
    }

    viewLocationList = () => {
	this.setState({ view: 'locationList' });
    }

    viewAccountList = () => {
	this.setState({ view: 'accountList' });
    }

    viewCreditAccountList = () => {
	this.setState({ view: 'creditAccountList' });
    }

    viewForm = () => {
	this.setState({ view: "form" });
    }

    setDate = (event) => {
	this.setState({ date: event.target.value });
    }

    setAmount = (event, masked) => {
	this.setState({ amount: masked });
    }

    goToRoot = () => {
	window.location.href = "/";
    }

    render() {
	const { view } = this.state || {};
	if (view === "form") {
	    return (
		<div className="react-capture">
		  <header>
		    <button className="back" onClick={this.goToRoot}></button>
		    <button className="submit right" onClick={this.submitCaptureForm}></button>
		    <h2>Capture</h2>
		  </header>
		  <div className="content">
		    <form ref="form">
		      <div className="group">
			<input type="date" name="date" placeholder=" " value={this.state.date} onChange={this.setDate} required={true} />
			<span className="bar"></span>
			<label>Date</label>
		      </div>
		      <div className="group">
			<input type="text" name="payee" placeholder=" " value={this.state.payee} onClick={this.viewPayeeList} required={true} />
			<span className="bar"></span>
			<label>Payee</label>
		      </div>
		      <div className="group">
			<input type="text" name="location" placeholder=" " value={this.state.location} onClick={this.viewLocationList} />
			<label>Location</label>
		      </div>
		      <div className="group">
			<input type="text" name="debit_account" placeholder=" " value={this.state.account} onClick={this.viewAccountList} required />
			<label>Debit Account</label>
		      </div>
		      <div className="group">
			<input type="text" name="credit_account" placeholder=" " value={this.state.creditAccount} onClick={this.viewCreditAccountList} required />
			<label>Credit Account</label>
		      </div>
		      <div className="columns">
			<CurrencyInput name="amount" value={this.state.amount} onChangeEvent={this.setAmount} required autoFocus />
			<select name="commodity">
			  <option>EUR</option>
			  <option>USD</option>
			</select>
		      </div>
		      <div className="group">
			<input type="text" name="note" placeholder=" " value={this.state.note} onChange={this.changeNote} />
			<label>Note</label>
		      </div>
		    </form>
		  </div>
		</div>
	    );
	} else if (this.state.view === "payeeList") {
	    return <PayeeList payee={this.state.payee} onBack={this.viewForm} onSubmit={this.choosePayee} onSelect={this.chooseTransaction}/>;
	} else if (this.state.view === "locationList") {
	    return <LocationList location={this.state.location} onBack={this.viewForm} onSubmit={this.chooseLocationAddress} onSelect={this.chooseLocation}/>;
	} else if (this.state.view === "accountList") {
	    return <AccountList payee={this.state.payee} account={this.state.account} onBack={this.viewForm} onSelect={this.chooseAccount}/>;
	} else if (this.state.view === "creditAccountList") {
	    return <AccountList account={this.state.creditAccount} onBack={this.viewForm} onSelect={this.chooseCreditAccount}/>;
	}
	return "";
    }
}

export default App;
