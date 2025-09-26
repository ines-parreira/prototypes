import React from 'react'

import { useFormContext } from 'react-hook-form'

import { Label, ToggleField } from '@gorgias/axiom'
import { UpdateAllPhoneIntegrationSettings } from '@gorgias/helpdesk-queries'
import { CustomRecordingType } from '@gorgias/helpdesk-types'

import { FormField } from 'core/forms'
import { RECORDING_NOTIFICATION_MAX_DURATION } from 'models/integration/constants'

import DEPRECATED_VoiceMessageField from './DEPRECATED_VoiceMessageField'

import css from './VoiceIntegrationSettingCallRecording.less'

function VoiceIntegrationSettingCallRecording_DEPRECATED() {
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
                            field={DEPRECATED_VoiceMessageField}
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

export default VoiceIntegrationSettingCallRecording_DEPRECATED
