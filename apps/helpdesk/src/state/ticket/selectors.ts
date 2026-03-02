import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { createSelector } from 'reselect'

import { TicketVia } from 'business/types/ticket'
import { EventType } from 'models/event/types'
import { MacroActionName } from 'models/macroAction/types'
import {
    isTicketMessage,
    shouldMessagesBeGrouped,
} from 'models/ticket/predicates'
import type {
    TicketElement,
    TicketEvent,
    TicketMessage,
    TicketSatisfactionSurvey,
} from 'models/ticket/types'
import { ViewType } from 'models/view/types'
import type { UseListVoiceCalls } from 'models/voiceCall/queries'
import { voiceCallsKeys } from 'models/voiceCall/queries'
import type { VoiceCall } from 'models/voiceCall/types'
import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'
import type { InTicketSuggestionState } from 'state/entities/rules/types'
import type { TopRankMacroState } from 'state/newMessage/ticketReplyCache'
import { getQueryData } from 'state/queries/selectors'
import type { RootState } from 'state/types'
import { getActiveView } from 'state/views/selectors'
import { createImmutableSelector } from 'utils'

import type { TicketState, TicketStateWithoutImmutable } from './types'

export const getTicketState = (state: RootState): TicketState =>
    state.ticket || fromJS({})

export const getProperty = (property: string) =>
    createSelector(
        getTicketState,
        (state) => state.get(property) as Map<any, any>,
    )

/**
 * @deprecated
 * @date 2023-01-17
 * @type feature-helper-fn
 */
export const DEPRECATED_getTicket = createImmutableSelector(
    getTicketState,
    (state) => state.delete('_internal').delete('state') || fromJS({}),
)

export const getTicket = createImmutableSelector(
    getTicketState,
    (state) =>
        state
            .delete('_internal')
            .delete('state')
            .toJS() as TicketStateWithoutImmutable,
)

export const getTicketId = createSelector(
    getTicketState,
    (ticket) => ticket.get('id') as number,
)

export const getIntegrationsData = createSelector(
    getTicketState,
    (state) =>
        (state.getIn(['customer', 'integrations']) || fromJS({})) as Map<
            any,
            any
        >,
)

export const getIntegrationDataByIntegrationId = (integrationId: number) =>
    createSelector(
        getIntegrationsData,
        (state) =>
            (state.get(String(integrationId)) || fromJS({})) as Map<any, any>,
    )

export const getAppDataByAppId = (appId: string) =>
    createSelector(
        getTicket,
        (state) => state.customer?.external_data?.[appId] || null,
    )

export const getLoading = createImmutableSelector(
    getTicketState,
    (state) =>
        (state.getIn(['_internal', 'loading']) || fromJS({})) as Map<any, any>,
)

export const shouldDisplayAuditLogEvents = createImmutableSelector(
    getTicketState,
    (state) =>
        state.getIn(['_internal', 'shouldDisplayAuditLogEvents']) as boolean,
)

export const getShouldDisplayAllFollowUps = createImmutableSelector(
    getTicketState,
    (state) =>
        state.getIn(['_internal', 'shouldDisplayAllFollowUps']) as boolean,
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = (name: string) =>
    createSelector(getLoading, (loading) => loading.get(name, false) as boolean)

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = (state: RootState) => (name: string) =>
    isLoading(name)(state)

export const getMessages = createImmutableSelector(getTicketState, (state) => {
    const messages: List<Map<any, any>> = state.get('messages') || fromJS([])

    return messages.filter(
        (message) => !message?.getIn(['meta', 'hidden']),
    ) as List<Map<any, any>>
})

export const getVia = createImmutableSelector(
    getTicketState,
    (state) => state.get('via') as TicketVia,
)

export const getCustomerMessages = createImmutableSelector(
    getMessages,
    (messages) =>
        (messages.filter((m) => m!.get('from_agent') === false) ||
            fromJS([])) as List<any>,
)

export const getAIAgentMessages = createImmutableSelector(
    getMessages,
    (messages) =>
        (messages
            .filter(
                (m) =>
                    m!.get('from_agent') === true &&
                    AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS.includes(
                        m!.getIn(['sender', 'email']),
                    ),
            )
            .toJS() || []) as TicketMessage[],
)

export const getPendingMessages = createImmutableSelector(
    getTicketState,
    (state) =>
        (state.getIn(['_internal', 'pendingMessages']) ||
            fromJS([])) as List<any>,
)

export const getLastCustomerMessage = createImmutableSelector(
    getCustomerMessages,
    (state) =>
        (state
            .sortBy(
                (message: Map<any, any>) =>
                    message.get('created_datetime') as string,
            )
            .last() || fromJS({})) as Map<any, any>,
)

export const getLastMessage = createImmutableSelector(
    getMessages,
    (state) =>
        state
            .sortBy((message) => message!.get('created_datetime') as string)
            .last() || fromJS({}),
)

export const getReadMessages = createImmutableSelector(
    getMessages,
    (state) =>
        state.filter((message) => message!.get('opened_datetime') as boolean) ||
        fromJS([]),
)

export const getLastReadMessage = createImmutableSelector(
    getReadMessages,
    (state) =>
        state.maxBy((message) => message!.get('sent_datetime') as boolean) ||
        fromJS({}),
)

export const getEvents = createImmutableSelector(
    getTicketState,
    (state) => (state.get('events') || fromJS([])) as List<any>,
)

export const getSatisfactionSurveys = createImmutableSelector(
    getTicketState,
    (state) =>
        fromJS(
            state.get('satisfaction_survey')
                ? [state.get('satisfaction_survey')]
                : [],
        ) as List<any>,
)

export const getRuleSuggestion = createImmutableSelector(
    getTicketState,
    (state) =>
        fromJS(state.getIn(['meta', 'rule_suggestion'])) as Map<any, any>,
)

export const getTicketFieldState = createSelector(
    getTicket,
    (state) => state.custom_fields || {},
)

const getVoiceCalls = createSelector(
    getTicketState,
    (state: RootState) =>
        getQueryData<UseListVoiceCalls>(
            voiceCallsKeys.list({
                ticket_id: getTicketState(state).get('id'),
            }),
        )(state),
    (_, queryData) => queryData,
)

// return elements we display in the body of a ticket (messages, events, etc.)
export const getBody = createImmutableSelector(
    getMessages,
    getPendingMessages,
    getEvents,
    getSatisfactionSurveys,
    getRuleSuggestion,
    getTicketFieldState,
    getVoiceCalls,
    shouldDisplayAuditLogEvents,
    (
        messages,
        pendingMessages,
        events,
        satisfactionSurveys,
        ruleSuggestion,
        ticketFieldState,
        voiceCallsData,
    ) => {
        const nextMessages = messages.map((message) => {
            return message!.set('isMessage', true)
        }) as List<any>

        const nextPendingMessages = pendingMessages.map(
            (message: Map<any, any>) => {
                return message
                    .set('isPending', !message.get('failed_datetime'))
                    .set('isMessage', true)
            },
        ) as List<any>
        const failedPendingMessages = nextPendingMessages.filter(
            (message: Map<any, any>) =>
                message.get('failed_datetime') as boolean,
        ) as List<any>
        const activePendingMessages = nextPendingMessages
            .filter((message: Map<any, any>) => !message.get('failed_datetime'))
            .sortBy(
                (message: Map<any, any>) =>
                    message.get('created_datetime') as string,
            ) as List<any>

        let hasSatisfactionSurveyRespondedPreviousEvents = false
        const nextEvents = events.map((event: Map<any, any>) => {
            if (event.get('type') === EventType.SatisfactionSurveyResponded) {
                hasSatisfactionSurveyRespondedPreviousEvents = true
                return event
                    .set('isSatisfactionSurvey', true)
                    .set('isEvent', true)
            }
            return event.set('isEvent', true)
        }) as List<any>

        const nextVoiceCalls =
            voiceCallsData?.data?.map((voiceCall: VoiceCall) => {
                return fromJS(voiceCall) as List<any>
            }) ?? fromJS([])

        const nextSatisfactionSurveys =
            hasSatisfactionSurveyRespondedPreviousEvents
                ? fromJS([])
                : (satisfactionSurveys.map(
                      (satisfactionSurveys: Map<any, any>) => {
                          return satisfactionSurveys.set(
                              'isSatisfactionSurvey',
                              true,
                          )
                      },
                  ) as List<any>)

        let body = nextMessages
            .concat(failedPendingMessages)
            .concat(nextEvents)
            .concat(nextVoiceCalls)
            .concat(nextSatisfactionSurveys)
            .sortBy(
                (element: Map<any, any>) =>
                    (element.get('isSatisfactionSurvey') &&
                    element.get('scored_datetime')
                        ? element.get('scored_datetime')
                        : element.get('created_datetime')) as string,
            )
            .concat(activePendingMessages) as List<any>

        const getSuggestionPosition = () => {
            const index = body.findIndex(
                (message: Map<any, any>) =>
                    !!message.get('isMessage') &&
                    !!message.get('from_agent') &&
                    message.get('via') !== TicketVia.Rule,
            )
            return index !== -1 ? index : body.size
        }

        if (ruleSuggestion) {
            const hasRuleSuggestionApplied = body.some(
                (element: Map<any, any>) =>
                    element.hasIn(['meta', 'rule_suggestion_slug']),
            )
            if (!hasRuleSuggestionApplied) {
                body = body.insert(
                    getSuggestionPosition(),
                    ruleSuggestion.set('isRuleSuggestion', true),
                )
            }
        }

        if (ticketFieldState) {
            Object.values(ticketFieldState).forEach((customFieldState) => {
                if (customFieldState.prediction?.display === true) {
                    body = body.insert(
                        0,
                        fromJS({
                            isContactReasonSuggestion: true,
                        }),
                    )
                }
            })
        }

        return body
    },
)

export const getAppliedMacro = createImmutableSelector(
    getTicketState,
    (state) =>
        state.getIn(['state', 'appliedMacro'], fromJS({})) as Map<
            any,
            any
        > | null,
)

export const getTopRankMacroState = createImmutableSelector(
    getTicketState,
    (state) => {
        const topRankMacroState = state.getIn([
            'state',
            'topRankMacroState',
        ]) as Map<any, any> | undefined
        if (!topRankMacroState || topRankMacroState.isEmpty()) {
            return null
        }
        return topRankMacroState.toJS() as TopRankMacroState
    },
)

export const hasContentlessAction = createImmutableSelector(
    getTicketState,
    (ticket) => {
        const actions = ticket.getIn(
            ['state', 'appliedMacro', 'actions'],
            fromJS([]),
        ) as List<Map<any, any>>
        return actions.some(
            (action) =>
                ![
                    MacroActionName.SetResponseText,
                    MacroActionName.AddAttachments,
                ].includes(action?.get('name')),
        )
    },
)

export const getInTicketSuggestionState = createImmutableSelector(
    getTicketState,
    (state) => {
        const inTicketSuggestionState = state.getIn([
            'state',
            'inTicketSuggestionState',
        ]) as unknown

        return inTicketSuggestionState as InTicketSuggestionState | undefined
    },
)

export const getTicketBodyElements = createSelector(getBody, (body) => {
    const elements = body.toJS() as TicketElement[]

    return elements.reduce(
        (
            acc: (TicketElement | TicketMessage[])[],
            element: TicketElement | TicketMessage[],
        ) => {
            if (!isTicketMessage(element as TicketElement)) {
                return [
                    ...acc,
                    element as TicketEvent | TicketSatisfactionSurvey,
                ]
            }

            const prevGroup = acc[acc.length - 1]
            if (!Array.isArray(prevGroup)) {
                return [...acc, [element as TicketMessage]]
            }

            const firstInPrevGroup = prevGroup[0]
            if (
                shouldMessagesBeGrouped(
                    firstInPrevGroup,
                    element as TicketMessage,
                )
            ) {
                prevGroup.push(element as TicketMessage)
                return acc
            }

            return [...acc, [element as TicketMessage]]
        },
        [] as TicketElement[],
    )
})

export const getTicketCustomer = createImmutableSelector(
    getTicketState,
    (state) => state.get('customer') as Map<any, any>,
)

export const getHasAttemptedToCloseTicket = createImmutableSelector(
    getTicketState,
    (state) =>
        state.getIn(['state', 'hasAttemptedToCloseTicket'], false) as boolean,
)

export const isTicketViewActive = createSelector(getActiveView, (view) => {
    const viewId = view.get('id') as number
    const viewSearch = view.get('search') as string
    const viewFilters = view.get('filters') as string
    const viewOrderByEnabled = !!view.get('order_by')
    const isCustomerView = view.get('type') === ViewType.CustomerList

    return (
        !!((viewId || viewSearch || viewFilters) && viewOrderByEnabled) &&
        !isCustomerView
    )
})

export const isTicketNavigationAvailable = (ticketId?: number | string) =>
    createSelector(isTicketViewActive, (isActive) => {
        return !!(ticketId && parseFloat(ticketId as string)) && isActive
    })
