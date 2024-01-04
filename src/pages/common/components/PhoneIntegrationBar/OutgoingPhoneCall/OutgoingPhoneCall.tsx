import React from 'react'
import {Call} from '@twilio/voice-sdk'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'
import {useCallStatus} from '../../../../../hooks/integrations/phone/useCallStatus'
import PhoneIntegrationName from '../PhoneIntegrationName/PhoneIntegrationName'
import PhoneInfobarWrapper from '../PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneCustomerName from '../PhoneCustomerName/PhoneCustomerName'
import {useConnectionParameters} from '../hooks'

import css from './OutgoingPhoneCall.less'

type Props = {
    call: Call
    className?: string
}

export default function OutgoingPhoneCall({
    call,
    className,
}: Props): JSX.Element {
    const {integrationId, customerName, customerPhoneNumber} =
        useConnectionParameters(call)
    const status = useCallStatus(call)

    return (
        <div
            data-testid="outgoing-phone-call"
            className={classNames(css.container, className)}
        >
            <div className={css.inner}>
                <PhoneIntegrationName integrationId={integrationId} primary />
                <span className="mr-1">Outgoing call to</span>
                <PhoneCustomerName
                    name={customerName}
                    phoneNumber={customerPhoneNumber}
                />
                <Button
                    intent="secondary"
                    data-testid="end-call-button"
                    className={css.end}
                    onClick={() => call.disconnect()}
                >
                    <i className="material-icons mr-2">call_end</i>
                    End Call
                </Button>
            </div>
            <PhoneInfobarWrapper primary>
                <span className="text-capitalize">{status}...</span>
            </PhoneInfobarWrapper>
        </div>
    )
}
