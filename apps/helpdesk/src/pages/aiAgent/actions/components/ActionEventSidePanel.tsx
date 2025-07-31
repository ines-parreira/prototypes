import { useMemo } from 'react'

import classnames from 'classnames'

import Accordion from 'pages/common/components/accordion/Accordion'
import { Drawer } from 'pages/common/components/Drawer'
import { Components } from 'rest_api/workflows_api/client.generated'

import {
    ActionStepItem,
    HTTPExecutionLogs,
    LlmTriggeredExecution,
    TemplateConfiguration,
} from '../types'
import CollapsableVariables from './ActionEventsCollapsableVariables'
import ActionEventTitle from './ActionEventTitle'
import ActionStepAccordionItem, {
    ActionStepAccordionItemProps,
} from './ActionStepAccordionItem'

import css from './ActionEventSidePanel.less'

type Props = {
    actionConfiguration?: Components.Schemas.GetWfConfigurationResponseDto
    execution?: LlmTriggeredExecution
    httpExecutionLogs?: HTTPExecutionLogs
    templateConfigurations?: TemplateConfiguration[]
    isLoading: boolean
    isOpen: boolean
    onClose: () => void
}

export default function ActionEventSidePanel({
    isOpen,
    actionConfiguration,
    execution,
    httpExecutionLogs,
    templateConfigurations,
    isLoading,
    onClose,
}: Props) {
    const templateConfiguration = useMemo(() => {
        if (!actionConfiguration?.template_internal_id)
            return actionConfiguration as TemplateConfiguration
        return templateConfigurations?.find(
            (template) =>
                template.internal_id ===
                actionConfiguration?.template_internal_id,
        )
    }, [templateConfigurations, actionConfiguration])

    const isCustomAction = !actionConfiguration?.template_internal_id

    const hasInputVariables =
        Object.keys(execution?.state.objects?.customer || {}).length > 0 ||
        Object.keys(execution?.state.objects?.order || {}).length > 0 ||
        Object.keys(execution?.state.custom_inputs || {}).length > 0

    const steps = useMemo(() => {
        const arr: ActionStepAccordionItemProps['step'][] = []
        if (!execution) return []

        for (const [stepId, value] of Object.entries(
            execution.state.steps_state ?? {},
        )) {
            const transition = Object.entries(
                execution.state.transitions ?? {},
            ).find(([, transition]) => transition.to_step_id === stepId)?.[1]

            arr.push({
                ...value,
                transition,
                stepId,
            } as ActionStepAccordionItemProps['step'])
        }
        return arr.filter((step) => step.kind !== 'end')
    }, [execution])

    const closeButtonId = 'close-button'

    const sortedSteps = useMemo(
        () =>
            steps.sort((a, b) => {
                return new Date(a.at).getTime() - new Date(b.at).getTime()
            }),
        [steps],
    )

    const actionOutputs = useMemo(() => {
        const combinedOutputs = {}
        function recurse(stepsState: ActionStepItem['steps_state']) {
            if (!stepsState) return
            for (const [, state] of Object.entries(stepsState)) {
                if (state.kind === 'reusable-llm-prompt-call') {
                    Object.assign(combinedOutputs, state.outputs)
                    state.steps_state &&
                        recurse(
                            state.steps_state as ActionStepItem['steps_state'],
                        )
                }
            }
        }
        execution && recurse(execution.state?.steps_state)
        return Object.keys(combinedOutputs).length ? combinedOutputs : null
    }, [execution])

    return (
        <Drawer
            fullscreen={false}
            isLoading={isLoading}
            aria-label="Event details"
            open={isOpen}
            portalRootId="app-root"
            onBackdropClick={onClose}
        >
            <Drawer.Header className={css.drawerHeader}>
                <p className={css.title}>Event details</p>
                <Drawer.HeaderActions
                    onClose={onClose}
                    closeButtonId={closeButtonId}
                />
            </Drawer.Header>
            <Drawer.Content className={css.drawerContent}>
                <ActionEventTitle
                    isCustomAction={isCustomAction}
                    title={actionConfiguration?.name}
                    hideFiller
                    status={execution?.status}
                />
                {hasInputVariables && (
                    <div className={css.variablesContainer}>
                        <p>Input Variables</p>
                        <div
                            className={classnames(
                                css.variablesItems,
                                css.codeBlock,
                            )}
                        >
                            <CollapsableVariables
                                title="Customer"
                                body={execution?.state.objects?.customer}
                            />
                            <CollapsableVariables
                                title="Order"
                                body={execution?.state.objects?.order}
                            />
                            <CollapsableVariables
                                title="Custom variables"
                                body={execution?.state.custom_inputs}
                            />
                        </div>
                    </div>
                )}
                {actionOutputs && (
                    <div className={css.variablesContainer}>
                        <p>Output Variables</p>
                        <div
                            className={classnames(
                                css.variablesItems,
                                css.codeBlock,
                            )}
                        >
                            <CollapsableVariables
                                title="Outputs"
                                body={actionOutputs}
                            />
                        </div>
                    </div>
                )}
                <div className={css.actionStepsContainer}>
                    <p>Action steps</p>
                    <Accordion>
                        {sortedSteps?.map((step) => {
                            return (
                                <ActionStepAccordionItem
                                    key={step.at}
                                    step={step}
                                    httpExecutionLogs={httpExecutionLogs}
                                    templateConfigurations={
                                        templateConfigurations
                                    }
                                    parentTemplateConfiguration={
                                        templateConfiguration
                                    }
                                />
                            )
                        })}
                    </Accordion>
                </div>
            </Drawer.Content>
        </Drawer>
    )
}
