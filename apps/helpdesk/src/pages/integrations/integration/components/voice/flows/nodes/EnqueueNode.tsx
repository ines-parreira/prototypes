import type { LegacyCheckBoxFieldProps as CheckBoxFieldProps } from '@gorgias/axiom'
import { LegacyCheckBoxField as CheckBoxField } from '@gorgias/axiom'
import type { EnqueueStep } from '@gorgias/helpdesk-types'
import { CustomRecordingType } from '@gorgias/helpdesk-types'

import { FormField, useFormContext, useWatch } from 'core/forms'
import type { NodeProps } from 'core/ui/flows'
import {
    StaticVerticalStep,
    StaticVerticalStepper,
} from 'pages/common/forms/StaticVerticalStepper'
import InfoIconWithTooltip from 'pages/tickets/common/components/InfoIconWithTooltip'

import VoiceMessageField from '../../VoiceMessageField'
import { type EnqueueNode } from '../types'
import { useVoiceFlow } from '../useVoiceFlow'
import { transformToReactFlowNodes } from '../utils'
import { useDeleteNode } from '../utils/useDeleteNode'
import VoiceNodeFormSection from './VoiceNodeFormSection'

import css from './VoiceStepNode.less'

export function EnqueueNode(props: NodeProps<EnqueueNode>) {
    const { id } = props.data
    const step: EnqueueStep = useWatch({ name: `steps.${id}` })
    const { watch, register } = useFormContext()
    const { setNodes } = useVoiceFlow()
    const { deleteEnqueueBranches } = useDeleteNode()

    const handleConditionalRoutingChange = (nextValue: boolean) => {
        if (nextValue) {
            const first_step_id = watch('first_step_id')
            const steps = watch('steps')
            register(`steps.${id}.skip_step_id`, {
                value: step?.next_step_id,
            })
            const nodes = transformToReactFlowNodes({ first_step_id, steps })
            setNodes(nodes)
            return
        }

        deleteEnqueueBranches(id)
    }

    if (!step.queue_id) {
        return null
    }

    return (
        <>
            <VoiceNodeFormSection
                title={
                    <>
                        Step 2: Handle busy times (Optional)
                        <InfoIconWithTooltip
                            id="skip-queue-info"
                            tooltipProps={{ autohide: false }}
                        >
                            <>
                                Calls skip the selected queue if:
                                <li>all agents are busy or offline</li>
                                <li>the queue capacity is reached</li>
                            </>
                        </InfoIconWithTooltip>
                    </>
                }
                description="When checked, calls skip the queue and go to the
                                next step you configure on the Skip Queue branch:"
            >
                <FormField
                    name={`steps.${id}.conditional_routing`}
                    field={ConditionalRoutingCheckBoxField}
                    onConditionalRoutingChange={handleConditionalRoutingChange}
                    label={'Skip queue when it’s too busy'}
                />
            </VoiceNodeFormSection>

            <VoiceNodeFormSection
                title="Step 3: Callback requests (Optional)"
                description="When checked, Callers keep their place in line and
                                get called back when an agent is available."
            >
                <FormField
                    name={`steps.${id}.callback_requests.enabled`}
                    field={CheckBoxField}
                    label={'Allow callers to request callbacks'}
                />
                {step?.callback_requests?.enabled && (
                    <StaticVerticalStepper>
                        <StaticVerticalStep stepDescription="First, inform callers about callbacks:">
                            <FormField
                                name={`steps.${id}.callback_requests.prompt_message`}
                                field={VoiceMessageField}
                                allowNone={false}
                                customRecordingType={
                                    CustomRecordingType.CallbackRequests
                                }
                            />
                        </StaticVerticalStep>
                        <StaticVerticalStep stepDescription="Then, confirm their request:">
                            <div className={css.formSection}>
                                <div>
                                    <FormField
                                        name={`steps.${id}.callback_requests.confirmation_message`}
                                        field={VoiceMessageField}
                                        allowNone
                                        customRecordingType={
                                            CustomRecordingType.CallbackRequests
                                        }
                                    />
                                </div>
                                <FormField
                                    name={`steps.${id}.callback_requests.allow_to_leave_voicemail`}
                                    field={CheckBoxField}
                                    label={
                                        'Allow callers to leave a voicemail after callback requests'
                                    }
                                />
                            </div>
                        </StaticVerticalStep>
                    </StaticVerticalStepper>
                )}
            </VoiceNodeFormSection>
        </>
    )
}

const ConditionalRoutingCheckBoxField = ({
    onChange,
    onConditionalRoutingChange,
    ...props
}: CheckBoxFieldProps & {
    onConditionalRoutingChange: (nextValue: boolean) => void
}) => {
    return (
        <CheckBoxField
            {...props}
            onChange={(nextValue) => {
                onChange?.(nextValue)
                onConditionalRoutingChange(nextValue)
            }}
        />
    )
}
