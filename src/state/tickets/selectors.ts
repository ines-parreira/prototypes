import {fromJS, List} from 'immutable'

import {createImmutableSelector} from '../../utils'
import {RootState} from '../types'

import {TicketsState} from './types'

export const getTicketsState = (state: RootState): TicketsState =>
    state.tickets || fromJS({})

export const getTickets = createImmutableSelector<
    RootState,
    List<any>,
    TicketsState
>(getTicketsState, (state) => (state.get('items') || fromJS([])) as List<any>)

export const getCursor = createImmutableSelector<
    RootState,
    Maybe<string>,
    TicketsState
>(getTicketsState, (state) => state.get('cursor', null) as Maybe<string>)
