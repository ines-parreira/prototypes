import React, {SyntheticEvent, useCallback} from 'react'
import {Call} from '@twilio/voice-sdk'
import {useHistory} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import {declineCall} from 'hooks/integrations/phone/api'
import PhoneIntegrationName from '../PhoneIntegrationName/PhoneIntegrationName'
import PhoneInfobarWrapper from '../PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneCustomerName from '../PhoneCustomerName/PhoneCustomerName'
import {useConnectionParameters} from '../hooks'

import css from './IncomingPhoneCall.less'

type Props = {
    call: Call
}

export default function IncomingPhoneCall({call}: Props): JSX.Element {
    const history = useHistory()
    const {ticketId} = useConnectionParameters(call)

    const openTicket = useCallback(() => {
        if (ticketId) {
            history.push(`/app/ticket/${ticketId}`)
        }
    }, [history, ticketId])

    const {integrationId, customerName, customerPhoneNumber} =
        useConnectionParameters(call)

    return (
        <div
            data-testid="incoming-phone-call"
            className={css.container}
            onClick={openTicket}
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
                    onClick={() => call.accept()}
                >
                    <i className="material-icons mr-2">phone</i>
                    Accept
                </Button>
                <Button
                    intent="secondary"
                    data-testid="decline-call-button"
                    className={css.decline}
                    onClick={(event: SyntheticEvent<HTMLButtonElement>) => {
                        event.stopPropagation()
                        call.ignore()
                        call.emit('cancel')

                        void declineCall(call)
                    }}
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
