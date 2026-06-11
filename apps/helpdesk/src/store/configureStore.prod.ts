import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'

import { rootReducer } from '../state/reducers'
import type { InitialRootState } from '../types'
import { crashReporter as sentryCrashReporter } from './middlewares/sentryCrashReporter'
import { serverErrorHandler } from './middlewares/serverErrorHandler'

const middlewares = [sentryCrashReporter, thunk, serverErrorHandler]

export function configureStore(initialState: InitialRootState) {
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(...middlewares),
    )
}
