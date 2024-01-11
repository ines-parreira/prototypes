import React, {useCallback, useState} from 'react'
import classnames from 'classnames'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'

import {DatetimeLabel} from 'pages/common/utils/labels'
import {PhoneIntegrationEvent} from 'constants/integrations/types/event'

import css from '../Event.less'
import callAnsweredIcon from './icons/call-answered.svg'
import callMissedIcon from './icons/call-missed.svg'
import callForwardedIcon from './icons/call-forwarded.svg'
import PhoneEventDetails from './PhoneEventDetails'

const icons = new window.Map<string, string>([
    [PhoneIntegrationEvent.ConversationStarted, callAnsweredIcon],
    [
        PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
        callForwardedIcon,
    ],
    [
        PhoneIntegrationEvent.PhoneCallForwardedToGorgiasNumber,
        callForwardedIcon,
    ],
    [PhoneIntegrationEvent.PhoneCallForwarded, callForwardedIcon],
    [PhoneIntegrationEvent.MessagePlayed, callAnsweredIcon],
    [PhoneIntegrationEvent.PhoneCallTransferredToAgent, callForwardedIcon],
    [PhoneIntegrationEvent.PhoneCallTransferToAgentMissed, callMissedIcon],
])

const actionFailedIcon = (
    <div className={classnames(css.icon, css.danger)} title="Fail">
        <i className="material-icons">close</i>
    </div>
)

const materialIcons = new window.Map<string, any>([
    [PhoneIntegrationEvent.PhoneCallTransferToAgentFailed, actionFailedIcon],
])

const names = new window.Map<string, string>([
    [PhoneIntegrationEvent.ConversationStarted, 'Phone conversation started'],
    [
        PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
        'Call forwarded to an external number',
    ],
    [
        PhoneIntegrationEvent.PhoneCallForwardedToGorgiasNumber,
        'Call forwarded to a Gorgias number',
    ],
    [PhoneIntegrationEvent.PhoneCallForwarded, 'Call forwarded'],
    [PhoneIntegrationEvent.MessagePlayed, 'Message played'],
    [PhoneIntegrationEvent.PhoneCallTransferredToAgent, 'Call transferred'],
    [PhoneIntegrationEvent.PhoneCallTransferToAgentFailed, 'Call transfer'],
    [
        PhoneIntegrationEvent.PhoneCallTransferToAgentMissed,
        'Transferred call missed',
    ],
])

const agentBasedEvents = [PhoneIntegrationEvent.ConversationStarted]

const callTransferEvents = [
    PhoneIntegrationEvent.PhoneCallTransferredToAgent,
    PhoneIntegrationEvent.PhoneCallTransferToAgentFailed,
    PhoneIntegrationEvent.PhoneCallTransferToAgentMissed,
]

const withDetailsEvents = [
    PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
    PhoneIntegrationEvent.PhoneCallForwardedToGorgiasNumber,
    PhoneIntegrationEvent.MessagePlayed,
    PhoneIntegrationEvent.PhoneCallTransferToAgentFailed,
]

type Props = {
    event: Map<string, any>
    isLast: boolean
}

export default function PhoneEvent({event, isLast}: Props): JSX.Element {
    const eventType = event.get('type')
    const icon = icons.get(eventType) || null
    const materialIcon = materialIcons.get(eventType) || null

    const [displayAdditionalInfo, setDisplayAdditionalInfo] =
        useState<boolean>(false)

    const doesEventTypeHaveDetails = withDetailsEvents.includes(eventType)

    const getEventTitle = useCallback(() => {
        const eventType = event.get('type')
        const eventName = names.get(eventType) as string
        const customerName: string | null = event.getIn([
            'data',
            'customer',
            'name',
        ])
        const agentName: string | null = event.getIn(['user', 'name'])
        const isAgentBasedEvent = agentBasedEvents.includes(eventType)
        const isCallTransferEvent = callTransferEvents.includes(eventType)

        if (
            (!isAgentBasedEvent && !isCallTransferEvent) ||
            (!agentName && isAgentBasedEvent) ||
            !customerName
        ) {
            return eventName
        }

        if (isAgentBasedEvent) {
            return `${eventName} by ${agentName as string}`
        }
        if (isCallTransferEvent) {
            const targetedAgentName: string | null = event.getIn([
                'data',
                'targeted_agent',
                'name',
            ])

            if (
                eventType === PhoneIntegrationEvent.PhoneCallTransferredToAgent
            ) {
                return `${eventName} from ${agentName as string} to ${
                    targetedAgentName as string
                }`
            } else if (
                eventType ===
                PhoneIntegrationEvent.PhoneCallTransferToAgentFailed
            ) {
                return `${eventName} to ${targetedAgentName as string} failed`
            }
            return `${eventName} by ${targetedAgentName as string}`
        }
    }, [event])
    const eventTitle = getEventTitle()
    const phoneTicketId: Maybe<string> = event.getIn([
        'data',
        'phone_ticket_id',
    ])

    return (
        <div
            className={classnames(css.component, {
                [css.last]: isLast,
            })}
        >
            <div className={css.event}>
                <div className={css.content}>
                    {icon && (
                        <div className={css.icon}>
                            <div
                                className={css.logo}
                                style={{
                                    WebkitMaskImage: `url(${icon})`,
                                    maskImage: `url(${icon})`,
                                }}
                            />
                        </div>
                    )}
                    {materialIcon !== null && materialIcon}
                    {eventTitle && (
                        <span className={css.actionName}>{eventTitle}</span>
                    )}
                    {phoneTicketId && (
                        <span>
                            <span className="ml-2 mr-2">-</span>
                            <Link to={`/app/ticket/${phoneTicketId}`}>
                                View ticket
                            </Link>
                        </span>
                    )}
                    {doesEventTypeHaveDetails && (
                        <span
                            onClick={() =>
                                setDisplayAdditionalInfo(
                                    (displayAdditionalInfo) =>
                                        !displayAdditionalInfo
                                )
                            }
                        >
                            <i
                                className={`material-icons blue ${css.eventDetailsIcon} cursor-pointer`}
                            >
                                {displayAdditionalInfo
                                    ? 'keyboard_arrow_up'
                                    : 'keyboard_arrow_down'}
                            </i>
                        </span>
                    )}
                </div>
                <DatetimeLabel
                    dateTime={event.get('created_datetime')}
                    className={classnames(css.date, 'text-faded')}
                />
            </div>
            {displayAdditionalInfo && <PhoneEventDetails event={event} />}
        </div>
    )
}
