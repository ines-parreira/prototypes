import { useFormContext } from 'react-hook-form'

import { Banner } from '@gorgias/axiom'
import { UpdateAllPhoneIntegrationSettings } from '@gorgias/helpdesk-queries'
import { CustomRecordingType } from '@gorgias/helpdesk-types'

import { FormField } from 'core/forms'
import { RECORDING_NOTIFICATION_MAX_DURATION } from 'models/integration/constants'
import NewToggleField from 'pages/common/forms/NewToggleField'

import VoiceMessageField from './VoiceMessageField'

import css from './VoiceIntegrationSettingCallRecording.less'

function VoiceIntegrationSettingCallRecording({
    integrationId,
}: {
    integrationId: number
}) {
    const { watch } = useFormContext<UpdateAllPhoneIntegrationSettings>()
    const [isRecordingInboundCalls, isRecordingOutboundCalls] = watch([
        'meta.preferences.record_inbound_calls',
        'meta.preferences.record_outbound_calls',
    ])

    return (
        <>
            <div className={css.section}>
                <FormField
                    field={NewToggleField}
                    name="meta.preferences.record_inbound_calls"
                    label="Inbound calls"
                />
                {isRecordingInboundCalls && (
                    <Banner type="warning">
                        We recommend you include the call recording notification
                        in your welcome message, which you can configure in the{' '}
                        <a
                            href={`/app/settings/channels/phone/${integrationId}/flow`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Call Flow
                        </a>{' '}
                        tab.
                    </Banner>
                )}
            </div>
            <div className={css.container}>
                <FormField
                    field={NewToggleField}
                    name="meta.preferences.record_outbound_calls"
                    label="Outbound calls"
                />

                {isRecordingOutboundCalls && (
                    <FormField
                        field={VoiceMessageField}
                        label={'Call recording notification'}
                        name="meta.recording_notification"
                        allowNone
                        maxRecordingDuration={
                            RECORDING_NOTIFICATION_MAX_DURATION
                        }
                        customRecordingType={
                            CustomRecordingType.CallRecordingNotification
                        }
                    />
                )}
            </div>
        </>
    )
}

export default VoiceIntegrationSettingCallRecording
