import { useEffect, useMemo, useRef } from 'react'

import { useFormContext, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { Banner } from '@gorgias/axiom'
import type {
    BusinessHoursTimeframe,
    TimeSplitConditionalStep,
} from '@gorgias/helpdesk-types'
import { TimeSplitConditionalRuleType } from '@gorgias/helpdesk-types'

import { FormField } from 'core/forms'
import type { NodeProps } from 'core/ui/flows'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'
import { useBusinessHours } from 'hooks/businessHours/useBusinessHours'
import { useIntegrationBusinessHours } from 'hooks/businessHours/useIntegrationBusinessHours'
import PrefilledTimeScheduleField from 'pages/common/components/TimeScheduleField/PrefilledTimeScheduleField'
import RadioButtonField from 'pages/common/forms/RadioButtonField'
import SelectDropdownField from 'pages/common/forms/SelectDropdownField'
import {
    BUSINESS_HOURS_BASE_URL,
    DAYS_OPTIONS,
} from 'pages/settings/businessHours/constants'
import { is24_7Schedule } from 'pages/settings/businessHours/utils'
import { getMomentTimezoneNames } from 'utils/date'

import type { TimeSplitConditionalNode } from '../types'
import { useVoiceFlow } from '../useVoiceFlow'
import { VoiceStepNode } from './VoiceStepNode'

import css from './VoiceStepNode.less'

const defaultBusinessHoursTimeframe: BusinessHoursTimeframe = {
    days: DAYS_OPTIONS[0].value,
    from_time: '09:00',
    to_time: '17:00',
}

type TimeSplitConditionalNodeProps = NodeProps<TimeSplitConditionalNode>

export function TimeSplitConditionalNode(props: TimeSplitConditionalNodeProps) {
    const { data } = props
    const ref = useRef<HTMLDivElement>(null)
    const { setValue } = useFormContext()
    const { updateNodeData } = useVoiceFlow()

    const businessHoursId: number = useWatch({ name: `business_hours_id` })
    const { businessHours, name: businessHoursName } =
        useIntegrationBusinessHours(businessHoursId)
    const { getBusinessHoursConfigLabel } = useBusinessHours()

    const { id } = data
    const step: TimeSplitConditionalStep | null = useWatch({
        name: `steps.${id}`,
    })
    const isCustomHours =
        step?.rule_type === TimeSplitConditionalRuleType.CustomHours

    const schedule = isCustomHours ? step?.custom_hours : businessHours
    const hours = schedule ? getBusinessHoursConfigLabel(schedule, true) : ''
    const businessHoursSchedule = businessHours
        ? getBusinessHoursConfigLabel(businessHours, true)
        : ''
    const is24_7 = schedule && is24_7Schedule(schedule)
    const alwaysOnWarning =
        'Your business hours are set to 24/7. All steps on the “Outside business hours” branch will be ignored.'

    const warnings = useMemo(() => {
        const warnings: string[] = []

        if (is24_7) {
            warnings.push(alwaysOnWarning)
        }
        if (!step?.on_true_step_id || (!step?.on_false_step_id && !is24_7)) {
            warnings.push(
                'We recommend you configure the branch. Otherwise, the call will be ended automatically with no warning.',
            )
        }

        return warnings
    }, [is24_7, step?.on_true_step_id, step?.on_false_step_id])

    useEffect(() => {
        // If the rule type is set to custom hours, ensure the timezone is set automatically if unset
        if (
            isCustomHours &&
            businessHours?.timezone &&
            !step?.custom_hours?.timezone
        ) {
            setValue(
                `steps.${id}.custom_hours.timezone`,
                businessHours.timezone,
            )
        }
    }, [
        setValue,
        isCustomHours,
        businessHours?.timezone,
        step?.custom_hours?.timezone,
        id,
    ])

    useEffect(() => {
        // Update the node data when the rule type changes to reflect in the children nodes
        if (step?.rule_type !== data.rule_type) {
            updateNodeData(id, { rule_type: step?.rule_type })
        }
    }, [step?.rule_type, id, updateNodeData, data.rule_type])

    if (!step) {
        return null
    }

    return (
        <VoiceStepNode
            title="Time rule"
            description={`${isCustomHours ? 'Custom hours' : 'Business hours'}: ${hours}`}
            icon={<StepCardIcon backgroundColor="purple" name="clock" />}
            errors={[]}
            warnings={warnings}
            drawerRef={ref}
            {...props}
        >
            <div className={css.tightDrawerForm}>
                {is24_7 && <Banner type="warning">{alwaysOnWarning}</Banner>}

                <FormField
                    name={`steps.${id}.rule_type`}
                    field={RadioButtonField}
                    inputTransform={(value) => {
                        if (!value) {
                            return TimeSplitConditionalRuleType.BusinessHours
                        }
                        return value
                    }}
                    options={[
                        {
                            value: TimeSplitConditionalRuleType.BusinessHours,
                            label: 'Business hours',
                            caption: (
                                <div>
                                    Your business hours are currently set as{' '}
                                    {businessHoursName}: {businessHoursSchedule}
                                    . You can view or adjust these settings in{' '}
                                    <Link
                                        to={BUSINESS_HOURS_BASE_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Business Hours
                                    </Link>
                                    .
                                </div>
                            ),
                        },
                        {
                            value: TimeSplitConditionalRuleType.CustomHours,
                            label: 'Custom hours',
                        },
                    ]}
                />
                {isCustomHours && (
                    <>
                        <div>
                            <FormField
                                name={`steps.${id}.custom_hours.timezone`}
                                label="Timezone"
                                field={SelectDropdownField}
                                options={getMomentTimezoneNames()}
                                root={ref.current ?? undefined}
                            />
                        </div>
                        <PrefilledTimeScheduleField
                            name={`steps.${id}.custom_hours.business_hours`}
                            root={ref.current ?? undefined}
                            defaultValues={defaultBusinessHoursTimeframe}
                        />
                    </>
                )}
            </div>
        </VoiceStepNode>
    )
}
