import {fromJS} from 'immutable'

export const getSchemas = state => state.schemas || fromJS({})
