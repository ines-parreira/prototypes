import { Text } from '@gorgias/axiom'
import type { VoiceCall } from '@gorgias/helpdesk-queries'

import { useVoiceCallCustomer } from '../hooks/useVoiceCallCustomer'
import { formatPhoneNumberInternational } from '../models/phoneFormatting'
import { isFinalVoiceCallStatus } from '../models/utils'
import { VoiceCallContainer } from './VoiceCallContainer'
import { VoiceCallCustomerLabel } from './VoiceCallCustomerLabel'
import { VoiceCallInboundStatus } from './VoiceCallInboundStatus'

type VoiceCallInboundProps = {
    voiceCall: VoiceCall
    renderMonitorCallButton?: (voiceCall: VoiceCall) => React.ReactNode
}

export function VoiceCallInbound({
    voiceCall,
    renderMonitorCallButton,
}: VoiceCallInboundProps) {
    const { customer } = useVoiceCallCustomer(voiceCall.customer_id ?? 0)
    const customerName =
        customer?.name ||
        customer?.email ||
        formatPhoneNumberInternational(voiceCall.phone_number_source)

    return (
        <VoiceCallContainer
            dateTime={voiceCall.created_datetime}
            avatarName={customerName}
            header={
                <>
                    <VoiceCallCustomerLabel
                        customerId={voiceCall.customer_id ?? 0}
                        phoneNumber={voiceCall.phone_number_source}
                    />
                    <Text as="span" color="content-neutral-secondary">
                        {isFinalVoiceCallStatus(voiceCall.status)
                            ? 'called'
                            : 'is calling'}
                    </Text>
                </>
            }
            directionIcon="arrow-down-left"
            callStatus={<VoiceCallInboundStatus voiceCall={voiceCall} />}
            voiceCall={voiceCall}
            renderMonitorCallButton={renderMonitorCallButton}
        />
    )
}
