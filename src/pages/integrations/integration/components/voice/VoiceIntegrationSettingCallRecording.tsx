import { useFormContext } from 'react-hook-form'

import { UpdateAllPhoneIntegrationSettings } from '@gorgias/helpdesk-queries'
import { CustomRecordingType } from '@gorgias/helpdesk-types'
import { Label, ToggleField } from '@gorgias/merchant-ui-kit'

import { FormField } from 'core/forms'
import { RECORDING_NOTIFICATION_MAX_DURATION } from 'models/integration/constants'

import VoiceMessageField from './VoiceMessageField'

import css from './VoiceIntegrationSettingCallRecording.less'

function VoiceIntegrationSettingCallRecording() {
    const { watch } = useFormContext<UpdateAllPhoneIntegrationSettings>()
    const [isRecordingInboundCalls, isRecordingOutboundCalls] = watch([
        'meta.preferences.record_inbound_calls',
        'meta.preferences.record_outbound_calls',
    ])

    const isCustomRecordingNotificationEnabled =
        isRecordingInboundCalls || isRecordingOutboundCalls

    return (
        <div className={css.container}>
            <div className={css.sectionData}>
                <FormField
                    field={ToggleField}
                    name="meta.preferences.record_outbound_calls"
                    label="Outbound calls"
                />
                <FormField
                    field={ToggleField}
                    name="meta.preferences.record_inbound_calls"
                    label="Inbound calls"
                />
            </div>
            {isCustomRecordingNotificationEnabled && (
                <div className={css.sectionData}>
                    <Label>Call recording notification</Label>
                    <div>
                        <FormField
                            field={VoiceMessageField}
                            name="meta.recording_notification"
                            allowNone
                            maxRecordingDuration={
                                RECORDING_NOTIFICATION_MAX_DURATION
                            }
                            horizontal={true}
                            shouldUpload={true}
                            customRecordingType={
                                CustomRecordingType.CallRecordingNotification
                            }
                            radioButtonId="call_recording_notification"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default VoiceIntegrationSettingCallRecording
