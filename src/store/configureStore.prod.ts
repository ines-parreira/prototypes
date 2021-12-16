import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'

import rootReducer from '../state/reducers'
import {InitialRootState} from '../types'

import ravenCrashReporter from './middlewares/ravenCrashReporter'
import serverErrorHandler from './middlewares/serverErrorHandler'

const middlewares = [ravenCrashReporter, thunk, serverErrorHandler]

export default function configureStore(initialState: InitialRootState) {
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(...middlewares)
    )
}
