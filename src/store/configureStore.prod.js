import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'

import ravenCrashReporter from './middlewares/ravenCrashReporter'
import serverErrorHandler from './middlewares/serverErrorHandler'
import usageLimitNotifier from './middlewares/usageLimitNotifier'
import rootReducer from '../state/reducers'

const midlewares = [
    ravenCrashReporter,
    thunk,
    serverErrorHandler,
    usageLimitNotifier,
]

export default function configureStore(initialState) {
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(...midlewares)
    )
}
