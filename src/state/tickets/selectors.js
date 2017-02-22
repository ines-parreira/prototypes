import {fromJS} from 'immutable'
import {createImmutableSelector} from '../../utils'

export const getTicketsState = state => state.tickets || fromJS({})

export const getTickets = createImmutableSelector(
    [getTicketsState],
    state => state.get('items') || fromJS([])
)
