import {Store} from 'redux'

import {InitialRootState} from '../types'

let configureStore: (initialState: InitialRootState) => Store

if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line
    configureStore = require('./configureStore.prod').default
} else {
    // eslint-disable-next-line
    configureStore = require('./configureStore.dev').default
}

export default configureStore
