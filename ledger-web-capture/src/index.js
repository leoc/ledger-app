import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { HashRouter, withRouter } from 'react-router-dom';

var AppWithRouter = withRouter(App)
ReactDOM.render(<HashRouter><AppWithRouter /></HashRouter>, document.getElementById('root'));
registerServiceWorker();
