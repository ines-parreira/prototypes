import React, {useCallback} from 'react'
import {Connection} from 'twilio-client'
import {Button} from 'reactstrap'

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
    const {
        integrationId,
        customerName,
        customerPhoneNumber,
    } = useConnectionParameters(connection)

    return (
        <div data-testid="incoming-phone-call" className={css.container}>
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
                <>
                    <span>Incoming call...</span>
                    {/* TODO(@samy): render actual waiting time*/}
                    <span>Waiting for xx:xx</span>
                </>
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
    const onDecline = useCallback(() => {
        connection.ignore()
    }, [connection])

    return {onDecline}
}
