import { useState } from 'react'

import { Call } from '@twilio/voice-sdk'

import { Button } from '@gorgias/axiom'

import { extractMonitoringCallParams } from 'hooks/integrations/phone/monitoring.utils'
import { useCallMessageListener } from 'hooks/integrations/phone/useCallMessageListener'
import { TwilioMessageType } from 'models/voiceCall/twilioMessageTypes'
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
    const {
        integrationId,
        inCallAgentId: startingInCallAgentId,
        customerId,
        customerPhoneNumber,
    } = extractMonitoringCallParams(call)

    const [inCallAgentId, setInCallAgentId] = useState(startingInCallAgentId)

    useCallMessageListener(call, (twilioMessage) => {
        if (twilioMessage.type === TwilioMessageType.InCallAgentChanged) {
            setInCallAgentId(parseInt(twilioMessage.data.agent_id, 10))
        }
    })

    return (
        <PhoneBarContainer>
            <PhoneBarInnerContent>
                <PhoneBarCallerDetailsContainer>
                    {integrationId && (
                        <PhoneIntegrationName integrationId={integrationId} />
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
                </PhoneBarCallerDetailsContainer>
                <Button
                    intent="destructive"
                    leadingSlot="headset_mic"
                    onClick={() => call.disconnect()}
                >
                    Stop Listening
                </Button>
            </PhoneBarInnerContent>
            <PhoneInfobarWrapper>
                <span>Connected</span>
            </PhoneInfobarWrapper>
        </PhoneBarContainer>
    )
}
