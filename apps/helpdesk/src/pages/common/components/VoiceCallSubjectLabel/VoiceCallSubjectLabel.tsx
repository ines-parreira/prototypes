import { VoiceCallSubject, VoiceCallSubjectType } from 'models/voiceCall/types'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import { VoiceCallQueueLabel } from 'pages/common/components/VoiceCallQueueLabel/VoiceCallQueueLabel'

type VoiceCallSubjectLabelProps = {
    subject: VoiceCallSubject
}

const VoiceCallSubjectLabel = ({ subject }: VoiceCallSubjectLabelProps) => {
    switch (subject.type) {
        case VoiceCallSubjectType.Agent:
            return <VoiceCallAgentLabel agentId={subject.id} semibold />

        case VoiceCallSubjectType.External:
            if (!subject.customer) {
                return <span className="body-semibold">{subject.value}</span>
            }
            return (
                <VoiceCallCustomerLabel
                    customerId={subject.customer.id}
                    customerName={subject.customer.name}
                    phoneNumber={subject.value}
                    showBothNameAndPhone
                />
            )

        case VoiceCallSubjectType.Queue:
            return <VoiceCallQueueLabel queueId={subject.id} />

        case VoiceCallSubjectType.IvrMenuOption:
            return (
                <span className={'body-semibold'}>
                    IVR Option {subject.digit}
                </span>
            )

        default:
            return <span className="body-semibold">Unknown</span>
    }
}

export default VoiceCallSubjectLabel
