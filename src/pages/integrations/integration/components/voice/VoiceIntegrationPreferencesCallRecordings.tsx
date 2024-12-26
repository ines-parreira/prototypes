import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Label} from 'reactstrap'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    PhoneIntegrationPreferences,
    VoiceMessage,
} from 'models/integration/types'
import ToggleInput from 'pages/common/forms/ToggleInput'
import settingsCss from 'pages/settings/settings.less'

import css from './VoiceIntegrationPreferences.less'
import VoiceMessageField from './VoiceMessageField'

type Props = {
    preferences: PhoneIntegrationPreferences
    onPreferencesChange: (
        preferences: Partial<PhoneIntegrationPreferences>
    ) => void
    recordingNotification: VoiceMessage
    onRecordingNotificationChange: (message: VoiceMessage) => void
}

export default function VoiceIntegrationPreferencesCallRecordings({
    preferences,
    onPreferencesChange,
    recordingNotification,
    onRecordingNotificationChange,
}: Props): JSX.Element {
    const showCustomRecordingNotificationSection: boolean | undefined =
        useFlags()[FeatureFlagKey.CustomRecordingNotification]

    return (
        <div className={css.callRecordingFormSection}>
            <div>
                <h2
                    className={classNames(
                        settingsCss.headingSection,
                        css.sectionHeader
                    )}
                >
                    Call Recording
                </h2>
                <p>Automatically record and store all customer calls.</p>
            </div>
            <div>
                <Label className="control-label">Inbound calls</Label>
                <ToggleInput
                    isToggled={preferences.record_inbound_calls}
                    onClick={(value) =>
                        onPreferencesChange({
                            ...preferences,
                            record_inbound_calls: value,
                        })
                    }
                >
                    Start recording automatically
                </ToggleInput>
            </div>
            <div>
                <Label className="control-label">Outbound calls</Label>
                <ToggleInput
                    isToggled={preferences.record_outbound_calls}
                    onClick={(value) =>
                        onPreferencesChange({
                            ...preferences,
                            record_outbound_calls: value,
                        })
                    }
                >
                    Start recording automatically
                </ToggleInput>
            </div>
            {showCustomRecordingNotificationSection && (
                <div>
                    <Label className="control-label">
                        Call recording notifications
                    </Label>
                    <VoiceMessageField
                        value={recordingNotification}
                        onChange={onRecordingNotificationChange}
                        allowNone
                        horizontal={true}
                        isDisabled={
                            !preferences.record_inbound_calls &&
                            !preferences.record_outbound_calls
                        }
                    />
                </div>
            )}
        </div>
    )
}
