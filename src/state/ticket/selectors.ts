import {fromJS, Map, List} from 'immutable'
import {createSelector} from 'reselect'

import {createImmutableSelector} from '../../utils.js'
import {getNewMessageState} from '../newMessage/selectors'
import {NewMessageState} from '../newMessage/types'
import {RootState} from '../types'

import {TicketState} from './types'

//$TsFixMe remove once createImmutableSelector is migrated
const typeSafeCreateImmutableSelector = createImmutableSelector as typeof createSelector

export const getTicketState = (state: RootState): TicketState =>
    state.ticket || fromJS({})

export const getProperty = (property: string) =>
    createSelector<RootState, Map<any, any>, TicketState>(
        getTicketState,
        (state) => state.get(property) as Map<any, any>
    )

export const getTicket = typeSafeCreateImmutableSelector<
    RootState,
    Map<any, any>,
    TicketState
>(
    getTicketState,
    (state) => state.delete('_internal').delete('state') || fromJS({})
)

export const getIntegrationsData = createSelector<
    RootState,
    Map<any, any>,
    TicketState
>(
    getTicketState,
    (state) =>
        (state.getIn(['customer', 'integrations']) || fromJS({})) as Map<
            any,
            any
        >
)

export const getIntegrationDataByIntegrationId = (integrationId: number) =>
    createSelector<RootState, Map<any, any>, Map<any, any>>(
        getIntegrationsData,
        (state) =>
            (state.get(String(integrationId)) || fromJS({})) as Map<any, any>
    )

export const getLoading = typeSafeCreateImmutableSelector<
    RootState,
    Map<any, any>,
    TicketState
>(
    getTicketState,
    (state) =>
        (state.getIn(['_internal', 'loading']) || fromJS({})) as Map<any, any>
)

export const getDisplayHistory = typeSafeCreateImmutableSelector<
    RootState,
    boolean,
    TicketState
>(
    getTicketState,
    (state) => state.getIn(['_internal', 'displayHistory']) as boolean
)

export const shouldDisplayAuditLogEvents = typeSafeCreateImmutableSelector<
    RootState,
    boolean,
    TicketState
>(
    getTicketState,
    (state) =>
        state.getIn(['_internal', 'shouldDisplayAuditLogEvents']) as boolean
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = (name: string) =>
    createSelector<RootState, boolean, Map<any, any>>(
        getLoading,
        (loading) => loading.get(name, false) as boolean
    )

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = (state: RootState) => (name: string) =>
    isLoading(name)(state)

export const isDirty = (state: RootState) =>
    createSelector<RootState, boolean, TicketState, NewMessageState>(
        getTicketState,
        getNewMessageState,
        (ticketSate, newMessageState) => {
            return !!(
                ticketSate.getIn(['state', 'dirty']) ||
                newMessageState.getIn(['state', 'dirty'])
            )
        }
    )(state)

export const getMessages = typeSafeCreateImmutableSelector<
    RootState,
    List<any>,
    TicketState
>(getTicketState, (state) => (state.get('messages') || fromJS([])) as List<any>)

export const getCustomerMessages = typeSafeCreateImmutableSelector<
    RootState,
    List<any>,
    List<any>
>(
    getMessages,
    (messages) =>
        (messages.filter((m: Map<any, any>) => m.get('from_agent') === false) ||
            fromJS([])) as List<any>
)

export const getPendingMessages = typeSafeCreateImmutableSelector<
    RootState,
    List<any>,
    TicketState
>(
    getTicketState,
    (state) =>
        (state.getIn(['_internal', 'pendingMessages']) || fromJS([])) as List<
            any
        >
)

export const getLastMessage = typeSafeCreateImmutableSelector<
    RootState,
    Map<any, any>,
    List<any>
>(
    getMessages,
    (state) =>
        (state
            .sortBy(
                (message: Map<any, any>) =>
                    message.get('created_datetime') as string
            )
            .last() || fromJS({})) as Map<any, any>
)

export const getReadMessages = typeSafeCreateImmutableSelector<
    RootState,
    List<any>,
    List<any>
>(
    getMessages,
    (state) =>
        (state.filter(
            (message: Map<any, any>) =>
                message.get('opened_datetime') as boolean
        ) || fromJS([])) as List<any>
)

export const getLastReadMessage = typeSafeCreateImmutableSelector<
    RootState,
    Map<any, any>,
    List<any>
>(
    getReadMessages,
    (state) =>
        (state.maxBy(
            (message: Map<any, any>) => message.get('sent_datetime') as boolean
        ) || fromJS({})) as Map<any, any>
)

export const getEvents = typeSafeCreateImmutableSelector<
    RootState,
    List<any>,
    TicketState
>(getTicketState, (state) => (state.get('events') || fromJS([])) as List<any>)

export const getSatisfactionSurveys = typeSafeCreateImmutableSelector<
    RootState,
    List<any>,
    TicketState
>(
    getTicketState,
    (state) =>
        fromJS(
            state.get('satisfaction_survey')
                ? [state.get('satisfaction_survey')]
                : []
        ) as List<any>
)

// return elements we display in the body of a ticket (messages, events, etc.)
export const getBody = typeSafeCreateImmutableSelector<
    RootState,
    List<any>,
    List<any>,
    List<any>,
    List<any>,
    List<any>
>(
    getMessages,
    getPendingMessages,
    getEvents,
    getSatisfactionSurveys,
    (messages, pendingMessages, events, satisfactionSurveys) => {
        const nextMessages = messages.map((message: Map<any, any>) => {
            return message.set('isMessage', true)
        }) as List<any>

        const nextPendingMessages = pendingMessages.map(
            (message: Map<any, any>) => {
                return message
                    .set('isPending', !message.get('failed_datetime'))
                    .set('isMessage', true)
            }
        ) as List<any>
        const failedPendingMessages = nextPendingMessages.filter(
            (message: Map<any, any>) =>
                message.get('failed_datetime') as boolean
        ) as List<any>
        const activePendingMessages = nextPendingMessages
            .filter((message: Map<any, any>) => !message.get('failed_datetime'))
            .sortBy(
                (message: Map<any, any>) =>
                    message.get('created_datetime') as string
            ) as List<any>

        const nextEvents = events.map((event: Map<any, any>) => {
            return event.set('isEvent', true)
        }) as List<any>

        const nextSatisfactionSurveys = satisfactionSurveys.map(
            (satisfactionSurveys: Map<any, any>) => {
                return satisfactionSurveys.set('isSatisfactionSurvey', true)
            }
        ) as List<any>

        return nextMessages
            .concat(failedPendingMessages)
            .concat(nextEvents)
            .concat(nextSatisfactionSurveys)
            .sortBy(
                (element: Map<any, any>) =>
                    (element.get('isSatisfactionSurvey')
                        ? element.get('scored_datetime')
                        : element.get('created_datetime')) as string
            )
            .concat(activePendingMessages) as List<any>
    }
)
