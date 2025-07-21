import VoiceQueueSettingsFormCallFlowSection from './VoiceQueueSettingsFormCallFlowSection'
import VoiceQueueSettingsFormGeneralSection from './VoiceQueueSettingsFormGeneralSection'

import css from './CreateEditQueueModalFormContent.less'

export default function CreateEditQueueModalFormContent() {
    return (
        <div className={css.container}>
            <VoiceQueueSettingsFormGeneralSection />
            <VoiceQueueSettingsFormCallFlowSection />
        </div>
    )
}
