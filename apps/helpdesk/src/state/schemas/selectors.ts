import { fromJS } from 'immutable'

import type { RootState } from '../types'
import type { SchemasState } from './types'

export const getSchemas = (state: RootState): SchemasState =>
    state.schemas || fromJS({})
