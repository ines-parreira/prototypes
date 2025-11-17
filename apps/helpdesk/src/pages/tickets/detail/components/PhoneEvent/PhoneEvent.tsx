import { useCallback, useState } from 'react'

import classnames from 'classnames'
import type { Map } from 'immutable'
import { Link } from 'react-router-dom'

import { PhoneIntegrationEvent } from 'constants/integrations/types/event'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import callAnsweredIcon from './icons/call-answered.svg'
import callForwardedIcon from './icons/call-forwarded.svg'
import PhoneEventDetails from './PhoneEventDetails'

import css from '../Event.less'

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
])

const agentBasedEvents = [PhoneIntegrationEvent.ConversationStarted]

const withDetailsEvents = [
    PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber,
    PhoneIntegrationEvent.PhoneCallForwardedToGorgiasNumber,
    PhoneIntegrationEvent.MessagePlayed,
]

type Props = {
    event: Map<string, any>
    isLast: boolean
}

export default function PhoneEvent({ event, isLast }: Props): JSX.Element {
    const eventType = event.get('type')
    const icon = icons.get(eventType) || null

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

        if (
            !isAgentBasedEvent ||
            (!agentName && isAgentBasedEvent) ||
            !customerName
        ) {
            return eventName
        }

        if (isAgentBasedEvent) {
            return `${eventName} by ${agentName as string}`
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
                                        !displayAdditionalInfo,
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
