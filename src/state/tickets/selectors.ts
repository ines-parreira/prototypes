import {fromJS, List} from 'immutable'
import {createSelector} from 'reselect'

import {createImmutableSelector} from '../../utils.js'
import {RootState} from '../types'

import {TicketsState} from './types'

//$TsFixMe remove once createImmutableSelector is migrated
const typeSafeCreateImmutableSelector = createImmutableSelector as typeof createSelector

export const getTicketsState = (state: RootState): TicketsState =>
    state.tickets || fromJS({})

export const getTickets = typeSafeCreateImmutableSelector<
    RootState,
    List<any>,
    TicketsState
>(getTicketsState, (state) => (state.get('items') || fromJS([])) as List<any>)

export const getCursor = typeSafeCreateImmutableSelector<
    RootState,
    Maybe<string>,
    TicketsState
>(getTicketsState, (state) => state.get('cursor', null) as Maybe<string>)
