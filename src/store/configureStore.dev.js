import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import rootReducer from '../reducers/index'
import {systemMessage} from '../actions/systemMessage'

/**
 * Middleware displaying errors from server when the error property exists
 * @param store
 */
const serverErrorHandler = store => next => action => {
    if (action.error) {
        const message = action.reason || action.error.message || `Unknown error for action ${action.type}`

        store.dispatch(systemMessage({
            type: 'error',
            header: `Error: ${message}.`,
            internalMessage: message
        }))
    }

    return next(action)
}

export default function configureStore(initialState) {
    const store = createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(thunk, serverErrorHandler, createLogger({collapsed: true})),
        )
    )

    /*
     if (module.hot) {
     // Enable Webpack hot module replacement for reducers
     module.hot.accept('../reducers', () => {
     const nextRootReducer = require('../reducers').default
     store.replaceReducer(nextRootReducer)
     })
     }
     */

    return store
}
