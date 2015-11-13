import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute } from 'react-router'
import { compose, createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { devTools, persistState } from 'redux-devtools'
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react'

import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import RuleContainer from './components/rule/RuleContainer'

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

const createStoreWithMiddleware = compose(
    applyMiddleware(thunk),
    devTools(),
    persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
)(createStore)

const store = createStoreWithMiddleware(RootReducer)

ReactDOM.render((
    <div>
        <Provider store={store}>
            <Router>
                <Route path="/" component={App}>
                    <IndexRoute component={Dashboard}/>
                    <Route path="dashboard" component={Dashboard}/>
                    <Route path="rules" component={RuleContainer}/>
                </Route>
            </Router>
        </Provider>
        <DebugPanel top right bottom>
            <DevTools store={store} monitor={LogMonitor} visibleOnLoad={false} />
        </DebugPanel>
    </div>
), document.getElementById('App'))
