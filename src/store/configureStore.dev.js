import { createStore, applyMiddleware, compose } from 'redux'
import { reduxReactRouter } from 'redux-router'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import createHistory from 'history/lib/createBrowserHistory'

import DevTools from '../containers/DevTools'
import routes from '../routes'
import rootReducer from '../reducers/index'

const finalCreateStore = compose(
    applyMiddleware(thunk),
    reduxReactRouter({routes, createHistory}),
    applyMiddleware(createLogger()),
    DevTools.instrument()
)(createStore)

export default function configureStore(initialState) {
    return finalCreateStore(rootReducer, initialState)
}
