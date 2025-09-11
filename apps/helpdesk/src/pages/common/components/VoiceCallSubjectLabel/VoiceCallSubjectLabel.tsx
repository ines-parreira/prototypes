import { VoiceCallSubject, VoiceCallSubjectType } from 'models/voiceCall/types'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import { VoiceCallQueueLabel } from 'pages/common/components/VoiceCallQueueLabel/VoiceCallQueueLabel'

type VoiceCallSubjectLabelProps = {
    subject: VoiceCallSubject
}

const VoiceCallSubjectLabel = ({ subject }: VoiceCallSubjectLabelProps) => {
    if (subject.type === VoiceCallSubjectType.Agent) {
        return <VoiceCallAgentLabel agentId={subject.id} semibold />
    }
    if (subject.type === VoiceCallSubjectType.External) {
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
    }
    if (subject.type === VoiceCallSubjectType.Queue) {
        return <VoiceCallQueueLabel queueId={subject.id} />
    }

    return <span className="body-semibold">Unknown</span>
}

export default VoiceCallSubjectLabel
