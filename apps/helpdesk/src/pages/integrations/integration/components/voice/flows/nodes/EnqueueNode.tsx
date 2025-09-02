import { useMemo } from 'react'

import { useWatch } from 'react-hook-form'

import { CheckBoxField } from '@gorgias/axiom'
import { useGetVoiceQueue } from '@gorgias/helpdesk-queries'
import { CustomRecordingType, EnqueueStep } from '@gorgias/helpdesk-types'
import { validateVoiceCallbackRequests } from '@gorgias/helpdesk-validators'

import { FormField } from 'core/forms'
import { NodeProps } from 'core/ui/flows'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'
import {
    StaticVerticalStep,
    StaticVerticalStepper,
} from 'pages/common/forms/StaticVerticalStepper'
import InfoIconWithTooltip from 'pages/tickets/common/components/InfoIconWithTooltip'

import VoiceMessageField from '../../VoiceMessageField'
import VoiceQueueSelectField from '../../VoiceQueueSelectField'
import VoiceQueueSummary from '../../VoiceQueueSummary'
import { type EnqueueNode } from '../types'
import VoiceNodeFormSection from './VoiceNodeFormSection'
import { VoiceStepNode } from './VoiceStepNode'

import css from './VoiceStepNode.less'

export function EnqueueNode(props: NodeProps<EnqueueNode>) {
    const { id } = props.data
    const step: EnqueueStep = useWatch({ name: `steps.${id}` })
    const { queue_id, callback_requests } = step

    const { data: queueData } = useGetVoiceQueue(
        queue_id ?? 0,
        {
            with_integrations: true,
        },
        {
            query: {
                enabled: false, // we retrieve it already in the summary
                staleTime: 60_000,
            },
        },
    )
    const queueName = queueData?.data.name

    const errors = useMemo(() => {
        const errors: string[] = []

        if (!step.queue_id) {
            errors.push('Queue is required')
        }
        if (step.callback_requests?.enabled) {
            try {
                if (
                    !validateVoiceCallbackRequests(step.callback_requests)
                        .isValid
                ) {
                    errors.push('Callback settings are misconfigured')
                }
            } catch {
                errors.push('Callback settings are misconfigured')
            }
        }

        return errors
    }, [step])

    return (
        <VoiceStepNode
            {...props}
            title="Route to"
            description={queueName ?? 'Queue'}
            icon={
                <StepCardIcon backgroundColor="orange" name="arrow-routing" />
            }
            errors={errors}
        >
            <div className={css.formWithSeparator}>
                <VoiceNodeFormSection
                    title="Step 1: Where should this call go?"
                    description="Select the queue you want your callers to be routed to:"
                >
                    <FormField
                        field={VoiceQueueSelectField}
                        name={`steps.${id}.queue_id`}
                        withLabel={false}
                    />
                    {queue_id && <VoiceQueueSummary queue_id={queue_id} />}
                </VoiceNodeFormSection>

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
                        field={CheckBoxField}
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
                    {callback_requests?.enabled && (
                        <StaticVerticalStepper>
                            <StaticVerticalStep stepDescription="First, inform callers about callbacks:">
                                <FormField
                                    name={`steps.${id}.callback_requests.prompt_message`}
                                    field={VoiceMessageField}
                                    horizontal
                                    shouldUpload
                                    allowNone={false}
                                    customRecordingType={
                                        CustomRecordingType.CallbackRequests
                                    }
                                    radioButtonId={`${id}-prompt-message`}
                                />
                            </StaticVerticalStep>
                            <StaticVerticalStep stepDescription="Then, confirm their request:">
                                <div className={css.formSection}>
                                    <div>
                                        <FormField
                                            name={`steps.${id}.callback_requests.confirmation_message`}
                                            field={VoiceMessageField}
                                            horizontal
                                            shouldUpload
                                            allowNone
                                            customRecordingType={
                                                CustomRecordingType.CallbackRequests
                                            }
                                            radioButtonId={`${id}-confirmation-message`}
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
            </div>
        </VoiceStepNode>
    )
}
