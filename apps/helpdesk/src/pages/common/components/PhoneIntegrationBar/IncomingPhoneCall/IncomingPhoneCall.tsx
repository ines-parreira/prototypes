import React, { SyntheticEvent, useCallback, useRef } from 'react'

import { useNow } from '@repo/hooks'
import { Call } from '@twilio/voice-sdk'
import moment from 'moment'
import { useHistory, useLocation } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { AlertBannerTypes } from 'AlertBanners'
import { AlertBanner } from 'AlertBanners/components/AlertBanner'
import { declineCall } from 'hooks/integrations/phone/api'
import useMicrophonePermissions from 'pages/integrations/integration/components/voice/useMicrophonePermissions'

import VoiceCallAgentLabel from '../../VoiceCallAgentLabel/VoiceCallAgentLabel'
import { MICROPHONE_PERMISSION_REQUIRED_MESSAGE } from '../constants'
import { useConnectionParameters } from '../hooks'
import PhoneBarCallerDetailsContainer from '../PhoneBarCallerDetailsContainer/PhoneBarCallerDetailsContainer'
import PhoneBarContainer from '../PhoneBarContainer/PhoneBarContainer'
import PhoneBarInnerContent from '../PhoneBarInnerContent/PhoneBarInnerContent'
import PhoneCustomerName from '../PhoneCustomerName/PhoneCustomerName'
import PhoneInfobarWrapper from '../PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneIntegrationName from '../PhoneIntegrationName/PhoneIntegrationName'
import QueueName from '../QueueName/QueueName'

import css from './IncomingPhoneCall.less'

type Props = {
    call: Call
}

export default function IncomingPhoneCall({ call }: Props): JSX.Element {
    const history = useHistory()
    const location = useLocation()
    const { permissionDenied } = useMicrophonePermissions(1000)

    const queueId = call.customParameters.get('queue_id')
        ? parseInt(call.customParameters.get('queue_id') as string)
        : null

    const {
        integrationId,
        customerName,
        customerPhoneNumber,
        transferFromAgentId,
        ticketId,
        isTransferring,
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
            <PhoneBarContainer onClick={openTicket} isHighlighted>
                <PhoneBarInnerContent>
                    <PhoneBarCallerDetailsContainer>
                        <PhoneIntegrationName
                            integrationId={integrationId}
                            primary
                        />
                        <QueueName queueId={queueId} primary />
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
                    </PhoneBarCallerDetailsContainer>
                    <div>
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
                            onClick={(
                                event: SyntheticEvent<HTMLButtonElement>,
                            ) => {
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
                </PhoneBarInnerContent>
                <PhoneInfobarWrapper primary>
                    <span>
                        {isTransferring
                            ? 'Incoming transfer...'
                            : 'Incoming call...'}
                    </span>
                    <span>Waiting for {formattedWaitTime}</span>
                </PhoneInfobarWrapper>
            </PhoneBarContainer>
        </>
    )
}
