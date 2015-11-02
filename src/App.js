import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute } from 'react-router'

import RuleContainer from './components/rule/RuleContainer'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <Sidebar />

                <div className="content pusher">
                    <div className="ui secondary menu">
                        <a className="active item">Show more fields</a>

                        <div className="right menu">
                            <div className="item">
                                <div className="ui search">
                                    <div className="ui icon input">
                                        <input className="prompt" type="text" placeholder="Search..."/>
                                        <i className="search icon"></i>
                                    </div>
                                    <div className="results"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ui grid container">
                        {this.props.children}
                    </div>
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
