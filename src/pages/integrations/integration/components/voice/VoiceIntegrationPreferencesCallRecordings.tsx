import classNames from 'classnames'
import React from 'react'
import {Label} from 'reactstrap'

import {PhoneIntegrationPreferences} from 'models/integration/types'
import ToggleInput from 'pages/common/forms/ToggleInput'
import settingsCss from 'pages/settings/settings.less'

import css from './VoiceIntegrationPreferences.less'

type Props = {
    preferences: PhoneIntegrationPreferences
    onPreferencesChange: (
        preferences: Partial<PhoneIntegrationPreferences>
    ) => void
}

export default function VoiceIntegrationPreferencesCallRecordings({
    preferences,
    onPreferencesChange,
}: Props): JSX.Element {
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
                <p>Automatically record and store all customer calls</p>
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
        </div>
    )
}
