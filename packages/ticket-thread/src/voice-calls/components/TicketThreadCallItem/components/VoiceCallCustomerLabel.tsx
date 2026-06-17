import { Text } from '@gorgias/axiom'

import { useVoiceCallCustomer } from '#voice-calls/hooks/useVoiceCallCustomer'
import { formatPhoneNumberInternational } from '#voice-calls/models/phoneFormatting'

type VoiceCallCustomerLabelProps = {
    customerId: number
    phoneNumber?: string
    size?: 'sm'
}

export function VoiceCallCustomerLabel({
    customerId,
    phoneNumber,
    size,
}: VoiceCallCustomerLabelProps) {
    const { customer } = useVoiceCallCustomer(customerId)

    const customerName = customer?.name || customer?.email
    if (customerName) {
        return (
            <Text as="span" variant="bold" size={size}>
                {customerName}
            </Text>
        )
    }

    if (phoneNumber) {
        return (
            <Text as="span" variant="bold" size={size}>
                {formatPhoneNumberInternational(phoneNumber)}
            </Text>
        )
    }

    return (
        <Text as="span" variant="bold" size={size}>
            Customer #{customerId}
        </Text>
    )
}
