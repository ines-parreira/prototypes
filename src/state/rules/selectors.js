// @flow
import {createSelector} from 'reselect'
import {fromJS} from 'immutable'

import type {Map} from 'immutable'

import type {stateType} from '../types'

export const getRulesState = (state: stateType): Map<*, *> =>
    state.rules || fromJS({})

export const getRules = createSelector(
    [getRulesState],
    (state: stateType) => state.get('rules') || fromJS({})
)

export const getRule = (id: string) =>
    createSelector([getRules], (state: stateType) => {
        if (!id) {
            return fromJS({})
        }

        return state.get(id.toString()) || fromJS({})
    })

export const getInternal = createSelector(
    [getRulesState],
    (state: stateType) => state.get('_internal') || fromJS({})
)
