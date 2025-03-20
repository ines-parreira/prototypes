import { useFormContext } from 'react-hook-form'

import { UpdateAllPhoneIntegrationSettings } from '@gorgias/api-queries'
import { CustomRecordingType } from '@gorgias/api-types'
import { Label } from '@gorgias/merchant-ui-kit'

import { FormField } from 'core/forms'
import ToggleInputField from 'pages/common/forms/ToggleInputField'

import { formVoiceMessageValidation } from './hooks/useVoiceMessageValidation'
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
                    field={ToggleInputField}
                    name="meta.preferences.record_outbound_calls"
                >
                    Outbound calls
                </FormField>
                <FormField
                    field={ToggleInputField}
                    name="meta.preferences.record_inbound_calls"
                >
                    Inbound calls
                </FormField>
            </div>
            {isCustomRecordingNotificationEnabled && (
                <div className={css.sectionData}>
                    <Label>Call recording notification</Label>
                    <div>
                        <FormField
                            field={VoiceMessageField}
                            name="meta.recording_notification"
                            allowNone
                            horizontal={true}
                            shouldUpload={true}
                            customRecordingType={
                                CustomRecordingType.CallRecordingNotification
                            }
                            validation={formVoiceMessageValidation}
                            radioButtonId="call_recording_notification"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default VoiceIntegrationSettingCallRecording
