import { envVars, NodeEnv } from '@repo/utils'
import type { Store } from 'redux'

import type { InitialRootState } from '../types'

let configureStore: (initialState: InitialRootState) => Store

if (envVars.NODE_ENV === NodeEnv.Production) {
    // eslint-disable-next-line
    configureStore = require('./configureStore.prod').default
} else {
    // eslint-disable-next-line
    configureStore = require('./configureStore.dev').default
}

export default configureStore
