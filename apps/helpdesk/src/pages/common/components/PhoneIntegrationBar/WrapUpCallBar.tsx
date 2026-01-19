import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Button, LegacyButton } from '@gorgias/axiom'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useWrapUpTime from 'pages/common/components/PhoneIntegrationBar/useWrapUpTime'

import ActiveWrapUpCallBar from './ActiveWrapUpCallBar'
import PhoneBarInnerContent from './PhoneBarInnerContent/PhoneBarInnerContent'
import PhoneInfobarWrapper from './PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneIntegrationName from './PhoneIntegrationName/PhoneIntegrationName'

export default function WrapUpCallBar() {
    const { call } = useVoiceDevice()
    const applyCallBarRestyling = useFlag(FeatureFlagKey.CallBarRestyling)

    const {
        isWrappingUp,
        timeLeft,
        voiceCall,
        endWrapUpTimeMutation,
        clearWrapUpTime,
    } = useWrapUpTime()

    if (call || !isWrappingUp || !voiceCall) {
        return null
    }

    return (
        <ActiveWrapUpCallBar
            clearWrapUpTime={clearWrapUpTime}
            callId={voiceCall.id}
        >
            <PhoneBarInnerContent>
                {voiceCall && (
                    <PhoneIntegrationName
                        integrationId={voiceCall?.integration_id}
                    />
                )}
                {applyCallBarRestyling ? (
                    <Button
                        variant="secondary"
                        onClick={() => {
                            endWrapUpTimeMutation.mutate({
                                data: {
                                    call_sid: voiceCall.external_id,
                                },
                            })
                        }}
                        isLoading={endWrapUpTimeMutation.isLoading}
                        leadingSlot="comm-phone-end"
                    >
                        End wrap-up time
                    </Button>
                ) : (
                    <LegacyButton
                        intent="secondary"
                        onClick={() => {
                            endWrapUpTimeMutation.mutate({
                                data: {
                                    call_sid: voiceCall.external_id,
                                },
                            })
                        }}
                        isLoading={endWrapUpTimeMutation.isLoading}
                    >
                        End wrap-up time
                    </LegacyButton>
                )}
            </PhoneBarInnerContent>
            <PhoneInfobarWrapper>
                <strong>Post call wrap-up</strong>
                <div>{timeLeft}</div>
            </PhoneInfobarWrapper>
        </ActiveWrapUpCallBar>
    )
}
