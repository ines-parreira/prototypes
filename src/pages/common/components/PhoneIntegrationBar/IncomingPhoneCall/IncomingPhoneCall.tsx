import React, {SyntheticEvent, useCallback} from 'react'
import {Connection} from 'twilio-client'
import {Button} from 'reactstrap'
import {useHistory} from 'react-router-dom'

import client from '../../../../../models/api/resources'
import PhoneIntegrationName from '../PhoneIntegrationName/PhoneIntegrationName'
import PhoneInfobarWrapper from '../PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneCustomerName from '../PhoneCustomerName/PhoneCustomerName'
import {useConnectionParameters} from '../hooks'

import css from './IncomingPhoneCall.less'

type Props = {
    connection: Connection
}

export default function IncomingPhoneCall({connection}: Props): JSX.Element {
    const {onAccept} = useAccept(connection)
    const {onDecline} = useDecline(connection)
    const {onOpenTicket} = useOpenTicket(connection)
    const {
        integrationId,
        customerName,
        customerPhoneNumber,
    } = useConnectionParameters(connection)

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
                    className={css.accept}
                    onClick={onAccept}
                >
                    <i className="material-icons mr-2">phone</i>
                    Accept
                </Button>
                <Button
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

function useAccept(connection: Connection) {
    const onAccept = useCallback(() => {
        connection.accept()
    }, [connection])

    return {onAccept}
}

function useDecline(connection: Connection) {
    const onDecline = useCallback(
        (event: SyntheticEvent<HTMLButtonElement>) => {
            event.stopPropagation()
            connection.ignore()
            onIgnore(connection).catch(console.error)
        },
        [connection]
    )

    return {onDecline}
}

function useOpenTicket(connection: Connection) {
    const history = useHistory()
    const {ticketId} = useConnectionParameters(connection)

    const onOpenTicket = useCallback(() => {
        if (ticketId) {
            history.push(`/app/ticket/${ticketId}`)
        }
    }, [history, ticketId])

    return {onOpenTicket}
}

async function onIgnore(connection: Connection) {
    try {
        const ticketId = parseInt(
            connection.customParameters.get('ticket_id') as string
        )
        const callSid = connection.customParameters.get('call_sid') as string

        await client.post('/integrations/phone/call/declined', {
            ticket_id: ticketId,
            call_sid: callSid,
        })
    } catch (error) {
        console.error(error)
    }
}
