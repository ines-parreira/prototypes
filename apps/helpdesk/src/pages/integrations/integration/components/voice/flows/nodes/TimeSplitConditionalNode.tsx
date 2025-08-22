import { useEffect, useRef } from 'react'

import { useFormContext, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'

import {
    BusinessHoursTimeframe,
    TimeSplitConditionalRuleType,
    TimeSplitConditionalStep,
} from '@gorgias/helpdesk-types'

import { FormField } from 'core/forms'
import { NodeProps } from 'core/ui/flows'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'
import { useBusinessHours } from 'hooks/businessHours/useBusinessHours'
import { useIntegrationBusinessHours } from 'hooks/businessHours/useIntegrationBusinessHours'
import PrefilledTimeScheduleField from 'pages/common/components/TimeScheduleField/PrefilledTimeScheduleField'
import InputField from 'pages/common/forms/input/InputField'
import RadioButtonField from 'pages/common/forms/RadioButtonField'
import {
    BUSINESS_HOURS_BASE_URL,
    DAYS_OPTIONS,
} from 'pages/settings/businessHours/constants'

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
    const step: TimeSplitConditionalStep = useWatch({ name: `steps.${id}` })
    const { rule_type, custom_hours } = step
    const isCustomHours = rule_type === TimeSplitConditionalRuleType.CustomHours

    const schedule = isCustomHours ? custom_hours : businessHours
    const hours = schedule ? getBusinessHoursConfigLabel(schedule, true) : ''
    const businessHoursSchedule = businessHours
        ? getBusinessHoursConfigLabel(businessHours, true)
        : ''

    useEffect(() => {
        // If the rule type is set to custom hours, ensure the timezone is set automatically
        if (isCustomHours && businessHours?.timezone) {
            setValue(
                `steps.${id}.custom_hours.timezone`,
                businessHours.timezone,
            )
        }
    }, [setValue, isCustomHours, businessHours?.timezone, id])

    useEffect(() => {
        // Update the node data when the rule type changes to reflect in the children nodes
        updateNodeData(id, { rule_type })
    }, [rule_type, id, updateNodeData])

    return (
        <VoiceStepNode
            title="Time rule"
            description={`${isCustomHours ? 'Custom hours' : 'Business hours'}: ${hours}`}
            icon={<StepCardIcon backgroundColor="purple" name="clock" />}
            errors={[]}
            drawerRef={ref}
            {...props}
        >
            <div className={css.tightDrawerForm}>
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
                        <InputField
                            label="Timezone"
                            isDisabled
                            defaultValue={businessHours?.timezone}
                        />
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
