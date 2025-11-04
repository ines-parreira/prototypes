import { envVars, NodeEnv } from '@repo/utils'
import { Store } from 'redux'

import { InitialRootState } from '../types'

let configureStore: (initialState: InitialRootState) => Store

if (envVars.NODE_ENV === NodeEnv.Production) {
    // eslint-disable-next-line
    configureStore = require('./configureStore.prod').default
} else {
    // eslint-disable-next-line
    configureStore = require('./configureStore.dev').default
}

export default configureStore
