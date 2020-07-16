import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'

import rootReducer from '../state/reducers'

import sentryCrashReporter from './middlewares/sentryCrashReporter'
import serverErrorHandler from './middlewares/serverErrorHandler'
import usageLimitNotifier from './middlewares/usageLimitNotifier'

const midlewares = [
    sentryCrashReporter,
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
