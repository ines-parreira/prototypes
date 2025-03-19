import VoiceQueueSettingsFormCallFlowSection from './VoiceQueueSettingsFormCallFlowSection'
import VoiceQueueSettingsFormGeneralSection from './VoiceQueueSettingsFormGeneralSection'

import css from './VoiceQueueEditOrCreateForm.less'

export default function VoiceQueueEditOrCreateForm() {
    return (
        <div className={css.container}>
            <div className={css.section}>
                <h2>General</h2>
                <VoiceQueueSettingsFormGeneralSection />
            </div>
            <div className={css.section}>
                <div>
                    <h2>Call flow</h2>
                    <p className={css.sectionDescription}>
                        Configure the incoming call flow
                    </p>
                </div>
                <VoiceQueueSettingsFormCallFlowSection />
            </div>
        </div>
    )
}
