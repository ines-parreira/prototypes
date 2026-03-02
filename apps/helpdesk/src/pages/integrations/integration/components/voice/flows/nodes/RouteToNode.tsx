import { useMemo } from 'react'

import { FormField, useWatch } from '@repo/forms'
import type { NodeProps } from '@xyflow/react'
import { useParams } from 'react-router-dom'

import { LegacyBanner as Banner, Box } from '@gorgias/axiom'
import { useGetIntegration, useGetVoiceQueue } from '@gorgias/helpdesk-queries'
import type {
    EnqueueStep,
    PhoneIntegration,
    RouteToInternalNumber,
} from '@gorgias/helpdesk-types'
import { IntegrationType } from '@gorgias/helpdesk-types'

import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'

import { VoiceIntegrationSelectCaption } from '../../VoiceIntegrationSelectCaption'
import VoiceIntegrationSelectField from '../../VoiceIntegrationSelectField'
import VoiceQueueSelectField from '../../VoiceQueueSelectField'
import VoiceQueueSummary from '../../VoiceQueueSummary'
import { VoiceFlowNodeType } from '../constants'
import { RouteToStepTypeField } from '../RouteToStepTypeField'
import type {
    EnqueueNode as EnqueueNodeType,
    RouteToInternalNumberNode as RouteToInternalNumberNodeType,
} from '../types'
import { validateRouteToStep } from '../utils/validationUtils'
import { EnqueueNode } from './EnqueueNode'
import VoiceNodeFormSection from './VoiceNodeFormSection'
import { VoiceStepNode } from './VoiceStepNode'

import css from './VoiceStepNode.less'

export function RouteToNode(
    props: NodeProps<RouteToInternalNumberNodeType | EnqueueNodeType>,
) {
    const { id } = props.data
    const { integrationId: integrationIdParam } = useParams<{
        integrationId: string
    }>()
    const step: RouteToInternalNumber | EnqueueStep | null = useWatch({
        name: `steps.${id}`,
    })

    const isGetVoiceQueueEnabled =
        !!step && 'queue_id' in step && step.queue_id !== null
    const isGetIntegrationEnabled =
        !!step && 'integration_id' in step && step.integration_id !== null
    const { data: queueData } = useGetVoiceQueue(
        isGetVoiceQueueEnabled ? step.queue_id : 0,
        {
            with_integrations: true,
        },
        {
            query: {
                enabled: isGetVoiceQueueEnabled,
                staleTime: 60_000,
            },
        },
    )

    const { data: integrationData } = useGetIntegration(
        isGetIntegrationEnabled ? (step.integration_id as number) : 0,
        {
            query: {
                enabled: isGetIntegrationEnabled,
                staleTime: 60_000,
            },
        },
    )

    const isQueueOptionSelected = step?.step_type === VoiceFlowNodeType.Enqueue
    const isVoiceIntegrationOptionSelected =
        step?.step_type === VoiceFlowNodeType.RouteToInternalNumber
    const isIntegrationTypeNotPhone =
        isVoiceIntegrationOptionSelected &&
        integrationData?.data &&
        integrationData?.data.type !== IntegrationType.Phone

    const errors = useMemo(() => {
        return step ? validateRouteToStep(step) : []
    }, [step])
    const warnings =
        isVoiceIntegrationOptionSelected && step.next_step_id
            ? [
                  'The following steps will be ignored as this step ends the call.',
              ]
            : []

    if (!step || isIntegrationTypeNotPhone) {
        return null
    }

    const integration = integrationData?.data as PhoneIntegration | undefined

    const description = isQueueOptionSelected
        ? (queueData?.data.name ?? 'Select queue')
        : (integration?.name ?? 'Select integration')

    return (
        <VoiceStepNode
            {...props}
            title="Route to"
            description={description ?? ''}
            icon={
                <StepCardIcon backgroundColor="orange" name="arrow-routing" />
            }
            errors={errors}
            warnings={warnings}
        >
            {isVoiceIntegrationOptionSelected && (
                <Banner>
                    Please note that routing to a voice integration ends the
                    call. All following steps will be ignored.
                </Banner>
            )}
            <div className={css.formWithSeparator}>
                <VoiceNodeFormSection
                    title="Step 1: Where should this call go?"
                    description="Select the destination you want your callers to be routed to:"
                >
                    <FormField
                        id={id}
                        name={`steps.${id}.step_type`}
                        field={RouteToStepTypeField}
                        options={[
                            {
                                label: 'Queue',
                                value: VoiceFlowNodeType.Enqueue,
                            },
                            {
                                label: 'Voice integration',
                                value: VoiceFlowNodeType.RouteToInternalNumber,
                            },
                        ]}
                    />
                    {isQueueOptionSelected && (
                        <>
                            <FormField
                                field={VoiceQueueSelectField}
                                name={`steps.${id}.queue_id`}
                                withLabel={false}
                            />
                            {step?.queue_id && (
                                <VoiceQueueSummary queue_id={step.queue_id} />
                            )}
                        </>
                    )}
                    {isVoiceIntegrationOptionSelected && (
                        <Box mt="xs" flexDirection="column" gap="xxs">
                            <FormField
                                name={`steps.${id}.integration_id`}
                                field={VoiceIntegrationSelectField}
                                hiddenIntegrations={[
                                    Number(integrationIdParam),
                                ]}
                            />
                            <VoiceIntegrationSelectCaption
                                integration={integration}
                            />
                        </Box>
                    )}
                </VoiceNodeFormSection>
                {isQueueOptionSelected && (
                    <EnqueueNode {...(props as NodeProps<EnqueueNodeType>)} />
                )}
            </div>
        </VoiceStepNode>
    )
}
