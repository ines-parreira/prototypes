import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import amplitudeTracker from './middlewares/amplitudeTracker'
import serverErrorHandler from './middlewares/serverErrorHandler'
import createLogger from 'redux-logger'
import rootReducer from '../state/reducers'

export default function configureStore(initialState) {
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(
            thunk,
            serverErrorHandler,
            createLogger({collapsed: true}),
            amplitudeTracker
        )
    )
}
