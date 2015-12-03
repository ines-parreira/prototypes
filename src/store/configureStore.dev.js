import { createStore, applyMiddleware, compose } from 'redux'
import { reduxReactRouter } from 'redux-router'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import createHistory from 'history/lib/createHashHistory'

import routes from '../routes'
import rootReducer from '../reducers/index'

const finalCreateStore = compose(
    applyMiddleware(thunk),
    reduxReactRouter({routes, createHistory}),
    applyMiddleware(createLogger({collapsed: true}))
)(createStore)

export default function configureStore(initialState) {
    return finalCreateStore(rootReducer, initialState)
}
