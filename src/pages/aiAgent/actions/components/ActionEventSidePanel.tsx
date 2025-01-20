import {Tooltip} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import React, {useMemo} from 'react'

import useKey from 'hooks/useKey'
import Accordion from 'pages/common/components/accordion/Accordion'
import IconButton from 'pages/common/components/button/IconButton'
import {Drawer} from 'pages/common/components/Drawer'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import {Components} from 'rest_api/workflows_api/client.generated'

import {
    LlmTriggeredExecution,
    HTTPExecutionLogs,
    TemplateConfiguration,
} from '../types'
import CollapsableVariables from './ActionEventsCollapsableVariables'
import css from './ActionEventSidePanel.less'
import ActionEventTitle from './ActionEventTitle'
import ActionStepAccordionItem, {
    ActionStepAccordionItemProps,
} from './ActionStepAccordionItem'

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
                actionConfiguration?.template_internal_id
        )
    }, [templateConfigurations, actionConfiguration])

    const isCustomAction = !actionConfiguration?.template_internal_id

    const hasVariables =
        Object.keys(execution?.state.objects?.customer || {}).length > 0 ||
        Object.keys(execution?.state.objects?.order || {}).length > 0 ||
        Object.keys(execution?.state.custom_inputs || {}).length > 0

    const steps = useMemo(() => {
        const arr: ActionStepAccordionItemProps['step'][] = []
        if (!execution) return []

        for (const [stepId, value] of Object.entries(
            execution.state.steps_state ?? {}
        )) {
            arr.push({
                ...value,
                stepId,
            } as ActionStepAccordionItemProps['step'])
        }
        return arr.filter((step) => step.kind !== 'end')
    }, [execution])

    useKey(
        'Escape',
        (event) => {
            event.stopPropagation()
            onClose()
        },
        undefined,
        [onClose]
    )

    const closeButtonId = 'close-button'

    return (
        <Drawer
            className={css.drawer}
            fullscreen={false}
            isLoading={isLoading}
            aria-label="Event details"
            open={isOpen}
            portalRootId="app-root"
        >
            <Drawer.Header className={css.drawerHeader}>
                <p className={css.title}>Event details</p>
                <Drawer.HeaderActions>
                    <IconButton
                        id={closeButtonId}
                        fillStyle="ghost"
                        intent="secondary"
                        onClick={onClose}
                    >
                        keyboard_tab
                    </IconButton>
                    <Tooltip placement="bottom-end" target={closeButtonId}>
                        <div className={css.closeButtonTooltip}>
                            <span>Close side panel</span>
                            <ShortcutIcon type="dark">esc</ShortcutIcon>
                        </div>
                    </Tooltip>
                </Drawer.HeaderActions>
            </Drawer.Header>
            <Drawer.Content className={css.drawerContent}>
                <ActionEventTitle
                    isCustomAction={isCustomAction}
                    title={actionConfiguration?.name}
                    badgeText={execution?.success ? 'success' : 'error'}
                    badgeSuccess={!!execution?.success}
                    hideFiller
                />
                {hasVariables && (
                    <div className={css.variablesContainer}>
                        <p>Variables</p>
                        <div
                            className={classnames(
                                css.variablesItems,
                                css.codeBlock
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
                <div className={css.actionStepsContainer}>
                    <p>Action steps</p>
                    <Accordion>
                        {steps?.map((step) => {
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
