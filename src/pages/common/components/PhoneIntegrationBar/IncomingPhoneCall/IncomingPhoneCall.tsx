import React, { SyntheticEvent, useCallback, useRef } from 'react'

import { Call } from '@twilio/voice-sdk'
import classNames from 'classnames'
import moment from 'moment'
import { useHistory, useLocation } from 'react-router-dom'

import { AlertBanner, AlertBannerTypes } from 'AlertBanners'
import { declineCall } from 'hooks/integrations/phone/api'
import { useNow } from 'hooks/useNow'
import Button from 'pages/common/components/button/Button'
import useMicrophonePermissions from 'pages/integrations/integration/components/voice/useMicrophonePermissions'

import VoiceCallAgentLabel from '../../VoiceCallAgentLabel/VoiceCallAgentLabel'
import { MICROPHONE_PERMISSION_REQUIRED_MESSAGE } from '../constants'
import { useConnectionParameters } from '../hooks'
import PhoneCustomerName from '../PhoneCustomerName/PhoneCustomerName'
import PhoneInfobarWrapper from '../PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneIntegrationName from '../PhoneIntegrationName/PhoneIntegrationName'

import css from './IncomingPhoneCall.less'

type Props = {
    call: Call
    className?: string
}

export default function IncomingPhoneCall({
    call,
    className,
}: Props): JSX.Element {
    const history = useHistory()
    const location = useLocation()
    const { permissionDenied } = useMicrophonePermissions(1000)

    const {
        integrationId,
        customerName,
        customerPhoneNumber,
        transferFromAgentId,
        ticketId,
    } = useConnectionParameters(call)

    const now = useNow()
    const waitTimeStart = useRef(new Date())

    const openTicket = useCallback(() => {
        const isWhatsAppMigrationPage = location.pathname.startsWith(
            '/app/settings/integrations/whatsapp/migration',
        )
        if (ticketId && !isWhatsAppMigrationPage) {
            history.push(`/app/ticket/${ticketId}`)
        }
    }, [history, ticketId, location])

    const formattedWaitTime = moment
        .utc(moment(now).diff(moment(waitTimeStart.current)))
        .format('mm:ss')

    return (
        <>
            {permissionDenied && (
                <AlertBanner
                    message={MICROPHONE_PERMISSION_REQUIRED_MESSAGE}
                    type={AlertBannerTypes.Critical}
                />
            )}
            <div
                className={classNames(css.container, className)}
                onClick={openTicket}
            >
                <div className={css.inner}>
                    <PhoneIntegrationName
                        integrationId={integrationId}
                        primary
                    />
                    <div className={css.callerDetails}>
                        {transferFromAgentId && (
                            <>
                                <VoiceCallAgentLabel
                                    agentId={transferFromAgentId}
                                    className={css.agentLabel}
                                    semibold
                                />
                                <span>transferring</span>
                            </>
                        )}
                        <PhoneCustomerName
                            name={customerName}
                            phoneNumber={customerPhoneNumber}
                        />
                    </div>
                    <Button
                        aria-label="Accept phone call"
                        intent="secondary"
                        className={css.accept}
                        onClick={() => call.accept()}
                    >
                        <i className="material-icons mr-2">phone</i>
                        Accept
                    </Button>
                    <Button
                        intent="secondary"
                        aria-label="Decline phone call"
                        className={css.decline}
                        onClick={(event: SyntheticEvent<HTMLButtonElement>) => {
                            event.stopPropagation()

                            call.reject()
                            call.emit('cancel')
                            void declineCall(call)
                        }}
                    >
                        <i className="material-icons mr-2">call_end</i>
                        Decline
                    </Button>
                </div>
                <PhoneInfobarWrapper primary>
                    <span>
                        {transferFromAgentId
                            ? 'Incoming transfer...'
                            : 'Incoming call...'}
                    </span>
                    <span>Waiting for {formattedWaitTime}</span>
                </PhoneInfobarWrapper>
            </div>
        </>
    )
}
