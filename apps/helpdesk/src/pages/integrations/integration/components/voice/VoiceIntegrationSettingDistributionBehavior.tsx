import type { UpdateAllPhoneIntegrationSettings } from '@gorgias/helpdesk-queries'

import { FormField, useFormContext } from 'core/forms'
import CheckBoxField from 'pages/common/forms/CheckBoxField'
import PreviewRadioFieldSet from 'pages/common/forms/PreviewRadioFieldSet'

import VoiceQueueSelectField from './VoiceQueueSelectField'
import VoiceQueueSummary from './VoiceQueueSummary'

import css from './VoiceIntegrationSettingDistributionBehavior.less'

type VoiceIntegrationSettingDistributionBehaviorProps = {
    showVoicemailOutsideBusinessHours?: boolean
}

function VoiceIntegrationSettingDistributionBehavior({
    showVoicemailOutsideBusinessHours = true,
}: VoiceIntegrationSettingDistributionBehaviorProps) {
    const { watch } = useFormContext<UpdateAllPhoneIntegrationSettings>()
    const [send_calls_to_voicemail, queue_id] = watch([
        'meta.send_calls_to_voicemail',
        'meta.queue_id',
    ])

    return (
        <div className={css.container}>
            <FormField
                field={PreviewRadioFieldSet}
                name="meta.send_calls_to_voicemail"
                inputTransform={(value: boolean) =>
                    value ? 'send_calls_to_voicemail' : 'ring_agents'
                }
                outputTransform={(value) => value === 'send_calls_to_voicemail'}
                options={[
                    {
                        label: 'Ring to agents or teams',
                        caption:
                            'Route calls to a queue to ensure they reach the right agents or teams.',
                        value: 'ring_agents',
                    },
                    {
                        label: 'Send calls directly to voicemail',
                        caption:
                            'Calls will go directly to voicemail without ringing any agents or teams.',
                        value: 'send_calls_to_voicemail',
                    },
                ]}
            />
            {!send_calls_to_voicemail && (
                <div className={css.sectionData}>
                    <div className={css.queueInfo}>
                        <FormField
                            field={VoiceQueueSelectField}
                            name="meta.queue_id"
                        />
                        {queue_id && <VoiceQueueSummary queue_id={queue_id} />}
                    </div>
                    {showVoicemailOutsideBusinessHours && (
                        <FormField
                            name="meta.preferences.voicemail_outside_business_hours"
                            field={CheckBoxField}
                            label="Send calls to voicemail outside business hours"
                            caption="If a customer calls outside of business hours, they will be immediately forwarded to voicemail."
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default VoiceIntegrationSettingDistributionBehavior
