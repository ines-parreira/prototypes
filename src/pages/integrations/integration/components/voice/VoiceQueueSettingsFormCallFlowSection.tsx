import React, { useEffect } from 'react'

import {
    PhoneRingingBehaviour,
    VoiceQueueTargetScope,
} from '@gorgias/api-queries'
import { Button, Label, TextField } from '@gorgias/merchant-ui-kit'

import { FormField, useFormContext } from 'core/forms'
import Accordion from 'pages/common/components/accordion/Accordion'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import RadioButtonField from 'pages/common/forms/RadioButtonField'
import { HintTooltip } from 'pages/stats/common/HintTooltip'

import VoiceIntegrationPreferencesTeamSelect from './VoiceIntegrationPreferencesTeamSelect'
import VoiceSettingAccordionItem from './VoiceSettingAccordionItem'

import css from './VoiceQueueSettingsFormCallFlowSection.less'

const RING_TIME_MIN_VALUE = 10
const RING_TIME_MAX_VALUE = 600

export default function VoiceQueueSettingsFormCallFlowSection() {
    const { watch, setValue } = useFormContext()

    const [linkedTargets, ring_time, wait_time] = watch([
        'linked_targets',
        'ring_time',
        'wait_time',
    ])

    useEffect(() => {
        setValue(
            'target_scope',
            linkedTargets?.length
                ? VoiceQueueTargetScope.Specific
                : VoiceQueueTargetScope.AllAgents,
        )
    }, [setValue, linkedTargets])

    return (
        <div>
            <Accordion>
                <VoiceSettingAccordionItem
                    subtitle="Distribution mode"
                    description="Customize how calls are routed"
                >
                    <div className={css.container}>
                        <div>
                            <Label className={css.label}>Ring to</Label>
                            <FormField
                                name="linked_targets"
                                inputTransform={(value) =>
                                    value?.length ? value[0].team_id : null
                                }
                                outputTransform={(value) =>
                                    value === null
                                        ? []
                                        : [
                                              {
                                                  team_id: Number(value),
                                                  user_id: null,
                                              },
                                          ]
                                }
                                field={VoiceIntegrationPreferencesTeamSelect}
                            />
                        </div>

                        <FormField
                            field={RadioButtonField}
                            name="distribution_mode"
                            options={[
                                {
                                    label: 'Round-robin ringing',
                                    value: PhoneRingingBehaviour.RoundRobin,
                                    caption:
                                        'Calls ring agents one by one, starting with the longest idle.',
                                },
                                {
                                    label: 'Broadcast ringing',
                                    value: PhoneRingingBehaviour.Broadcast,
                                    caption:
                                        'Calls ring all available agents simultaneously. ',
                                },
                            ]}
                        />
                        <div>
                            <Label htmlFor="">
                                <>
                                    <span>Ring time per agent</span>
                                    <HintTooltip title="The time in seconds we ring each individual agent before moving to the next one." />
                                </>
                            </Label>
                            <FormField
                                field={TextField}
                                name="ring_time"
                                caption="Set a time between 10 and 600 seconds (10 minutes)."
                                label=""
                                suffix={
                                    <Button intent="secondary">seconds</Button>
                                }
                                type="number"
                                min={RING_TIME_MIN_VALUE}
                                max={RING_TIME_MAX_VALUE}
                                outputTransform={(value) =>
                                    value === '' ? value : Number(value)
                                }
                            />
                        </div>
                        {!!ring_time && !!wait_time && (
                            <Alert type={AlertType.Info} icon>
                                If each agent is rung for{' '}
                                <strong>{ring_time} seconds</strong> and the
                                maximum waiting time is{' '}
                                <strong>{wait_time} seconds</strong>, up to{' '}
                                <strong>
                                    {Math.ceil(wait_time / ring_time)} agents
                                </strong>{' '}
                                will be rung.
                            </Alert>
                        )}
                    </div>
                </VoiceSettingAccordionItem>
                <VoiceSettingAccordionItem
                    subtitle="Caller experience"
                    description="Customize your callers' waiting experience"
                >
                    Caller experience content
                </VoiceSettingAccordionItem>
            </Accordion>
        </div>
    )
}
