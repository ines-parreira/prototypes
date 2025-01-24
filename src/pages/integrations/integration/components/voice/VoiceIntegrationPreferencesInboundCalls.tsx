import classNames from 'classnames'
import React from 'react'
import {Label} from 'reactstrap'

import FormField from 'components/Form/FormField'
import {PhoneRingingBehaviour} from 'models/integration/types'
import CheckBoxField from 'pages/common/forms/CheckBoxField'
import RadioButtonField from 'pages/common/forms/RadioButtonField'

import settingsCss from 'pages/settings/settings.less'
import {HintTooltip} from 'pages/stats/common/HintTooltip'

import {
    RING_TIME_MAX_VALUE,
    RING_TIME_MIN_VALUE,
    RING_TIME_VALIDATION_ERROR,
    WAIT_TIME_MAX_VALUE,
    WAIT_TIME_MIN_VALUE,
    WAIT_TIME_VALIDATION_ERROR,
} from './constants'
import css from './VoiceIntegrationPreferences.less'
import VoiceIntegrationPreferencesTeamSelect from './VoiceIntegrationPreferencesTeamSelect'

type Props = {
    isIvr: boolean
}

export default function VoiceIntegrationPreferencesInboundCalls({
    isIvr,
}: Props): JSX.Element {
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
