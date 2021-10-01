import React, {useCallback} from 'react'
import {Call} from '@twilio/voice-sdk'
import {Button} from 'reactstrap'

import PhoneIntegrationName from '../PhoneIntegrationName/PhoneIntegrationName'
import PhoneInfobarWrapper from '../PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneCustomerName from '../PhoneCustomerName/PhoneCustomerName'
import {useConnectionParameters} from '../hooks'

import css from './OutgoingPhoneCall.less'

type Props = {
    call: Call
}

export default function OutgoingPhoneCall({call}: Props): JSX.Element {
    const {onDisconnect} = useDisconnect(call)
    const {
        integrationId,
        customerName,
        customerPhoneNumber,
    } = useConnectionParameters(call)

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

function useDisconnect(call: Call) {
    const onDisconnect = useCallback(() => {
        call.disconnect()
    }, [call])

    return {onDisconnect}
}
