import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute } from 'react-router'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import {ticketReducer} from './reducers/ticket'

import Dashboard from './components/Dashboard'

let ticketStore = createStore(ticketReducer)

const App = React.createClass({
    render() {
        return (
            <div className='main-container'>
                 {this.props.children}
            </div>
        )
    }
})

ReactDOM.render((
    <Provider store={ticketStore}>
        <Router>
            <Route path="/" component={App}>
                <IndexRoute component={Dashboard} />
                <Route path="dashboard" component={Dashboard}/>
            </Route>
        </Router>
    </Provider>
), document.getElementById('App'))