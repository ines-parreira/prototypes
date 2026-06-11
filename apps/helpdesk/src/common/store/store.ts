import { omit } from 'lodash'

import { configureStore } from 'store/configureStore'

import { toInitialStoreState } from './toInitialStoreState'

const initialState = omit(window.GORGIAS_STATE, 'channels') || {}

const DefaultExportStore = configureStore(toInitialStoreState(initialState))

export { DefaultExportStore }
