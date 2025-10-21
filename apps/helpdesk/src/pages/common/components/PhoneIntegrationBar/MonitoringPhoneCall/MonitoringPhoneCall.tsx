import { Call } from '@twilio/voice-sdk'

import { LegacyButton as Button } from '@gorgias/axiom'

import { extractMonitoringCallParams } from 'hooks/integrations/phone/utils'
import PhoneBarCallerDetailsContainer from 'pages/common/components/PhoneIntegrationBar/PhoneBarCallerDetailsContainer/PhoneBarCallerDetailsContainer'
import PhoneInfobarWrapper from 'pages/common/components/PhoneIntegrationBar/PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneIntegrationName from 'pages/common/components/PhoneIntegrationBar/PhoneIntegrationName/PhoneIntegrationName'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'

import PhoneBarContainer from '../PhoneBarContainer/PhoneBarContainer'
import PhoneBarInnerContent from '../PhoneBarInnerContent/PhoneBarInnerContent'

type Props = {
    call: Call
}

export default function MonitoringPhoneCall({ call }: Props): JSX.Element {
    const { integrationId, inCallAgentId, customerId, customerPhoneNumber } =
        extractMonitoringCallParams(call)

    return (
        <PhoneBarContainer>
            <PhoneBarInnerContent>
                <PhoneBarCallerDetailsContainer>
                    <PhoneIntegrationName integrationId={integrationId} />
                    <VoiceCallCustomerLabel
                        customerId={customerId}
                        phoneNumber={customerPhoneNumber}
                        showBothNameAndPhone
                    />
                    <span>and</span>
                    <VoiceCallAgentLabel agentId={inCallAgentId} semibold />
                </PhoneBarCallerDetailsContainer>
                <Button
                    intent="destructive"
                    leadingSlot="headset_mic"
                    onPress={() => call.disconnect()}
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
