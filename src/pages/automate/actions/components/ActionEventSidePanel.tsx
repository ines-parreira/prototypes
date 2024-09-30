import React from 'react'
import classnames from 'classnames'
import IconButton from 'pages/common/components/button/IconButton'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {Drawer} from 'pages/common/components/Drawer'
import webhooksIcon from 'assets/img/icons/webhooks.svg'
import {Components} from 'rest_api/workflows_api/client.generated'
import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import {
    LlmTriggeredExecution,
    HTTPExecutionLogs,
    TemplateConfiguration,
} from '../types'
import CollapsableVariables from './ActionEventsCollapsableVariables'
import css from './ActionEventSidePanel.less'

type Props = {
    actionConfiguration?: Components.Schemas.GetWfConfigurationResponseDto
    execution?: LlmTriggeredExecution
    httpExecutionLogs?: HTTPExecutionLogs
    templateConfiguration?: TemplateConfiguration
    isLoading: boolean
    isOpen: boolean
    onClose: () => void
}

export default function ActionEventSidePanel({
    isOpen,
    actionConfiguration,
    execution,
    httpExecutionLogs,
    templateConfiguration,
    isLoading,
    onClose,
}: Props) {
    const appImageUrl = useGetAppImageUrl(templateConfiguration?.apps?.[0])

    const isCustomAction = !actionConfiguration?.template_internal_id

    const hasVariables =
        Object.keys(execution?.state.objects?.customer || {}).length > 0 ||
        Object.keys(execution?.state.objects?.order || {}).length > 0 ||
        Object.keys(execution?.state.custom_inputs || {}).length > 0

    const failedSteps = Object.values(
        execution?.state?.steps_state || {}
    ).filter((step) => 'success' in step && !step.success)

    return (
        <Drawer
            className={css.drawer}
            fullscreen={false}
            isLoading={isLoading}
            aria-label="Event details"
            onBackdropClick={onClose}
            open={isOpen}
            portalRootId="app-root"
        >
            <Drawer.Header className={css.drawerHeader}>
                <p className={css.title}>Event details</p>
                <Drawer.HeaderActions>
                    <IconButton
                        fillStyle="ghost"
                        intent="secondary"
                        onClick={onClose}
                    >
                        keyboard_tab
                    </IconButton>
                </Drawer.HeaderActions>
            </Drawer.Header>
            <Drawer.Content className={css.drawerContent}>
                <div className={css.actionInfo}>
                    <div className={css.title}>
                        {isCustomAction ? (
                            <img src={webhooksIcon} alt={'webhooks'} />
                        ) : (
                            <>
                                {appImageUrl ? (
                                    <img
                                        className={css.appImageFiller}
                                        src={appImageUrl}
                                        alt={
                                            actionConfiguration?.apps?.[0].type
                                        }
                                    />
                                ) : (
                                    <div className={css.appImageFiller}></div>
                                )}
                            </>
                        )}
                        <p>{actionConfiguration?.name}</p>
                    </div>
                    <div className={css.status}>
                        <p>Status</p>
                        {execution?.success ? (
                            <Badge type={ColorType.LightSuccess}>success</Badge>
                        ) : (
                            <Badge type={ColorType.LightError}>error</Badge>
                        )}
                    </div>
                </div>
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

                {failedSteps.map((step, i) => {
                    if ('error' in step) {
                        return (
                            <div key={i} className={css.failedStepContainer}>
                                <div className={css.title}>
                                    <img src={webhooksIcon} alt={'webhooks'} />
                                    <p>HTTP request</p>
                                </div>
                                <pre className={css.codeBlock}>
                                    {JSON.stringify(step.error, null, 2)}
                                </pre>
                            </div>
                        )
                    }
                })}

                {httpExecutionLogs?.map((httpExecutionLog) => {
                    const responseHeader = JSON.parse(
                        httpExecutionLog.response_headers ?? '{}'
                    ) as Record<string, string>
                    const requestHeader = JSON.parse(
                        httpExecutionLog.request_headers ?? '{}'
                    ) as Record<string, string>
                    return (
                        <div
                            key={httpExecutionLog.id}
                            className={css.httpRequestContainer}
                        >
                            <div className={css.actionInfo}>
                                <div className={css.title}>
                                    <img src={webhooksIcon} alt={'webhooks'} />
                                    <p>HTTP request</p>
                                </div>
                                <div className={css.status}>
                                    <p>Status</p>
                                    <Badge
                                        type={
                                            httpExecutionLog.response_status_code <
                                            300
                                                ? ColorType.LightSuccess
                                                : ColorType.LightError
                                        }
                                    >
                                        {httpExecutionLog.response_status_code}
                                    </Badge>
                                </div>
                            </div>
                            <div className={css.executionLogs}>
                                <p>Request</p>
                                <ol>
                                    <li>
                                        <p>Method: </p>
                                        {httpExecutionLog.request_method}
                                    </li>
                                    <li>
                                        <p>URL: </p>
                                        {httpExecutionLog.request_url}
                                    </li>
                                    {Object.keys(requestHeader).length > 0 && (
                                        <li>
                                            <p>Headers</p>
                                            <ol>
                                                {Object.entries(
                                                    requestHeader
                                                ).map(([key, value]) => (
                                                    <li key={key}>
                                                        <p>{key}: </p>
                                                        {value}
                                                    </li>
                                                ))}
                                            </ol>
                                        </li>
                                    )}
                                </ol>
                                <div className={css.body}>
                                    <p>Body</p>
                                    <pre className={css.codeBlock}>
                                        {httpExecutionLog.request_body || ''}
                                    </pre>
                                </div>
                            </div>
                            <div className={css.executionLogs}>
                                <p>Response</p>
                                <ol>
                                    <li>
                                        <p>Status Code: </p>
                                        {httpExecutionLog.request_method}
                                    </li>
                                    {Object.keys(responseHeader).length > 0 && (
                                        <li>
                                            <p>Headers</p>
                                            <ol>
                                                {Object.entries(
                                                    responseHeader
                                                ).map(([key, value]) => (
                                                    <li key={key}>
                                                        <p>{key}: </p>
                                                        {value}
                                                    </li>
                                                ))}
                                            </ol>
                                        </li>
                                    )}
                                </ol>
                                <div className={css.body}>
                                    <p>Body</p>
                                    <pre className={css.codeBlock}>
                                        {httpExecutionLog.response_body || ''}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </Drawer.Content>
        </Drawer>
    )
}
