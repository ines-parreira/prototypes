import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'

import rootReducer from '../state/reducers'
import {InitialRootState} from '../types'

import sentryCrashReporter from './middlewares/sentryCrashReporter'
import serverErrorHandler from './middlewares/serverErrorHandler'

const middlewares = [sentryCrashReporter, thunk, serverErrorHandler]

export default function configureStore(initialState: InitialRootState) {
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(...middlewares)
    )
}
