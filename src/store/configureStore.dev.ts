import {createStore, applyMiddleware} from 'redux'
import {composeWithDevTools} from '@redux-devtools/extension'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'

import rootReducer from '../state/reducers'
import {InitialRootState} from '../types'

import serverErrorHandler from './middlewares/serverErrorHandler'

export default function configureStore(
    initialState: InitialRootState = {} as InitialRootState
) {
    const middlewares = applyMiddleware(
        thunk,
        serverErrorHandler,
        createLogger({collapsed: true})
    )

    const store = createStore(
        rootReducer,
        initialState,
        composeWithDevTools(middlewares)
    )

    if (module.hot) {
        module.hot.accept('../state/reducers', () => {
            // eslint-disable-next-line
            const nextReducer = require('../state/reducers').default
            store.replaceReducer(nextReducer)
        })
    }
    return store
}
