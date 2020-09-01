import {fromJS} from 'immutable'

import {RootState} from '../types'

import {SchemasState} from './types'

export const getSchemas = (state: RootState): SchemasState =>
    state.schemas || fromJS({})
