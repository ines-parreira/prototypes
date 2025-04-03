import { VoiceQueue } from '@gorgias/api-client'

import VoiceQueueSettingsFormCallFlowSection from './VoiceQueueSettingsFormCallFlowSection'
import VoiceQueueSettingsFormGeneralSection from './VoiceQueueSettingsFormGeneralSection'
import VoiceQueueSettingsLinkedIntegrations from './VoiceQueueSettingsLinkedIntegrations'

import css from './VoiceQueueEditOrCreateForm.less'

type VoiceQueueEditOrCreateFormProps = {
    queue?: VoiceQueue
}

export default function VoiceQueueEditOrCreateForm({
    queue,
}: VoiceQueueEditOrCreateFormProps) {
    return (
        <div className={css.container}>
            <div className={css.section}>
                <h2>General</h2>
                <VoiceQueueSettingsFormGeneralSection />
            </div>
            {!!queue?.integrations?.length && (
                <div className={css.section}>
                    <VoiceQueueSettingsLinkedIntegrations
                        integrations={queue.integrations}
                    />
                </div>
            )}
            <div className={css.section}>
                <div>
                    <h2>Routing options</h2>
                    <p className={css.sectionDescription}>
                        Configure the incoming call flow
                    </p>
                </div>
                <VoiceQueueSettingsFormCallFlowSection />
            </div>
        </div>
    )
}
