import { composeWithDevTools } from '@redux-devtools/extension'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'

import rootReducer from 'state/reducers'
import serverErrorHandler from 'store/middlewares/serverErrorHandler'
import type { InitialRootState } from 'types'

export default function configureStore(
    initialState: InitialRootState = {} as InitialRootState,
) {
    const middlewares = applyMiddleware(thunk, serverErrorHandler)

    const store = createStore(
        rootReducer,
        initialState,
        composeWithDevTools(middlewares),
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
