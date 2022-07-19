import React, {SyntheticEvent, useCallback} from 'react'
import {Call} from '@twilio/voice-sdk'
import {useHistory} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import client from '../../../../../models/api/resources'
import PhoneIntegrationName from '../PhoneIntegrationName/PhoneIntegrationName'
import PhoneInfobarWrapper from '../PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneCustomerName from '../PhoneCustomerName/PhoneCustomerName'
import {useConnectionParameters} from '../hooks'

import css from './IncomingPhoneCall.less'

type Props = {
    call: Call
}

export default function IncomingPhoneCall({call}: Props): JSX.Element {
    const {onAccept} = useAccept(call)
    const {onDecline} = useDecline(call)
    const {onOpenTicket} = useOpenTicket(call)
    const {integrationId, customerName, customerPhoneNumber} =
        useConnectionParameters(call)

    return (
        <div
            data-testid="incoming-phone-call"
            className={css.container}
            onClick={onOpenTicket}
        >
            <div className={css.inner}>
                <PhoneIntegrationName integrationId={integrationId} primary />
                <PhoneCustomerName
                    name={customerName}
                    phoneNumber={customerPhoneNumber}
                />
                <Button
                    data-testid="accept-call-button"
                    intent="secondary"
                    className={css.accept}
                    onClick={onAccept}
                >
                    <i className="material-icons mr-2">phone</i>
                    Accept
                </Button>
                <Button
                    intent="secondary"
                    data-testid="decline-call-button"
                    className={css.decline}
                    onClick={onDecline}
                >
                    <i className="material-icons mr-2">call_end</i>
                    Decline
                </Button>
            </div>
            <PhoneInfobarWrapper primary>
                <span>Incoming call...</span>
            </PhoneInfobarWrapper>
        </div>
    )
}

function useAccept(call: Call) {
    const onAccept = useCallback(() => {
        call.accept()
    }, [call])

    return {onAccept}
}

function useDecline(call: Call) {
    const onDecline = useCallback(
        (event: SyntheticEvent<HTMLButtonElement>) => {
            event.stopPropagation()
            call.ignore()
            call.emit('cancel')
            onIgnore(call).catch(console.error)
        },
        [call]
    )

    return {onDecline}
}

function useOpenTicket(call: Call) {
    const history = useHistory()
    const {ticketId} = useConnectionParameters(call)

    const onOpenTicket = useCallback(() => {
        if (ticketId) {
            history.push(`/app/ticket/${ticketId}`)
        }
    }, [history, ticketId])

    return {onOpenTicket}
}

async function onIgnore(call: Call) {
    try {
        const ticketId = parseInt(
            call.customParameters.get('ticket_id') as string
        )
        const callSid = call.customParameters.get('call_sid') as string

        await client.post('/integrations/phone/call/declined', {
            ticket_id: ticketId,
            call_sid: callSid,
        })
    } catch (error) {
        console.error(error)
    }
}
