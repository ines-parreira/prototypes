import { ReactNode } from 'react'

import { useFormContext } from 'react-hook-form'

import { Banner, Box } from '@gorgias/axiom'
import { UpdateAllPhoneIntegrationSettings } from '@gorgias/helpdesk-queries'
import { CustomRecordingType } from '@gorgias/helpdesk-types'

import { FormField } from 'core/forms'
import { RECORDING_NOTIFICATION_MAX_DURATION } from 'models/integration/constants'
import NewToggleField from 'pages/common/forms/NewToggleField'

import { CALL_RECORDING_NOTIFICATION_LEARN_MORE_URL } from './constants'
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
                    <CallRecordingNotificationBanner>
                        {`We recommend you include the call recording notification in your welcome message, which you can configure in the integration's `}
                        <a
                            href={`/app/settings/channels/phone/${integrationId}/flow`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Call Flow
                        </a>
                        {` tab.`}
                    </CallRecordingNotificationBanner>
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
                        caption="Gorgias is not responsible for ensuring compliance with applicable privacy laws. It is your responsibility to implement privacy policies."
                        noneValueAlertBanner={
                            <CallRecordingNotificationBanner>{`No call recording message is currently selected for outbound calls. To help ensure compliance, we recommend adding a notification to inform callers that calls are being recorded.`}</CallRecordingNotificationBanner>
                        }
                    />
                )}
            </div>
        </>
    )
}

export default VoiceIntegrationSettingCallRecording

const CallRecordingNotificationBanner = ({
    children,
}: {
    children: ReactNode
}) => {
    return (
        <Banner type="warning">
            <Box alignItems="center" gap="sm">
                <div>{children}</div>
                <Box flexShrink={0}>
                    <a
                        href={CALL_RECORDING_NOTIFICATION_LEARN_MORE_URL}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Learn more
                    </a>
                </Box>
            </Box>
        </Banner>
    )
}
