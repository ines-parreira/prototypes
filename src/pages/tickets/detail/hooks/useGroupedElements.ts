import {fromJS, Map} from 'immutable'
import {useMemo} from 'react'

import {getActionByName} from 'config/actions'
import {PHONE_EVENTS} from 'constants/event'
import useAppSelector from 'hooks/useAppSelector'
import {isTicketEvent, isTicketRuleSuggestion} from 'models/ticket/predicates'
import {contentfulEventTypesValues} from 'pages/tickets/detail/components/AuditLogEvent'
import {PRIVATE_REPLY_ACTIONS} from 'pages/tickets/detail/components/PrivateReplyEvent/constants'
import {
    getRuleSuggestionContent,
    isSuggestionEmpty,
} from 'pages/tickets/detail/components/RuleSuggestion/RuleSuggestion'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {getTicketBodyElements, getTicketState} from 'state/ticket/selectors'

type FakeVirtuosoItems = 'header'

export default function useGroupedElements() {
    const bodyElements = useAppSelector(getTicketBodyElements)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const ticket = useAppSelector(getTicketState)

    return useMemo(
        () => [
            'header' as FakeVirtuosoItems,
            ...bodyElements.filter((element) => {
                // filtering is applied to remove elements that would result in a null node rendered
                // react-virtuoso yields a warning when a null node is passed because it shouldn't handle zero-sized elements

                if (Array.isArray(element)) return true
                if (isTicketRuleSuggestion(element))
                    return (
                        hasAutomationAddOn &&
                        !isSuggestionEmpty(
                            getRuleSuggestionContent(ticket.toJS())
                        )
                    )
                if (!isTicketEvent(element)) return true

                const elementMap: Map<any, any> = fromJS(element)
                const actionName = elementMap.getIn(['data', 'action_name'])
                const actionConfig = getActionByName(actionName)

                return (
                    contentfulEventTypesValues.includes(
                        element.type as typeof contentfulEventTypesValues[number]
                    ) ||
                    PHONE_EVENTS.includes(element.type) ||
                    (!!actionName &&
                        PRIVATE_REPLY_ACTIONS.includes(actionName)) ||
                    !!actionConfig
                )
            }),
        ],
        [bodyElements, hasAutomationAddOn, ticket]
    )
}
