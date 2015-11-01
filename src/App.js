import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute } from 'react-router'

import RuleContainer from './components/rule/RuleContainer'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'

class App extends React.Component {
    render() {
        return (
            <div className=''>
                <Sidebar />
                <div className='pusher'>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

ReactDOM.render((
    <Router>
        <Route path="/" component={App}>
            <IndexRoute component={Dashboard}/>
            <Route path="dashboard" component={Dashboard}/>
            <Route path="rules" component={RuleContainer}/>
        </Route>
    </Router>
), document.getElementById('App'))
