// @flow
import {fromJS} from 'immutable'
import type {Map} from 'immutable'
import {createSelector} from 'reselect'
import type {stateType} from '../types'

export const getStats = (state: stateType) => state.stats || fromJS({})

export const getStat = (statName: string) => createSelector(
    [getStats],
    (state: Map<*, *>) => state.get(statName, fromJS({}))
)
