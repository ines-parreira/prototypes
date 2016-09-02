import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import ravenCrashReporter from './middlewares/ravenCrashReporter'
import serverErrorHandler from './middlewares/serverErrorHandler'
import amplitudeTracker from './middlewares/amplitudeTracker'
import rootReducer from '../state/reducers'

export default function configureStore(initialState) {
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(
          ravenCrashReporter,
          thunk,
          serverErrorHandler,
          amplitudeTracker
        )
    )
}
