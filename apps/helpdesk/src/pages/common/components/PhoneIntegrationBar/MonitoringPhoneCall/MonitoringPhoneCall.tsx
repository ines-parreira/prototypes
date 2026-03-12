import { useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { Call } from '@twilio/voice-sdk'

import { Box, Button, Text, Tooltip, TooltipContent } from '@gorgias/axiom'
import { useHandleCallWhispering } from '@gorgias/helpdesk-queries'

import { extractMonitoringCallParams } from 'hooks/integrations/phone/monitoring.utils'
import { useCallMessageListener } from 'hooks/integrations/phone/useCallMessageListener'
import { useNotify } from 'hooks/useNotify'
import { TwilioMessageType } from 'models/voiceCall/twilioMessageTypes'
import { DynamicSoundWaveIcon } from 'pages/common/components/PhoneIntegrationBar/DynamicSoundWaveIcon/DynamicSoundWaveIcon'
import { useAudioLevel } from 'pages/common/components/PhoneIntegrationBar/hooks'
import PhoneBarCallerDetailsContainer from 'pages/common/components/PhoneIntegrationBar/PhoneBarCallerDetailsContainer/PhoneBarCallerDetailsContainer'
import PhoneInfobarWrapper from 'pages/common/components/PhoneIntegrationBar/PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneIntegrationName from 'pages/common/components/PhoneIntegrationBar/PhoneIntegrationName/PhoneIntegrationName'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'

import PhoneBarContainer from '../PhoneBarContainer/PhoneBarContainer'
import PhoneBarInnerContent from '../PhoneBarInnerContent/PhoneBarInnerContent'

import css from './MonitoringPhoneCall.less'

type Props = {
    call: Call
}

export default function MonitoringPhoneCall({ call }: Props): JSX.Element {
    const applyCallBarRestyling = useFlag(FeatureFlagKey.CallBarRestyling)

    const {
        integrationId,
        inCallAgentId: startingInCallAgentId,
        customerId,
        customerPhoneNumber,
    } = extractMonitoringCallParams(call)

    const monitoringCallSid = call.parameters.CallSid

    const [inCallAgentId, setInCallAgentId] = useState(startingInCallAgentId)
    const [isWhispering, setIsWhispering] = useState(false)

    const notify = useNotify()

    const { mutate: handleCallWhispering, isLoading } = useHandleCallWhispering(
        {
            mutation: {
                onSuccess: (_response, { data }) => {
                    setIsWhispering(data.whisper)
                },
                onError: () => {
                    const verb = isWhispering ? 'stop' : 'start'
                    notify.error(
                        `Failed to ${verb} whispering. Please try again.`,
                    )
                },
            },
        },
    )

    useCallMessageListener(call, (twilioMessage) => {
        if (twilioMessage.type === TwilioMessageType.InCallAgentChanged) {
            setInCallAgentId(parseInt(twilioMessage.data.agent_id, 10))
        }
    })

    const audioLevel = useAudioLevel(call)

    return (
        <PhoneBarContainer>
            <PhoneBarInnerContent>
                <PhoneBarCallerDetailsContainer>
                    <Box gap="xs" alignItems="center">
                        {integrationId && (
                            <PhoneIntegrationName
                                integrationId={integrationId}
                            />
                        )}
                        {customerId ? (
                            <VoiceCallCustomerLabel
                                customerId={customerId}
                                phoneNumber={customerPhoneNumber}
                                showBothNameAndPhone
                            />
                        ) : (
                            <span>
                                <b>{customerPhoneNumber}</b>
                            </span>
                        )}
                        <span>and</span>
                        {inCallAgentId ? (
                            <VoiceCallAgentLabel
                                agentId={inCallAgentId}
                                semibold
                                className={css.phoneBarAgentLabel}
                            />
                        ) : (
                            <span>unknown agent</span>
                        )}
                    </Box>
                </PhoneBarCallerDetailsContainer>
                <Box display="flex" alignItems="center" gap="sm">
                    <Button
                        intent="destructive"
                        leadingSlot="headset"
                        onClick={() => call.disconnect()}
                    >
                        Stop Listening
                    </Button>
                    <Tooltip
                        trigger={
                            <DynamicSoundWaveIcon
                                audioLevel={isWhispering ? audioLevel : 0}
                                hide={!isWhispering}
                            >
                                <Button
                                    variant="secondary"
                                    icon={
                                        isWhispering
                                            ? 'user-mute'
                                            : 'user-voice'
                                    }
                                    onClick={() => {
                                        handleCallWhispering({
                                            data: {
                                                monitoring_call_sid:
                                                    monitoringCallSid,
                                                whisper: !isWhispering,
                                            },
                                        })
                                    }}
                                    isLoading={isLoading}
                                >
                                    {isWhispering
                                        ? 'Stop whispering'
                                        : 'Whisper to agent'}
                                </Button>
                            </DynamicSoundWaveIcon>
                        }
                    >
                        <TooltipContent
                            title={
                                isWhispering
                                    ? 'Stop whispering'
                                    : 'Whisper to agent'
                            }
                        />
                    </Tooltip>
                </Box>
            </PhoneBarInnerContent>
            <PhoneInfobarWrapper>
                {applyCallBarRestyling ? (
                    <Text variant="bold">Connected</Text>
                ) : (
                    <span>Connected</span>
                )}
            </PhoneInfobarWrapper>
        </PhoneBarContainer>
    )
}
