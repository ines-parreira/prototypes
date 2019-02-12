// @flow
import {fromJS} from 'immutable'

import type {Map} from 'immutable'

import type {stateType} from '../types'

export const getSchemas = (state: stateType): Map<*,*> => state.schemas || fromJS({})
