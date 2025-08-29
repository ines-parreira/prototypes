import { Fragment, useMemo } from 'react'

import {
    useGetConfigurationExecution,
    useGetWorkflowConfiguration,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import useGetAppImageUrl from 'pages/aiAgent/actions/hooks/useGetAppImageUrl'
import {
    ActionStepItem,
    LlmTriggeredExecution,
    TemplateConfiguration,
} from 'pages/aiAgent/actions/types'
import { defaultNodeNames } from 'pages/automate/workflows/editor/visualBuilder/nodes/constants'
import { Components } from 'rest_api/workflows_api/client.generated'

import css from './AiAgentFailedWorkflowMessage.less'

function isDefaultNodeKind(
    kind: ActionStepItem['kind'],
): kind is keyof typeof defaultNodeNames {
    return kind in defaultNodeNames
}

interface WorkflowData {
    configurationId?: string
    executionId?: string
    success?: boolean
}

interface CompletedWorkflowData {
    configurationId: string
    executionId: string
    success?: true
}

interface FailedWorkflowMessageProps {
    workflowData: WorkflowData
    originalMessage: React.ReactNode
}

const FailedWorkflowMessage = ({
    workflowData,
    originalMessage,
}: FailedWorkflowMessageProps) => {
    if (!workflowData.configurationId || !workflowData.executionId) {
        return <>{originalMessage}</>
    }

    return (
        <PartialSuccessMessageWrapper
            workflowData={workflowData as CompletedWorkflowData}
            originalMessage={originalMessage}
        />
    )
}

interface PartialSuccessMessageWrapperProps {
    workflowData: CompletedWorkflowData
    originalMessage: React.ReactNode
}

function PartialSuccessMessageWrapper({
    workflowData,
    originalMessage,
}: PartialSuccessMessageWrapperProps) {
    const { configurationId, executionId } = workflowData

    // Get template configurations
    const { data: templateConfigurations } =
        useGetWorkflowConfigurationTemplates({
            triggers: ['llm-prompt', 'reusable-llm-prompt'],
        })

    // Get the configuration for the action
    const { data: actionConfiguration } =
        useGetWorkflowConfiguration(configurationId)

    // Get the individual execution data
    const { data: executionData } = useGetConfigurationExecution(
        actionConfiguration?.internal_id || '',
        executionId || '',
        { enabled: !!executionId && !!actionConfiguration?.internal_id },
    )

    if (
        executionData?.status === 'partial_success' &&
        actionConfiguration &&
        templateConfigurations
    ) {
        return (
            <PartialSuccessMessage
                execution={executionData as LlmTriggeredExecution}
                actionConfiguration={actionConfiguration}
                templateConfigurations={templateConfigurations}
            />
        )
    }

    return <>{originalMessage}</>
}

export default FailedWorkflowMessage

interface PartialSuccessMessageProps {
    execution: LlmTriggeredExecution
    actionConfiguration: Components.Schemas.GetWfConfigurationResponseDto
    templateConfigurations: TemplateConfiguration[]
}

const PartialSuccessMessage = ({
    execution,
    actionConfiguration,
    templateConfigurations,
}: PartialSuccessMessageProps) => {
    const url = useMemo(() => {
        const store = execution?.state?.store
        const configId = execution?.configuration_id

        if (!store?.type || !store?.name || !configId) return null

        let url = `/app/automation/${store?.type}/${store?.name}/ai-agent/actions/events/${configId}`
        if (execution?.id) {
            url += `?execution_id=${execution?.id}`
        }
        return url
    }, [execution])

    // Get the template configuration for this action
    const templateConfiguration = useMemo(() => {
        if (!actionConfiguration?.template_internal_id)
            return actionConfiguration
        return templateConfigurations?.find(
            (template) =>
                template.internal_id ===
                actionConfiguration?.template_internal_id,
        )
    }, [templateConfigurations, actionConfiguration])

    const steps = useMemo(
        () =>
            Object.entries(execution?.state.steps_state ?? {})
                .map(([stepId, value]) => ({
                    ...(value as ActionStepItem),
                    stepId,
                }))
                .filter((step) => step.kind !== 'end')
                .sort(
                    (a, b) =>
                        new Date(a.at).getTime() - new Date(b.at).getTime(),
                ),
        [execution],
    )

    // Separate into successful and failed steps
    const successfulSteps = steps.filter((step) => step.success)
    const failedSteps = steps.filter((step) => !step.success)

    // Format the list of successful steps with "and" between them
    const formatSuccessfulSteps = () => {
        if (successfulSteps.length === 0) return null

        return successfulSteps.map((step, index) => {
            const isLast = index === successfulSteps.length - 1
            const isSecondToLast = index === successfulSteps.length - 2

            return (
                <Fragment key={step.stepId}>
                    <StepWithIcon
                        step={step}
                        parentTemplateConfiguration={templateConfiguration}
                        templateConfigurations={templateConfigurations}
                    />
                    {isSecondToLast && successfulSteps.length > 1 && ' and '}
                    {!isLast && !isSecondToLast && ', '}
                </Fragment>
            )
        })
    }

    // Format the list of failed steps with "and" between them
    const formatFailedSteps = () => {
        if (failedSteps.length === 0) return null

        return failedSteps.map((step, index) => {
            const isLast = index === failedSteps.length - 1
            const isSecondToLast = index === failedSteps.length - 2

            return (
                <Fragment key={step.stepId}>
                    <StepWithIcon
                        step={step}
                        parentTemplateConfiguration={templateConfiguration}
                        templateConfigurations={templateConfigurations}
                    />
                    {isSecondToLast && failedSteps.length > 1 && ' and '}
                    {!isLast && !isSecondToLast && ', '}
                </Fragment>
            )
        })
    }

    // Construct the full message with the correct grammar
    return (
        <span>
            AI Agent did not send a response and handed over the ticket to your
            team.
            {successfulSteps.length > 0 && (
                <> It successfully executed {formatSuccessfulSteps()}</>
            )}
            {successfulSteps.length > 0 && failedSteps.length > 0 && (
                <>
                    , but failed to complete {formatFailedSteps()} in this
                    Action.
                </>
            )}
            {url && (
                <>
                    {' '}
                    <a href={url}>View the Actions events</a> for more details.
                </>
            )}
        </span>
    )
}

interface StepWithIconProps {
    step: ActionStepItem
    parentTemplateConfiguration?:
        | Components.Schemas.GetWfConfigurationResponseDto
        | TemplateConfiguration
    templateConfigurations?: TemplateConfiguration[]
}

const StepWithIcon = ({
    step,
    parentTemplateConfiguration,
    templateConfigurations,
}: StepWithIconProps) => {
    const isCustomAction = step.kind === 'http-request'
    const isReusableLLMPromptCall = step.kind === 'reusable-llm-prompt-call'
    const parentStep = useMemo(
        () =>
            parentTemplateConfiguration?.steps.find(
                (parentStep) => step.stepId === parentStep.id,
            ),
        [parentTemplateConfiguration, step.stepId],
    )

    const stepTemplateConfiguration = useMemo(() => {
        const configId =
            isReusableLLMPromptCall &&
            parentStep?.kind === 'reusable-llm-prompt-call' &&
            parentStep?.settings?.configuration_id

        return templateConfigurations?.find((config) =>
            configId
                ? config.id === configId
                : config.initial_step_id === step.stepId,
        )
    }, [
        templateConfigurations,
        step.stepId,
        isReusableLLMPromptCall,
        parentStep,
    ])

    const actionName = useMemo(() => {
        if (isCustomAction && parentStep?.kind === 'http-request') {
            return parentStep?.settings?.name
        }
        if (
            isReusableLLMPromptCall &&
            parentStep?.kind === 'reusable-llm-prompt-call'
        ) {
            return templateConfigurations?.find(
                (config) =>
                    config.id === parentStep?.settings?.configuration_id,
            )?.name
        }
        return isDefaultNodeKind(step.kind)
            ? defaultNodeNames[step.kind]
            : step.kind
    }, [
        isCustomAction,
        isReusableLLMPromptCall,
        parentStep,
        step.kind,
        templateConfigurations,
    ])

    const stepAppType = useMemo(() => {
        return (
            stepTemplateConfiguration?.apps?.[0] ??
            parentTemplateConfiguration?.apps?.[0]
        )
    }, [stepTemplateConfiguration, parentTemplateConfiguration])

    const appImageUrl = useGetAppImageUrl(stepAppType)

    return (
        <span className={css.stepWithIcon}>
            {appImageUrl && (
                <img src={appImageUrl} alt="" className={css.stepIcon} />
            )}
            <span className={css.stepName}>{actionName}</span>
        </span>
    )
}
