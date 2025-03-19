import { Call } from '@twilio/voice-sdk'
import classNames from 'classnames'

import { useCallStatus } from 'hooks/integrations/phone/useCallStatus'
import Button from 'pages/common/components/button/Button'
import PhoneCustomerName from 'pages/common/components/PhoneIntegrationBar/PhoneCustomerName/PhoneCustomerName'
import PhoneInfobarWrapper from 'pages/common/components/PhoneIntegrationBar/PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneIntegrationName from 'pages/common/components/PhoneIntegrationBar/PhoneIntegrationName/PhoneIntegrationName'

import { useConnectionParameters } from '../hooks'

import css from './OutgoingPhoneCall.less'

type Props = {
    call: Call
    className?: string
}

export default function OutgoingPhoneCall({
    call,
    className,
}: Props): JSX.Element {
    const { integrationId, customerName, customerPhoneNumber } =
        useConnectionParameters(call)
    const status = useCallStatus(call)

    return (
        <div className={classNames(css.container, className)}>
            <div className={css.inner}>
                <PhoneIntegrationName integrationId={integrationId} primary />
                <span className="mr-1">Outgoing call to</span>
                <PhoneCustomerName
                    name={customerName}
                    phoneNumber={customerPhoneNumber}
                />
                <Button
                    intent="secondary"
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
