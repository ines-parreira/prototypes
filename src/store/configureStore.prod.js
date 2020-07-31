import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'

import rootReducer from '../state/reducers'

import ravenCrashReporter from './middlewares/ravenCrashReporter'
import serverErrorHandler from './middlewares/serverErrorHandler'

const midlewares = [ravenCrashReporter, thunk, serverErrorHandler]

export default function configureStore(initialState) {
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(...midlewares)
    )
}
