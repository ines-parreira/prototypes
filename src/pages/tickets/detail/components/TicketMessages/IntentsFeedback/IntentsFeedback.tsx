import _difference from 'lodash/difference'
import _isEqual from 'lodash/isEqual'

import React, {useState, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {AxiosError} from 'axios'

import {useAsyncFn} from 'react-use'

import {sendIntentFeedbackSuccess} from '../../../../../../state/ticket/actions'
import Loader from '../../../../../common/components/Loader/Loader'
import {NotificationStatus} from '../../../../../../state/notifications/types'
import {getCurrentAccountState} from '../../../../../../state/currentAccount/selectors'
import {getCurrentUser} from '../../../../../../state/currentUser/selectors'
import {humanizeString} from '../../../../../../utils'
import client from '../../../../../../models/api/resources'

import type {
    TicketMessage,
    TicketMessageIntent,
} from '../../../../../../models/ticket/types'
import type {RootState} from '../../../../../../state/types'
import {notify} from '../../../../../../state/notifications/actions'

import {Messages} from './constants'
import {IntentsFeedbackDropdown} from './IntentsFeedbackDropdown'
import {ActiveIntentItem} from './ActiveIntentItem'
import {AvailableIntentItem} from './AvailableIntentItem'
import {
    UserSubmissionSubEventProps,
    UserSubmissionSubEventType,
    logUserSubmissionEvent,
    logDropdownOpenEvent,
} from './intentsFeedbackSegmentEvents'

type OwnProps = {
    message: TicketMessage
    allIntents?: Record<string, string>
}

export const IntentsFeedbackContainer = ({
    account,
    user,
    message,
    notify,
    sendIntentFeedbackSuccess,
    allIntents = window.GORGIAS_CONSTANTS.INTENTS,
}: OwnProps & ConnectedProps<typeof connector>) => {
    const allIntentsNames: string[] = useMemo(() => Object.keys(allIntents), [
        allIntents,
    ])
    const {ticket_id: ticketId = 0, id: messageId = 0} = message
    const intents = message.intents!
    const isFirstCuration = useMemo(
        () =>
            !intents.filter((intent) => intent.rejected !== null).length &&
            !intents.filter((intent) => intent.is_user_feedback).length,
        [intents]
    )
    const getIntentsFromMessage = (intents: TicketMessageIntent[]) =>
        allIntentsNames.filter((name) =>
            intents
                .filter((intent) => !intent.rejected)
                .map((intent) => intent.name)
                .includes(name)
        )
    const messageIntentNames = useMemo(() => getIntentsFromMessage(intents), [
        intents,
    ])

    const [activeIntentsNames, setActiveIntentsNames] = useState<string[]>(
        messageIntentNames
    )

    const [confirmableIntentsNames, setConfirmableIntentsNames] = useState<
        string[]
    >(isFirstCuration ? activeIntentsNames : [])

    const [segmentSubEvents, setSegmentSubEvents] = useState<
        UserSubmissionSubEventProps[]
    >([])

    const intentURI = `/api/tickets/${ticketId}/messages/${messageId}/intents/`

    const hasUnsavedIntents = useMemo((): boolean => {
        const previousIntentNames = getIntentsFromMessage(intents)

        const hasConfirmed = !_isEqual(
            previousIntentNames,
            confirmableIntentsNames
        )
        const hasChanged = !_isEqual(previousIntentNames, activeIntentsNames)

        return isFirstCuration ? hasConfirmed || hasChanged : hasChanged
    }, [intents, activeIntentsNames, confirmableIntentsNames])

    const trackFeedbackSubmission = (nextState: string[]) => {
        logUserSubmissionEvent({
            account_domain: account.get('domain'),
            user_id: user.get('id'),
            ticket_id: message.ticket_id!,
            message_id: message.id!,
            is_first_curation: isFirstCuration,
            previous_state: messageIntentNames,
            next_state: nextState,
            sub_events: segmentSubEvents,
        })
        setSegmentSubEvents([])
    }

    const [{loading}, sendFeedback] = useAsyncFn(async () => {
        let payload = activeIntentsNames
        const addedIntents = _difference(
            activeIntentsNames,
            intents.map((intent) => intent.name)
        )

        if (isFirstCuration) {
            const confirmed = _difference(
                intents.map((intent) => intent.name),
                confirmableIntentsNames
            )

            payload =
                confirmed.length > 0
                    ? [...confirmed, ...addedIntents]
                    : activeIntentsNames
        }

        try {
            const resp = await client.post<{intents: TicketMessageIntent[]}>(
                intentURI,
                {active_intents: payload}
            )
            const {intents} = resp.data
            const newIntents = getIntentsFromMessage(intents)
            trackFeedbackSubmission(newIntents)

            void sendIntentFeedbackSuccess({
                messageId: message.id as number,
                intents,
            })
            void notify({
                message: Messages.NOTIFICATION_SUCCESS,
                status: NotificationStatus.Success,
            })
            setActiveIntentsNames(newIntents)
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            if (response) {
                void notify({
                    message: response.data.error.msg,
                    status: NotificationStatus.Error,
                })
            } else {
                void notify({
                    message: Messages.NOTIFICATION_UNKNOWN_ERROR,
                    status: NotificationStatus.Error,
                })
            }
        }
    }, [intents, activeIntentsNames, confirmableIntentsNames])

    const addIntent = (name: string) => {
        setActiveIntentsNames(
            activeIntentsNames.includes(name)
                ? activeIntentsNames
                : [...activeIntentsNames, name].sort()
        )
        setConfirmableIntentsNames(
            confirmableIntentsNames.filter((intent) => intent !== name)
        )
    }

    const removeIntent = (name: string) => {
        setActiveIntentsNames(
            activeIntentsNames.filter((intent) => intent !== name)
        )
        setSegmentSubEvents([
            ...segmentSubEvents,
            {
                event_type: UserSubmissionSubEventType.REMOVE_INTENT,
                intent: name,
            },
        ])
    }

    const toggle = (isOpen: boolean) => {
        if (isOpen) {
            logDropdownOpenEvent({
                account_domain: account.get('domain'),
                user_id: user.get('id'),
                ticket_id: message.ticket_id!,
                message_id: message.id!,
            })
        }

        if (!isOpen && hasUnsavedIntents) {
            void sendFeedback()
        }

        setSegmentSubEvents([])
    }

    const numActiveIntents = activeIntentsNames.length
    const activeIntentsHeader =
        numActiveIntents === 0
            ? 'No intents detected'
            : numActiveIntents === 1
            ? activeIntentsNames[0]
            : `${numActiveIntents} intents detected`

    return !loading ? (
        <IntentsFeedbackDropdown
            label={activeIntentsHeader}
            messageId={message.id!}
            onToggle={toggle}
            activeIntentsNames={activeIntentsNames}
            availableIntentsNames={_difference(
                allIntentsNames,
                activeIntentsNames
            )}
            renderActiveIntent={(intentName: string) => {
                return (
                    <ActiveIntentItem
                        key={intentName}
                        messageId={message.id!}
                        option={{
                            key: intentName,
                            label: humanizeString(intentName),
                            description: allIntents[intentName],
                        }}
                        isConfirmable={
                            confirmableIntentsNames.includes(intentName) &&
                            isFirstCuration
                        }
                        isConfirmed={
                            !confirmableIntentsNames.includes(intentName) ||
                            !isFirstCuration
                        }
                        onConfirm={(name) => {
                            addIntent(name)
                            setSegmentSubEvents([
                                ...segmentSubEvents,
                                {
                                    event_type:
                                        UserSubmissionSubEventType.CONFIRM_INTENT,
                                    intent: name,
                                },
                            ])
                        }}
                        onReject={removeIntent}
                        tooltipContainer={`intent-tooltip-${message.id!}`}
                    />
                )
            }}
            renderAvailableIntent={(intentName: string) => {
                return (
                    <AvailableIntentItem
                        key={intentName}
                        messageId={message.id!}
                        option={{
                            key: intentName,
                            label: humanizeString(intentName),
                            description: allIntents[intentName],
                        }}
                        onConfirm={(name) => {
                            addIntent(name)
                            setSegmentSubEvents([
                                ...segmentSubEvents,
                                {
                                    event_type:
                                        UserSubmissionSubEventType.ADD_INTENT,
                                    intent: name,
                                },
                            ])
                        }}
                        isDisabled={numActiveIntents >= 3}
                        tooltipContainer={`intent-tooltip-${message.id!}`}
                    />
                )
            }}
        />
    ) : (
        <Loader inline minHeight={'0px'} size={'0.8em'} />
    )
}

const mapPropsToState = (state: RootState) => {
    return {
        user: getCurrentUser(state),
        account: getCurrentAccountState(state),
    }
}

const connector = connect(mapPropsToState, {
    sendIntentFeedbackSuccess,
    notify,
})

export default connector(IntentsFeedbackContainer)
