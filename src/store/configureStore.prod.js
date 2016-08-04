import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
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
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(thunk, serverErrorHandler)
    )
}
