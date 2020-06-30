import {createStore, compose, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'

import rootReducer from '../state/reducers'

import serverErrorHandler from './middlewares/serverErrorHandler'
import usageLimitNotifier from './middlewares/usageLimitNotifier'

export default function configureStore(initialState = {}) {
    let middlewares = applyMiddleware(
        thunk,
        serverErrorHandler,
        createLogger({collapsed: true}),
        usageLimitNotifier
    )

    // check if Redux devTools Chrome extension is installed
    // to apply it as a middleware
    if (window.devToolsExtension) {
        middlewares = compose(middlewares, window.devToolsExtension())
    }

    return createStore(rootReducer, initialState, middlewares)
}
