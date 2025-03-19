import classNames from 'classnames'
import { Label } from 'reactstrap'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { FormField, useFormContext } from 'core/forms'
import { PhoneRingingBehaviour } from 'models/integration/types'
import CheckBoxField from 'pages/common/forms/CheckBoxField'
import PreviewRadioFieldSet from 'pages/common/forms/PreviewRadioFieldSet'
import RadioButtonField from 'pages/common/forms/RadioButtonField'
import settingsCss from 'pages/settings/settings.less'
import { HintTooltip } from 'pages/stats/common/HintTooltip'

import {
    RING_TIME_MAX_VALUE,
    RING_TIME_MIN_VALUE,
    RING_TIME_VALIDATION_ERROR,
    WAIT_TIME_MAX_VALUE,
    WAIT_TIME_MIN_VALUE,
    WAIT_TIME_VALIDATION_ERROR,
} from './constants'
import VoiceIntegrationPreferencesTeamSelect from './VoiceIntegrationPreferencesTeamSelect'

import css from './VoiceIntegrationPreferences.less'

type Props = {
    isIvr: boolean
}

export default function VoiceIntegrationPreferencesInboundCalls({
    isIvr,
}: Props): JSX.Element {
    const isSendCallsToVoiceMailEnabled = useFlag(
        FeatureFlagKey.SendCallsToVoicemailPreference,
    )
    const { watch } = useFormContext()

    const send_calls_to_voicemail = watch('meta.send_calls_to_voicemail')

    if (!isSendCallsToVoiceMailEnabled) {
        return (
            <DEPRECATED_VoiceIntegrationPreferencesInboundCalls isIvr={isIvr} />
        )
    }

    return (
        <>
            <h2
                className={classNames(
                    settingsCss.headingSection,
                    css.sectionHeader,
                )}
            >
                Routing options
            </h2>
            {!isIvr && (
                <>
                    <div>
                        <FormField
                            field={PreviewRadioFieldSet}
                            name="meta.send_calls_to_voicemail"
                            inputTransform={(value: string) =>
                                value ? 'true' : 'false'
                            }
                            outputTransform={(value) =>
                                value === 'true' ? true : false
                            }
                            options={[
                                {
                                    label: 'Ring to agents or teams',
                                    caption:
                                        'Route calls to a queue to ensure they reach the right agents or teams.',
                                    value: 'false',
                                },
                                {
                                    label: 'Send calls directly to voicemail',
                                    caption:
                                        'Calls will go directly to voicemail without ringing any agents or teams.',
                                    value: 'true',
                                },
                            ]}
                        />
                    </div>
                    {!send_calls_to_voicemail && (
                        <>
                            <div>
                                <Label className="control-label">
                                    Route to a team
                                </Label>
                                <FormField
                                    name="meta.phone_team_id"
                                    field={
                                        VoiceIntegrationPreferencesTeamSelect
                                    }
                                />
                            </div>
                            <div>
                                <FormField
                                    field={RadioButtonField}
                                    name="meta.preferences.ringing_behaviour"
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
                                />
                            </div>
                            <div>
                                <FormField
                                    name="meta.preferences.ring_time"
                                    validation={{
                                        required: RING_TIME_VALIDATION_ERROR,
                                        min: {
                                            value: RING_TIME_MIN_VALUE,
                                            message: RING_TIME_VALIDATION_ERROR,
                                        },
                                        max: {
                                            value: RING_TIME_MAX_VALUE,
                                            message: RING_TIME_VALIDATION_ERROR,
                                        },
                                    }}
                                    min={RING_TIME_MIN_VALUE}
                                    max={RING_TIME_MAX_VALUE}
                                    label={
                                        <>
                                            <span>Ring time per agent</span>
                                            <HintTooltip title="The time in seconds we ring each individual agent before moving to the next one." />
                                        </>
                                    }
                                    type="number"
                                    caption="Set a time between 10 and 600 seconds (10 minutes)."
                                    outputTransform={(value) =>
                                        value === '' ? value : Number(value)
                                    }
                                />
                            </div>
                            <FormField
                                name="meta.preferences.wait_time.value"
                                validation={{
                                    required: WAIT_TIME_VALIDATION_ERROR,
                                    min: {
                                        value: WAIT_TIME_MIN_VALUE,
                                        message: WAIT_TIME_VALIDATION_ERROR,
                                    },
                                    max: {
                                        value: WAIT_TIME_MAX_VALUE,
                                        message: WAIT_TIME_VALIDATION_ERROR,
                                    },
                                }}
                                outputTransform={(value) =>
                                    value === '' ? value : Number(value)
                                }
                                label={
                                    <>
                                        <span>Max wait time</span>
                                        <HintTooltip title="The maximum time in seconds we wait before sending the call to voicemail." />
                                    </>
                                }
                                type="number"
                                min={WAIT_TIME_MIN_VALUE}
                                max={WAIT_TIME_MAX_VALUE}
                                caption="Set a time between 10 and 3600 seconds (1 hour)."
                            />
                        </>
                    )}
                </>
            )}
            {!send_calls_to_voicemail && (
                <div>
                    <Label className="control-label">Other settings</Label>
                    <div className={css.otherSettings}>
                        {!isIvr && (
                            <FormField
                                name="meta.preferences.wait_time.enabled"
                                field={CheckBoxField}
                                label="Hold calls in queue until an agent becomes available"
                                caption="If toggled off, calls will go directly to voicemail when agents are not available."
                            />
                        )}
                        <FormField
                            name="meta.preferences.voicemail_outside_business_hours"
                            field={CheckBoxField}
                            label="Send calls to voicemail outside business hours"
                            caption="If a customer calls outside of
                                                    business hours, they will be
                                                    immediately forwarded to voicemail."
                        />
                    </div>
                </div>
            )}
        </>
    )
}

function DEPRECATED_VoiceIntegrationPreferencesInboundCalls({
    isIvr,
}: Props): JSX.Element {
    return (
        <>
            <h2
                className={classNames(
                    settingsCss.headingSection,
                    css.sectionHeader,
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
                        <FormField
                            name="meta.phone_team_id"
                            field={VoiceIntegrationPreferencesTeamSelect}
                        />
                    </div>
                    <div>
                        <Label className="control-label">
                            Set ringing behaviour
                        </Label>
                        <FormField
                            field={RadioButtonField}
                            name="meta.preferences.ringing_behaviour"
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
                        />
                    </div>
                    <div>
                        <FormField
                            name="meta.preferences.ring_time"
                            validation={{
                                required: RING_TIME_VALIDATION_ERROR,
                                min: {
                                    value: RING_TIME_MIN_VALUE,
                                    message: RING_TIME_VALIDATION_ERROR,
                                },
                                max: {
                                    value: RING_TIME_MAX_VALUE,
                                    message: RING_TIME_VALIDATION_ERROR,
                                },
                            }}
                            min={RING_TIME_MIN_VALUE}
                            max={RING_TIME_MAX_VALUE}
                            label={
                                <>
                                    <span>Ring time per agent</span>
                                    <HintTooltip title="The time in seconds we ring each individual agent before moving to the next one." />
                                </>
                            }
                            type="number"
                            caption="Set a time between 10 and 600 seconds (10 minutes)."
                            outputTransform={(value) =>
                                value === '' ? value : Number(value)
                            }
                        />
                    </div>
                    <FormField
                        name="meta.preferences.wait_time.value"
                        validation={{
                            required: WAIT_TIME_VALIDATION_ERROR,
                            min: {
                                value: WAIT_TIME_MIN_VALUE,
                                message: WAIT_TIME_VALIDATION_ERROR,
                            },
                            max: {
                                value: WAIT_TIME_MAX_VALUE,
                                message: WAIT_TIME_VALIDATION_ERROR,
                            },
                        }}
                        outputTransform={(value) =>
                            value === '' ? value : Number(value)
                        }
                        label={
                            <>
                                <span>Max wait time</span>
                                <HintTooltip title="The maximum time in seconds we wait before sending the call to voicemail." />
                            </>
                        }
                        type="number"
                        min={WAIT_TIME_MIN_VALUE}
                        max={WAIT_TIME_MAX_VALUE}
                        caption="Set a time between 10 and 3600 seconds (1 hour)."
                    />
                </>
            )}
            <div>
                <Label className="control-label">Other settings</Label>
                <div className={css.otherSettings}>
                    {!isIvr && (
                        <FormField
                            name="meta.preferences.wait_time.enabled"
                            field={CheckBoxField}
                            label="Hold calls in queue until an agent becomes available"
                            caption="If toggled off, calls will go directly to voicemail when agents are not available."
                        />
                    )}
                    <FormField
                        name="meta.preferences.voicemail_outside_business_hours"
                        field={CheckBoxField}
                        label="Send calls to voicemail outside business hours"
                        caption="If a customer calls outside of
                                                    business hours, they will be
                                                    immediately forwarded to voicemail."
                    />
                </div>
            </div>
        </>
    )
}
