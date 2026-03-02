import css from 'domains/reporting/pages/voice/components/VoiceCallTransferActivity/VoiceCallTransferActivity.less'
import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { getTransferTargetVoiceCallSubject } from 'models/voiceCall/utils'
import VoiceCallSubjectLabel from 'pages/common/components/VoiceCallSubjectLabel/VoiceCallSubjectLabel'

type Props = {
    voiceCall: VoiceCallSummary
}

const VoiceCallTransferActivity = ({ voiceCall }: Props) => {
    const voiceCallSubject = getTransferTargetVoiceCallSubject(voiceCall)

    return (
        <div className={css.container}>
            <i className="material-icons">arrow_forward</i>
            &nbsp;Transferred to&nbsp;
            {voiceCallSubject ? (
                <VoiceCallSubjectLabel subject={voiceCallSubject} />
            ) : (
                'Unknown'
            )}
        </div>
    )
}

export default VoiceCallTransferActivity
