import { Text } from '@gorgias/axiom'

import { formatPhoneNumberInternational } from '../../../models/phoneFormatting'
import type { VoiceCallSubject } from '../../../models/types'
import { VoiceCallSubjectType } from '../../../models/types'
import { VoiceCallAgentLabel } from './VoiceCallAgentLabel'
import { VoiceCallCustomerLabel } from './VoiceCallCustomerLabel'
import { VoiceCallQueueLabel } from './VoiceCallQueueLabel'

type VoiceCallSubjectLabelProps = {
    subject: VoiceCallSubject
    size?: 'sm'
}

export function VoiceCallSubjectLabel({
    subject,
    size,
}: VoiceCallSubjectLabelProps) {
    switch (subject.type) {
        case VoiceCallSubjectType.Agent:
            return <VoiceCallAgentLabel agentId={subject.id} size={size} />
        case VoiceCallSubjectType.External:
            if (subject.customer?.id) {
                return (
                    <VoiceCallCustomerLabel
                        customerId={subject.customer.id}
                        phoneNumber={subject.value}
                        size={size}
                    />
                )
            }
            return (
                <Text as="span" variant="bold" size={size}>
                    {formatPhoneNumberInternational(subject.value)}
                </Text>
            )
        case VoiceCallSubjectType.Queue:
            return <VoiceCallQueueLabel queueId={subject.id} size={size} />
        case VoiceCallSubjectType.IvrMenuOption:
            return (
                <Text as="span" variant="bold" size={size}>
                    IVR Option {subject.digit}
                </Text>
            )
        default:
            return (
                <Text as="span" size={size}>
                    Unknown
                </Text>
            )
    }
}
