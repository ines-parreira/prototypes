// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import type {Map} from 'immutable'
import type {stateType} from '../types'

export const getMacrosState = (state: stateType): Map<*, *> => state.macros || fromJS({})

export const getMacros = createSelector(
    [getMacrosState],
    (state) => state.get('items') || fromJS([])
)

export const getMacrosOrderedByName = createSelector(
    [getMacros],
    (macros) => macros.sortBy((m) => m.get('name'))
)

// first order by name then by usage (in case there is no usage yet)
export const getMacrosOrderedByUsage = createSelector(
    [getMacrosOrderedByName],
    (macros) => macros.sortBy((m) => -m.get('usage'))
)

export const areMacrosVisible = createSelector(
    [getMacrosState],
    (state) => !!state.get('visible')
)

export const isMacrosModalOpen = createSelector(
    [getMacrosState],
    (state) => !!state.get('isModalOpen')
)
