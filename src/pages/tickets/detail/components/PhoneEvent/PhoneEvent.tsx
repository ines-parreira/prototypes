import React, {useCallback, useState} from 'react'
import classnames from 'classnames'
import {Map} from 'immutable'

import {DatetimeLabel} from '../../../../common/utils/labels'
import {PhoneIntegrationEvent} from '../../../../../constants/integrations/types/event'

import css from '../Event.less'

import callAnsweredIcon from './icons/call-answered.svg'
import callIncomingIcon from './icons/call-incoming.svg'
import callOutgoingIcon from './icons/call-outgoing.svg'
import callCompletedIcon from './icons/call-completed.svg'
import callMissedIcon from './icons/call-missed.svg'
import voicemailLeftIcon from './icons/voicemail-left.svg'
import PhoneEventDetails from './PhoneEventDetails'

const icons = new window.Map<string, string>([
    [PhoneIntegrationEvent.IncomingPhoneCall, callIncomingIcon],
    [PhoneIntegrationEvent.OutgoingPhoneCall, callOutgoingIcon],
    [PhoneIntegrationEvent.CompletedPhoneCall, callCompletedIcon],
    [PhoneIntegrationEvent.MissedPhoneCall, callMissedIcon],
    [PhoneIntegrationEvent.VoicemailRecording, voicemailLeftIcon],
    [PhoneIntegrationEvent.PhoneCallAnswered, callAnsweredIcon],
])

const names = new window.Map<string, string>([
    [PhoneIntegrationEvent.IncomingPhoneCall, 'Incoming call'],
    [PhoneIntegrationEvent.OutgoingPhoneCall, 'Outgoing call'],
    [PhoneIntegrationEvent.CompletedPhoneCall, 'Call ended'],
    [PhoneIntegrationEvent.MissedPhoneCall, 'Missed call'],
    [PhoneIntegrationEvent.PhoneCallAnswered, 'Call answered'],
    [PhoneIntegrationEvent.VoicemailRecording, 'Voicemail left'],
])
const customerBasedEvents = [
    PhoneIntegrationEvent.IncomingPhoneCall,
    PhoneIntegrationEvent.MissedPhoneCall,
    PhoneIntegrationEvent.VoicemailRecording,
]
const agentBasedEvents = [
    PhoneIntegrationEvent.PhoneCallAnswered,
    PhoneIntegrationEvent.OutgoingPhoneCall,
]

type Props = {
    event: Map<string, any>
    isLast: boolean
}

export default function PhoneEvent({event, isLast}: Props): JSX.Element {
    const eventType = event.get('type')
    const icon = icons.get(eventType) || null
    const [displayAdditionalInfo, setDisplayAdditionalInfo] = useState<boolean>(
        false
    )
    const handleOpenTicketAdditionalInfo = useCallback(() => {
        setDisplayAdditionalInfo(!displayAdditionalInfo)
    }, [displayAdditionalInfo, setDisplayAdditionalInfo])
    const doesEventTypeHaveDetails =
        eventType !== PhoneIntegrationEvent.MissedPhoneCall

    const getEventTitle = useCallback(() => {
        const eventType = event.get('type')
        const eventName = names.get(eventType) as string
        const customerName: string | null = event.getIn([
            'data',
            'customer',
            'name',
        ])
        const agentName: string | null = event.getIn(['user', 'name'])
        const isCustomerBasedEvent = customerBasedEvents.includes(eventType)
        const isAgentBasedEvent = agentBasedEvents.includes(eventType)

        if (
            (!isCustomerBasedEvent && !isAgentBasedEvent) ||
            (!agentName && isAgentBasedEvent) ||
            (!customerName && isCustomerBasedEvent)
        ) {
            return eventName
        }

        if (isCustomerBasedEvent) {
            if (
                [
                    PhoneIntegrationEvent.IncomingPhoneCall,
                    PhoneIntegrationEvent.MissedPhoneCall,
                ].includes(eventType)
            ) {
                return `${eventName} from ${customerName as string}`
            }
            if (PhoneIntegrationEvent.VoicemailRecording) {
                return `${eventName} by ${customerName as string}`
            }
        }
        if (isAgentBasedEvent) {
            return `${eventName} by ${agentName as string}`
        }
    }, [event])
    const eventTitle = getEventTitle()

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
                            <img src={icon} alt={eventType || ''} />
                        </div>
                    )}
                    {eventTitle && (
                        <span className={css.actionName}>{eventTitle}</span>
                    )}
                    {doesEventTypeHaveDetails && (
                        <span onClick={handleOpenTicketAdditionalInfo}>
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
                <DatetimeLabel dateTime={event.get('created_datetime')} />
            </div>
            {displayAdditionalInfo && <PhoneEventDetails event={event} />}
        </div>
    )
}
