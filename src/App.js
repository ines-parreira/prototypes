import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute } from 'react-router'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import RuleBox from './components/rule/RuleContainer'

import RootReducer from './reducers/index'

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <Sidebar />
                <div className="content pusher">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

const createStoreWithMiddleware = applyMiddleware(
  thunk
)(createStore)

let store = createStoreWithMiddleware(RootReducer)

ReactDOM.render((
    <Provider store={store}>
        <Router>
            <Route path="/" component={App}>
                <IndexRoute component={Dashboard}/>
                <Route path="dashboard" component={Dashboard}/>
                <Route path="rules" component={RuleBox}/>
            </Route>
        </Router>
    </Provider>
), document.getElementById('App'))
