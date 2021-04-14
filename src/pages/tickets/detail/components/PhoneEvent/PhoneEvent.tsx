import React from 'react'
import classnames from 'classnames'
import {Map} from 'immutable'

import {DatetimeLabel} from '../../../../common/utils/labels.js'
import {PhoneIntegrationEvent} from '../../../../../constants/integrations/types/event'

import css from '../Event.less'

import callIncomingIcon from './icons/call-incoming.svg'
import callOutgoingIcon from './icons/call-outgoing.svg'
import callCompletedIcon from './icons/call-completed.svg'
import callMissedIcon from './icons/call-missed.svg'
import voicemailLeftIcon from './icons/voicemail-left.svg'

const icons = new window.Map<string, string>([
    [PhoneIntegrationEvent.IncomingPhoneCall, callIncomingIcon],
    [PhoneIntegrationEvent.OutgoingPhoneCall, callOutgoingIcon],
    [PhoneIntegrationEvent.CompletedPhoneCall, callCompletedIcon],
    [PhoneIntegrationEvent.MissedPhoneCall, callMissedIcon],
    [PhoneIntegrationEvent.VoicemailRecording, voicemailLeftIcon],
])

const names = new window.Map<string, string>([
    [PhoneIntegrationEvent.IncomingPhoneCall, 'Incoming call'],
    [PhoneIntegrationEvent.OutgoingPhoneCall, 'Outgoing call'],
    [PhoneIntegrationEvent.CompletedPhoneCall, 'Call ended'],
    [PhoneIntegrationEvent.MissedPhoneCall, 'Missed call'],
    [PhoneIntegrationEvent.VoicemailRecording, 'Voicemail left by a customer'],
])

type Props = {
    event: Map<string, any>
    isLast: boolean
}

export default function PhoneEvent({event, isLast}: Props): JSX.Element {
    const icon = icons.get(event.get('type')) || null
    const name = names.get(event.get('type')) || null

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
                            <img src={icon} alt={name || ''} />
                        </div>
                    )}
                    {name && <span className={css.actionName}>{name}</span>}
                </div>
                <DatetimeLabel dateTime={event.get('created_datetime')} />
            </div>
        </div>
    )
}
