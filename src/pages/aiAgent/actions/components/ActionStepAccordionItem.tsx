import React, { useMemo } from 'react'

import { defaultNodeNames } from 'pages/automate/workflows/editor/visualBuilder/nodes/constants'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import { Components } from 'rest_api/workflows_api/client.generated'

import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import { ActionStepItem, TemplateConfiguration } from '../types'
import ActionEventTitle from './ActionEventTitle'
import HttpRequestLogsView from './HttpRequestLogsView'
import NoHttpRequestLogsView from './NoHttpRequestLogsView'

import css from './ActionStepAccordionItem.less'

function isDefaultNodeKind(
    kind: ActionStepItem['kind'],
): kind is keyof typeof defaultNodeNames {
    return kind in defaultNodeNames
}

export type ActionStepAccordionItemProps = {
    step: ActionStepItem
    httpExecutionLogs?: Components.Schemas.HttpRequestEventsResponseDto
    templateConfigurations?: TemplateConfiguration[]
    parentTemplateConfiguration?: TemplateConfiguration
}

const ActionStepAccordionItem = ({
    step,
    templateConfigurations,
    httpExecutionLogs,
    parentTemplateConfiguration,
}: ActionStepAccordionItemProps) => {
    const isCustomAction = step.kind === 'http-request'
    const isReusableLLMPromptCall = step.kind === 'reusable-llm-prompt-call'

    const shouldRenderChildAccordions = useMemo(
        () =>
            Object.values(step.steps_state ?? {}).filter(
                (state) => state.kind !== 'end',
            ).length > 1,
        [step],
    )
    const logs = useMemo(() => {
        return httpExecutionLogs?.filter((log) => {
            const childStep = Object.entries(step.steps_state ?? {}).filter(
                ([, state]) => state.kind !== 'end',
            )
            if (childStep.length === 1) {
                return log.step_id === childStep[0][0]
            }
            return log.step_id === step.stepId
        })
    }, [httpExecutionLogs, step])

    const templateConfiguration = useMemo(() => {
        if (isReusableLLMPromptCall) {
            const parentStep = parentTemplateConfiguration?.steps.find(
                (parentStep) => step.stepId === parentStep.id,
            )
            if (parentStep?.kind === 'reusable-llm-prompt-call') {
                const configId = parentStep?.settings?.configuration_id
                return templateConfigurations?.find(
                    (config) => config.id === configId,
                )
            }
        }
        return templateConfigurations?.find(
            (template) => template.initial_step_id === step.stepId,
        )
    }, [
        templateConfigurations,
        step.stepId,
        isReusableLLMPromptCall,
        parentTemplateConfiguration,
    ])
    const appImageUrl = useGetAppImageUrl(
        templateConfiguration?.apps?.[0] ??
            parentTemplateConfiguration?.apps?.[0],
    )

    const actionName = useMemo(() => {
        if (isCustomAction) {
            const parentStep = parentTemplateConfiguration?.steps.find(
                (parentStep) => step.stepId === parentStep.id,
            )
            if (parentStep?.kind === 'http-request') {
                return parentStep?.settings?.name
            }
        }
        if (isReusableLLMPromptCall) {
            const parentStep = parentTemplateConfiguration?.steps.find(
                (parentStep) => step.stepId === parentStep.id,
            )
            if (parentStep?.kind === 'reusable-llm-prompt-call') {
                const configId = parentStep?.settings?.configuration_id
                return templateConfigurations?.find(
                    (config) => config.id === configId,
                )?.name
            }
        }
        return isDefaultNodeKind(step.kind)
            ? defaultNodeNames[step.kind]
            : step.kind
    }, [
        isCustomAction,
        isReusableLLMPromptCall,
        parentTemplateConfiguration?.steps,
        step.kind,
        step.stepId,
        templateConfigurations,
    ])

    return shouldRenderChildAccordions ? (
        <div className={css.parentAccordionWrapper}>
            <div className={css.actionEventTitleWrapper}>
                <ActionEventTitle
                    isCustomAction={isCustomAction}
                    appImageUrl={appImageUrl}
                    appImageAlt={templateConfiguration?.apps?.[0]?.type}
                    title={actionName}
                />
            </div>
            <div className={css.childAccordionContainer}>
                {Object.entries(step.steps_state ?? {})
                    .filter(([__, state]) => state.kind !== 'end')
                    .sort(
                        ([, stateA], [, stateB]) =>
                            new Date(stateA.at).getTime() -
                            new Date(stateB.at).getTime(),
                    )
                    .map(([stepId, state]) => (
                        <ActionStepAccordionItem
                            key={stepId}
                            step={
                                {
                                    ...state,
                                    stepId,
                                } as ActionStepAccordionItemProps['step']
                            }
                            httpExecutionLogs={httpExecutionLogs}
                            templateConfigurations={templateConfigurations}
                            parentTemplateConfiguration={templateConfiguration}
                        />
                    ))}
            </div>
        </div>
    ) : (
        <AccordionItem id={step.stepId} highlightOnExpand={false}>
            <AccordionHeader>
                <ActionEventTitle
                    isCustomAction={isCustomAction}
                    appImageUrl={appImageUrl}
                    appImageAlt={templateConfiguration?.apps?.[0]?.type}
                    title={actionName}
                    status={step?.success ? 'success' : 'error'}
                />
            </AccordionHeader>
            <AccordionBody>
                {!logs || logs.length === 0 ? (
                    <NoHttpRequestLogsView step={step} />
                ) : (
                    <HttpRequestLogsView logs={logs} />
                )}
            </AccordionBody>
        </AccordionItem>
    )
}

export default ActionStepAccordionItem
