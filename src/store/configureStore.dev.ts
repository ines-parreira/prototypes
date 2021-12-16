import {createStore, compose, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'

import rootReducer from '../state/reducers'
import {InitialRootState} from '../types'

import serverErrorHandler from './middlewares/serverErrorHandler'

export default function configureStore(
    initialState: InitialRootState = {} as InitialRootState
) {
    let middlewares = applyMiddleware(
        thunk,
        serverErrorHandler,
        createLogger({collapsed: true})
    )

    // check if Redux devTools Chrome extension is installed
    // to apply it as a middleware
    if (window.devToolsExtension) {
        middlewares = compose(middlewares, window.devToolsExtension())
    }

    const store = createStore(rootReducer, initialState, middlewares)

    if (module.hot) {
        module.hot.accept('../state/reducers', () => {
            // eslint-disable-next-line
            const nextReducer = require('../state/reducers').default
            store.replaceReducer(nextReducer)
        })
    }
    return store
}
