import type { SyntheticEvent } from 'react'
import React, { useCallback, useRef } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useNow } from '@repo/hooks'
import type { Call } from '@twilio/voice-sdk'
import moment from 'moment'
import { useHistory, useLocation } from 'react-router-dom'

import { Box, Button, Icon, LegacyButton, Tag, Text } from '@gorgias/axiom'

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
    const applyCallBarRestyling = useFlag(FeatureFlagKey.CallBarRestyling)

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
        isPossibleSpam,
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
            <PhoneBarContainer isHighlighted>
                <PhoneBarInnerContent>
                    <PhoneBarCallerDetailsContainer>
                        <Box display="flex" gap="xs" marginRight="lg">
                            <PhoneIntegrationName
                                integrationId={integrationId}
                                primary
                            />
                            <QueueName queueId={queueId} primary />
                        </Box>
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
                            {isPossibleSpam && (
                                <Tag
                                    leadingSlot={
                                        <Icon name={'triangle-warning'} />
                                    }
                                    color={'orange'}
                                >
                                    Maybe spam
                                </Tag>
                            )}
                            <PhoneCustomerName
                                name={customerName}
                                phoneNumber={customerPhoneNumber}
                                ticketId={ticketId}
                            />
                        </div>
                    </PhoneBarCallerDetailsContainer>
                    {applyCallBarRestyling ? (
                        <Box gap="md">
                            <Button
                                aria-label="Accept phone call"
                                onClick={() => {
                                    call.accept()
                                    openTicket()
                                }}
                                leadingSlot="comm-phone-incoming"
                            >
                                Accept
                            </Button>
                            <Button
                                intent="destructive"
                                aria-label="Decline phone call"
                                leadingSlot="comm-phone-end"
                                onClick={(event) => {
                                    event.stopPropagation()

                                    call.reject()
                                    call.emit('cancel')
                                    void declineCall(call)
                                }}
                            >
                                Decline
                            </Button>
                        </Box>
                    ) : (
                        <div>
                            <LegacyButton
                                aria-label="Accept phone call"
                                intent="secondary"
                                className={css.accept}
                                onClick={() => call.accept()}
                            >
                                <i className="material-icons mr-2">phone</i>
                                Accept
                            </LegacyButton>
                            <LegacyButton
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
                            </LegacyButton>
                        </div>
                    )}
                </PhoneBarInnerContent>
                <PhoneInfobarWrapper primary>
                    <Text variant={applyCallBarRestyling ? 'bold' : 'regular'}>
                        {isTransferring
                            ? 'Incoming transfer...'
                            : 'Incoming call...'}
                    </Text>
                    <span>Waiting for {formattedWaitTime}</span>
                </PhoneInfobarWrapper>
            </PhoneBarContainer>
        </>
    )
}
