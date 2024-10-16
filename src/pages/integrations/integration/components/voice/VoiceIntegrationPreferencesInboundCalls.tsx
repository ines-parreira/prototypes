import React from 'react'
import {FormGroup, Label} from 'reactstrap'

import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    PhoneIntegrationPreferences,
    PhoneRingingBehaviour,
} from 'models/integration/types'
import CheckBox from 'pages/common/forms/CheckBox'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'

import {FeatureFlagKey} from 'config/featureFlags'
import settingsCss from 'pages/settings/settings.less'
import InputField from 'pages/common/forms/input/InputField'
import {HintTooltip} from 'pages/stats/common/HintTooltip'
import VoiceIntegrationPreferencesTeamSelect from './VoiceIntegrationPreferencesTeamSelect'
import css from './VoiceIntegrationPreferences.less'

type Props = {
    isIvr: boolean
    preferences: PhoneIntegrationPreferences
    onPreferencesChange: (
        preferences: Partial<PhoneIntegrationPreferences>
    ) => void
    phoneTeamId: Maybe<number | undefined>
    onPhoneTeamIdChange: (teamId: number | null) => void
    errors: Record<string, string>
}

export default function VoiceIntegrationPreferencesInboundCalls({
    isIvr,
    preferences,
    onPreferencesChange,
    phoneTeamId,
    onPhoneTeamIdChange,
    errors,
}: Props): JSX.Element {
    const useCallRecordings: boolean | undefined =
        useFlags()[FeatureFlagKey.RecordingTranscriptions]
    const showCustomizableAgentRingTime: boolean | undefined =
        useFlags()[FeatureFlagKey.CustomizableAgentRingTime]

    return (
        <>
            <h2
                className={classNames(
                    settingsCss.headingSection,
                    css.sectionHeader
                )}
            >
                Inbound calls
            </h2>
            {!isIvr && (
                <>
                    <div>
                        <Label className="control-label">
                            Route the call to a team
                        </Label>
                        <VoiceIntegrationPreferencesTeamSelect
                            value={phoneTeamId}
                            onChange={(teamId) => onPhoneTeamIdChange(teamId)}
                        />
                    </div>
                    <div>
                        <Label className="control-label">
                            Set ringing behaviour
                        </Label>
                        <RadioFieldSet
                            options={[
                                {
                                    label: 'Round-robin ringing',
                                    value: PhoneRingingBehaviour.RoundRobin,
                                    caption:
                                        'Calls ring available agents one-by-one, ordered by the time since an agent last received a call.',
                                },
                                {
                                    label: 'Broadcast ringing',
                                    value: PhoneRingingBehaviour.Broadcast,
                                    caption:
                                        'Calls ring all available agents simultaneously. ',
                                },
                            ]}
                            onChange={(value) =>
                                onPreferencesChange({
                                    ringing_behaviour:
                                        value as PhoneRingingBehaviour,
                                })
                            }
                            selectedValue={preferences.ringing_behaviour}
                        />
                    </div>
                    {showCustomizableAgentRingTime && (
                        <div>
                            <InputField
                                label={
                                    <>
                                        <span>Ring Time</span>
                                        <HintTooltip title="The time in seconds we ring each individual agent before moving to the next one." />
                                    </>
                                }
                                type="number"
                                value={preferences.ring_time ?? 60}
                                onChange={(value) =>
                                    onPreferencesChange({
                                        ring_time: Number(value),
                                    })
                                }
                                caption="Set a time between 10 and 600 seconds (10 minutes)."
                                error={errors?.ring_time}
                            />
                        </div>
                    )}
                </>
            )}
            <div>
                <Label className="control-label">Other settings</Label>
                {!isIvr && !useCallRecordings && (
                    <FormGroup>
                        <CheckBox
                            isChecked={preferences.record_inbound_calls}
                            onChange={(value) =>
                                onPreferencesChange({
                                    record_inbound_calls: value,
                                })
                            }
                        >
                            Start recording automatically
                        </CheckBox>
                    </FormGroup>
                )}
                <CheckBox
                    isChecked={preferences.voicemail_outside_business_hours}
                    onChange={(value) =>
                        onPreferencesChange({
                            voicemail_outside_business_hours: value,
                        })
                    }
                    caption="If a customer calls outside of
                                                    business hours, they will be
                                                    immediately forwarded to voicemail."
                >
                    Send calls to voicemail outside business hours
                </CheckBox>
            </div>
        </>
    )
}
