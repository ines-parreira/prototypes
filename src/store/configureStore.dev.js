import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import serverErrorHandler from './middlewares/server-error-handler'
import createLogger from 'redux-logger'
import rootReducer from '../state/reducers'

export default function configureStore(initialState) {
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(
            thunk,
            serverErrorHandler,
            createLogger({collapsed: true})
        )
    )
}
