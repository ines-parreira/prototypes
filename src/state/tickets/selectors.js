// @flow
import {fromJS} from 'immutable'
import type {Map} from 'immutable'

import {createImmutableSelector} from '../../utils'

import type {stateType} from '../types'

export const getTicketsState = (state: stateType): Map<*, *> =>
    state.tickets || fromJS({})

export const getTickets = createImmutableSelector(
    [getTicketsState],
    (state) => state.get('items') || fromJS([])
)

export const getCursor = createImmutableSelector([getTicketsState], (state) =>
    state.get('cursor', null)
)
