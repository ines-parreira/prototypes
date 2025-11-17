import type { List } from 'immutable'
import { fromJS } from 'immutable'

import { createImmutableSelector } from '../../utils'
import type { RootState } from '../types'
import type { TicketsState } from './types'

export const getTicketsState = (state: RootState): TicketsState =>
    state.tickets || fromJS({})

export const getTickets = createImmutableSelector(
    getTicketsState,
    (state) => (state.get('items') || fromJS([])) as List<any>,
)

export const getCursor = createImmutableSelector(
    getTicketsState,
    (state) => state.get('cursor', null) as Maybe<string>,
)
