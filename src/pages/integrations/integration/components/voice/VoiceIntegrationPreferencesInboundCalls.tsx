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
import ToggleInput from 'pages/common/forms/ToggleInput'
import VoiceIntegrationPreferencesTeamSelect from './VoiceIntegrationPreferencesTeamSelect'
import css from './VoiceIntegrationPreferences.less'
import {
    RING_TIME_DEFAULT_VALUE,
    RING_TIME_MAX_VALUE,
    RING_TIME_MIN_VALUE,
    WAIT_TIME_DEFAULT_ENABLED,
    WAIT_TIME_DEFAULT_VALUE,
    WAIT_TIME_MAX_VALUE,
    WAIT_TIME_MIN_VALUE,
} from './constants'

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
    const showCustomizableWaitTime: boolean | undefined =
        useFlags()[FeatureFlagKey.CustomizableWaitTime]

    const preferencesRingTime = preferences.ring_time ?? RING_TIME_DEFAULT_VALUE
    const preferencesWaitTimeValue =
        preferences.wait_time?.value ?? WAIT_TIME_DEFAULT_VALUE
    const preferencesWaitTimeEnabled =
        preferences.wait_time?.enabled ?? WAIT_TIME_DEFAULT_ENABLED

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
                                value={preferencesRingTime}
                                onChange={(value) =>
                                    onPreferencesChange({
                                        ring_time:
                                            value === ''
                                                ? Number.NaN
                                                : Number(value),
                                    })
                                }
                                caption="Set a time between 10 and 600 seconds (10 minutes)."
                                error={errors?.ring_time}
                                min={RING_TIME_MIN_VALUE}
                                max={RING_TIME_MAX_VALUE}
                            />
                        </div>
                    )}
                    {showCustomizableWaitTime && (
                        <div className={css.toggleInputCombo}>
                            <ToggleInput
                                isToggled={preferencesWaitTimeEnabled}
                                onClick={(value) =>
                                    onPreferencesChange({
                                        wait_time: {
                                            enabled: value,
                                            value: preferencesWaitTimeValue,
                                        },
                                    })
                                }
                                caption="Time before a call is forwarded to voicemail"
                            >
                                Enable wait time
                            </ToggleInput>
                            <InputField
                                label="Wait Time"
                                type="number"
                                value={preferencesWaitTimeValue}
                                onChange={(value) =>
                                    onPreferencesChange({
                                        wait_time: {
                                            enabled: preferencesWaitTimeEnabled,
                                            value:
                                                value === ''
                                                    ? Number.NaN
                                                    : Number(value),
                                        },
                                    })
                                }
                                caption="Set a time between 10 and 3600 seconds (1 hour)."
                                isDisabled={!preferencesWaitTimeEnabled}
                                error={errors?.wait_time}
                                min={WAIT_TIME_MIN_VALUE}
                                max={WAIT_TIME_MAX_VALUE}
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
