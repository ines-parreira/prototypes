import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import {createImmutableSelector} from '../../utils'
import {getNewMessageState} from '../newMessage/selectors'

export const getTicketState = state => state.ticket || fromJS({})

export const makeGetProperty = property => createSelector(
    [getTicketState],
    state => state.get(property)
)

export const getTicket = createImmutableSelector(
    [getTicketState],
    state => state
        .delete('_internal')
        .delete('state')
)

export const getCustomer = createImmutableSelector(
    [getTicketState],
    state => state.getIn(['requester', 'customer']) || fromJS({})
)

export const getIntegrationsData = createSelector(
    [getTicketState],
    state => state.getIn(['requester', 'integrations']) || fromJS({})
)

export const getIntegrationDataByIntegrationId = integrationId => createSelector(
    [getIntegrationsData],
    state => state.get(integrationId) || fromJS({})
)

export const getLoading = createImmutableSelector(
    [getTicketState],
    state => state.getIn(['_internal', 'loading']) || fromJS({})
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = name => createSelector(
    [getLoading],
    loading => loading.get(name, false)
)

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = state => name => isLoading(name)(state)

export const isDirty = createSelector(
    [getTicketState, getNewMessageState],
    (ticketSate, newMessageState) => {
        return !!(ticketSate.getIn(['state', 'dirty']) || newMessageState.getIn(['state', 'dirty']))
    }
)

export const getMessages = createImmutableSelector(
    [getTicketState],
    state => state.get('messages') || fromJS([])
)

export const getCustomerRatings = createImmutableSelector(
    [getTicketState],
    state => state.get('customer_ratings') || fromJS([])
)

export const getEvents = createImmutableSelector(
    [getTicketState],
    state => state.get('events') || fromJS([])
)

// return elements we display in the body of a ticket (messages, ratings, events, etc.)
export const getBody = createImmutableSelector(
    [getMessages, getCustomerRatings, getEvents],
    (messages, ratings, events) => {
        messages = messages.map((message) => {
            return message.set('isMessage', true)
        })

        ratings = ratings.map((rating) => {
            return rating
                .set('isRating', true)
                .set('created_datetime', rating.get('rating_datetime'))
        })

        events = events.map((event) => {
            return event.set('isEvent', true)
        })

        return messages
            .concat(ratings)
            .concat(events)
            .sortBy(element => element.get('created_datetime'))
    }
)
