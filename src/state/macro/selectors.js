// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import type {Map} from 'immutable'
import type {stateType} from '../types'

export const getMacrosState = (state: stateType): Map<*,*> => state.macros || fromJS({})

export const getMacros = createSelector(
    [getMacrosState],
    state => state.get('items') || fromJS({})
)
