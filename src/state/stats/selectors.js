// @flow
import {fromJS} from 'immutable'
import type {Map} from 'immutable'
import {createSelector} from 'reselect'
import type {stateType, currentUserType} from '../types'
import {TICKETS_CLOSED_PER_AGENT} from '../../config/stats'


export const getStats = (state: stateType) => state.stats || fromJS({})


export const getTicketsClosedPerAgentStats = createSelector(
    [getStats],
    (state: Map<*,*>) => state.getIn([TICKETS_CLOSED_PER_AGENT, 'data', 'lines']) || fromJS([])
)

export const getAgentClosedTicketsStats = (user: currentUserType) => createSelector(
    [getTicketsClosedPerAgentStats],
    (state: Array<*>) => state.find((line) => line.get(0) === user.get('name')) || fromJS([])
)
