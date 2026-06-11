import { useEffect } from 'react'

import { FormField, useFormContext } from '@repo/forms'

import {
    LegacyBanner as Banner,
    LegacyButton as Button,
    Label,
    LegacyTextField as TextField,
    ToggleField,
} from '@gorgias/axiom'
import {
    PhoneRingingBehaviour,
    VoiceQueueTargetScope,
} from '@gorgias/helpdesk-types'

import { HintTooltip } from 'domains/reporting/pages/common/HintTooltip'
import Accordion from 'pages/common/components/accordion/Accordion'
import RadioButtonField from 'pages/common/forms/RadioButtonField'

import {
    RING_TIME_MAX_VALUE,
    RING_TIME_MIN_VALUE,
    WAIT_TIME_MAX_VALUE,
    WAIT_TIME_MIN_VALUE,
    WRAP_UP_TIME_MAX_VALUE,
    WRAP_UP_TIME_MIN_VALUE,
} from './constants'
import VoiceIntegrationPreferencesTeamSelect from './VoiceIntegrationPreferencesTeamSelect'
import VoiceSettingAccordionItem from './VoiceSettingAccordionItem'
import WaitMusicField from './WaitMusicField'

import css from './VoiceQueueSettingsFormCallFlowSection.less'

export default function VoiceQueueSettingsFormCallFlowSection() {
    const { watch, setValue } = useFormContext()

    const [linkedTargets, ring_time, wait_time, is_wrap_up_time_enabled] =
        watch([
            'linked_targets',
            'ring_time',
            'wait_time',
            'is_wrap_up_time_enabled',
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
                            <FormField name="linked_targets">
                                {(field) => (
                                    <VoiceIntegrationPreferencesTeamSelect
                                        {...field}
                                        value={
                                            field.value?.length
                                                ? field.value[0].team_id
                                                : null
                                        }
                                        onChange={(value) =>
                                            field.onChange(
                                                value === null
                                                    ? []
                                                    : [
                                                          {
                                                              team_id:
                                                                  Number(value),
                                                              user_id: null,
                                                          },
                                                      ],
                                            )
                                        }
                                    />
                                )}
                            </FormField>
                        </div>

                        <FormField name="distribution_mode">
                            {(field) => (
                                <RadioButtonField
                                    {...field}
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
                            )}
                        </FormField>
                        <div>
                            <Label htmlFor="ring_time">
                                <>
                                    <span>Ring time per agent</span>
                                    <HintTooltip title="The time in seconds we ring each individual agent before moving to the next one." />
                                </>
                            </Label>
                            <FormField
                                name="ring_time"
                                label=""
                                caption="Set a time between 10 and 600 seconds (10 minutes)."
                            >
                                {(field) => (
                                    <TextField
                                        {...field}
                                        suffix={
                                            <Button intent="secondary">
                                                seconds
                                            </Button>
                                        }
                                        type="number"
                                        min={RING_TIME_MIN_VALUE}
                                        max={RING_TIME_MAX_VALUE}
                                        onChange={(value) =>
                                            field.onChange(
                                                value === ''
                                                    ? value
                                                    : Number(value),
                                            )
                                        }
                                    />
                                )}
                            </FormField>
                        </div>
                        <div className={css.wrapUpFields}>
                            <FormField
                                name="is_wrap_up_time_enabled"
                                label="Enable wrap-up time"
                                caption="Wrap-up time gives agents a short period to finish their tasks before receiving their next incoming call. Applies only to calls longer than 20 seconds."
                            >
                                {(field) => <ToggleField {...field} />}
                            </FormField>
                            {is_wrap_up_time_enabled && (
                                <FormField
                                    name="wrap_up_time"
                                    label="Wrap-up time"
                                    isDisabled={!is_wrap_up_time_enabled}
                                    caption="Set a time between 10 and 600 seconds (10 minutes)."
                                >
                                    {(field) => (
                                        <TextField
                                            {...field}
                                            type="number"
                                            min={WRAP_UP_TIME_MIN_VALUE}
                                            max={WRAP_UP_TIME_MAX_VALUE}
                                            onChange={(value) =>
                                                field.onChange(
                                                    value === ''
                                                        ? null
                                                        : Number(value),
                                                )
                                            }
                                        />
                                    )}
                                </FormField>
                            )}
                        </div>
                        {!!ring_time &&
                            !!wait_time &&
                            ring_time > 0 &&
                            wait_time > 0 && (
                                <Banner variant="inline" type="info" icon>
                                    If each agent is rung for{' '}
                                    <strong>{ring_time} seconds</strong> and the
                                    maximum waiting time is{' '}
                                    <strong>{wait_time} seconds</strong>, up to{' '}
                                    <strong>
                                        {Math.ceil(wait_time / ring_time)}{' '}
                                        agents
                                    </strong>{' '}
                                    will be rung.
                                </Banner>
                            )}
                    </div>
                </VoiceSettingAccordionItem>
                <VoiceSettingAccordionItem
                    subtitle="Caller experience"
                    description="Customize your callers' waiting experience"
                >
                    <div className={css.accordionContent}>
                        <div>
                            <Label htmlFor="wait_time">
                                <span>Wait time</span>
                                <HintTooltip title="The maximum time in seconds we wait before sending the call to the next step in your routing." />
                            </Label>
                            <FormField
                                name="wait_time"
                                label=""
                                caption="Set a time between 10 and 7200 seconds (2 hour)."
                            >
                                {(field) => (
                                    <TextField
                                        {...field}
                                        type="number"
                                        min={WAIT_TIME_MIN_VALUE}
                                        max={WAIT_TIME_MAX_VALUE}
                                        onChange={(value) =>
                                            field.onChange(
                                                value === ''
                                                    ? value
                                                    : Number(value),
                                            )
                                        }
                                    />
                                )}
                            </FormField>
                        </div>
                        <div>
                            <Label htmlFor="wait_music">
                                Wait and hold music
                            </Label>
                            <p>
                                The music callers will hear while they are
                                waiting or on hold.
                            </p>
                            <FormField name="wait_music">
                                {(field) => (
                                    <WaitMusicField {...field} shouldUpload />
                                )}
                            </FormField>
                        </div>
                    </div>
                </VoiceSettingAccordionItem>
            </Accordion>
        </div>
    )
}
