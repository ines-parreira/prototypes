import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import {createImmutableSelector} from '../../utils'
import {getNewMessageState} from '../newMessage/selectors'

export const getTicketState = (state) => state.ticket || fromJS({})

export const getProperty = (property) => createSelector(
    [getTicketState],
    (state) => state.get(property)
)

export const getTicket = createImmutableSelector(
    [getTicketState],
    (state) => state
        .delete('_internal')
        .delete('state') || fromJS({})
)

export const getIntegrationsData = createSelector(
    [getTicketState],
    (state) => state.getIn(['customer', 'integrations']) || fromJS({})
)

export const getIntegrationDataByIntegrationId = (integrationId) => createSelector(
    [getIntegrationsData],
    (state) => state.get(String(integrationId)) || fromJS({})
)

export const getLoading = createImmutableSelector(
    [getTicketState],
    (state) => state.getIn(['_internal', 'loading']) || fromJS({})
)

export const getDisplayHistory = createImmutableSelector(
    [getTicketState],
    (state) => state.getIn(['_internal', 'displayHistory'])
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = (name) => createSelector(
    [getLoading],
    (loading) => loading.get(name, false)
)

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = (state) => (name) => isLoading(name)(state)

export const isDirty = createSelector(
    [getTicketState, getNewMessageState],
    (ticketSate, newMessageState) => {
        return !!(ticketSate.getIn(['state', 'dirty']) || newMessageState.getIn(['state', 'dirty']))
    }
)

export const getMessages = createImmutableSelector(
    [getTicketState],
    (state) => state.get('messages') || fromJS([])
)

export const getCustomerMessages = createImmutableSelector(
    [getMessages],
    (messages) => messages.filter((m) => m.get('from_agent') === false) || fromJS([])
)

export const getPendingMessages = createImmutableSelector(
    [getTicketState],
    (state) => state.getIn(['_internal', 'pendingMessages']) || fromJS([])
)

export const getLastMessage = createImmutableSelector(
    [getMessages],
    (state) => state
        .sortBy((message) => message.get('created_datetime'))
        .last() || fromJS({})
)

export const getReadMessages = createImmutableSelector(
    [getMessages],
    (state) => state.filter((message) => message.get('opened_datetime')) || fromJS([])
)

export const getLastReadMessage = createImmutableSelector(
    [getReadMessages],
    (state) => state.maxBy((message) => message.get('sent_datetime')) || fromJS({})
)

export const getEvents = createImmutableSelector(
    [getTicketState],
    (state) => state.get('events') || fromJS([])
)

export const getSatisfactionSurveys = createImmutableSelector(
    [getTicketState],
    (state) => fromJS(state.get('satisfaction_survey') ? [state.get('satisfaction_survey')] : [])
)

// return elements we display in the body of a ticket (messages, events, etc.)
export const getBody = createImmutableSelector(
    [getMessages, getPendingMessages, getEvents, getSatisfactionSurveys],
    (messages, pendingMessages, events, satisfactionSurveys) => {
        messages = messages.map((message) => {
            return message.set('isMessage', true)
        })

        pendingMessages = pendingMessages.map((message) => {
            return message
                .set('isPending', !message.get('failed_datetime'))
                .set('isMessage', true)
        })

        events = events.map((event) => {
            return event.set('isEvent', true)
        })

        satisfactionSurveys = satisfactionSurveys.map((satisfactionSurveys) => {
            return satisfactionSurveys.set('isSatisfactionSurvey', true)
        })

        return messages
            .concat(pendingMessages)
            .concat(events)
            .concat(satisfactionSurveys)
            .sortBy((element) => element.get('isSatisfactionSurvey') ?
                element.get('scored_datetime') : element.get('created_datetime'))
    }
)
