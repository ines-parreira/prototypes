import { Button } from '@gorgias/merchant-ui-kit'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useWrapUpTime from 'pages/common/components/PhoneIntegrationBar/useWrapUpTime'

import ActiveWrapUpCallBar from './ActiveWrapUpCallBar'
import PhoneBarInnerContent from './PhoneBarInnerContent/PhoneBarInnerContent'
import PhoneInfobarWrapper from './PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneIntegrationName from './PhoneIntegrationName/PhoneIntegrationName'

export default function WrapUpCallBar() {
    const { call } = useVoiceDevice()
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
                <Button
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
                </Button>
            </PhoneBarInnerContent>
            <PhoneInfobarWrapper>
                <strong>Post call wrap-up</strong>
                <div>{timeLeft}</div>
            </PhoneInfobarWrapper>
        </ActiveWrapUpCallBar>
    )
}
