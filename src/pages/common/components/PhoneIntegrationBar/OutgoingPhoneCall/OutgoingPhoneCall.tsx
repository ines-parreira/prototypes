import React, {useCallback} from 'react'
import {Connection} from 'twilio-client'
import {Button} from 'reactstrap'

import PhoneIntegrationName from '../PhoneIntegrationName/PhoneIntegrationName'
import PhoneInfobarWrapper from '../PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneCustomerName from '../PhoneCustomerName/PhoneCustomerName'
import {useConnectionParameters} from '../hooks'

import css from './OutgoingPhoneCall.less'

type Props = {
    connection: Connection
}

export default function OutgoingPhoneCall({connection}: Props): JSX.Element {
    const {onDisconnect} = useDisconnect(connection)
    const {
        integrationId,
        customerName,
        customerPhoneNumber,
    } = useConnectionParameters(connection)

    return (
        <div data-testid="outgoing-phone-call" className={css.container}>
            <div className={css.inner}>
                <PhoneIntegrationName integrationId={integrationId} primary />
                <span className="mr-1">Outgoing call to</span>
                <PhoneCustomerName
                    name={customerName}
                    phoneNumber={customerPhoneNumber}
                />
                <Button
                    data-testid="end-call-button"
                    className={css.end}
                    onClick={onDisconnect}
                >
                    <i className="material-icons mr-2">call_end</i>
                    End Call
                </Button>
            </div>
            <PhoneInfobarWrapper primary>
                <span>Dialing up...</span>
            </PhoneInfobarWrapper>
        </div>
    )
}

function useDisconnect(connection: Connection) {
    const onDisconnect = useCallback(() => {
        connection.disconnect()
    }, [connection])

    return {onDisconnect}
}
