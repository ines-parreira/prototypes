/* istanbul ignore file */
import React, { useCallback, useMemo } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { Redirect, useHistory, useLocation, useParams } from 'react-router-dom'
import { ulid } from 'ulidx'

import { logEvent, SegmentEvent } from 'common/segment'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { useAutomateBaseURL } from 'settings/automate/hooks/useAutomateBaseURL'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import { notify } from 'state/notifications/actions'
import { Notification } from 'state/notifications/types'

import WorkflowEditorView from './WorkflowEditorView'

const PERFORMANCE_BY_FEATURE_ROUTE = 'stats-automate-performance-by-features'

export default function WorkflowEditorViewContainer() {
    const { shopType, shopName, editWorkflowId } = useParams<{
        shopType: string
        shopName: string
        editWorkflowId: string
    }>()
    const history = useHistory()
    const dispatch = useAppDispatch()
    const { hasAccess } = useAiAgentAccess(shopName)
    const isAutomateSettings = useIsAutomateSettings()
    const location = useLocation<{ from?: string }>()
    const { from } = location.state || {}

    const baseURL = useAutomateBaseURL()

    const goToWorkflowsListPage = useCallback(() => {
        if (isAutomateSettings) {
            history.push(`${baseURL}/flows/${shopType}/${shopName}`)
        } else {
            history.push(`${baseURL}/${shopType}/${shopName}/flows`)
        }
    }, [history, shopName, shopType, baseURL, isAutomateSettings])

    const goToWorkflowTemplatesPage = useCallback(() => {
        if (isAutomateSettings) {
            history.push(`${baseURL}/flows/${shopType}/${shopName}/templates`)
        } else {
            history.push(`${baseURL}/${shopType}/${shopName}/flows/templates`)
        }
    }, [history, shopName, shopType, baseURL, isAutomateSettings])

    const isNewWorkflow = editWorkflowId == null
    const workflowId = useMemo(() => editWorkflowId ?? ulid(), [editWorkflowId])

    const notifyMerchant = useCallback(
        (message: Notification) => {
            void dispatch(notify(message))
        },
        [dispatch],
    )

    const handleNewWorkflowCreated = useCallback(
        (isDraft: boolean) => {
            if (isDraft) {
                logActionOnFlowBuilder('draft')
            }

            if (isAutomateSettings) {
                history.replace(
                    `${baseURL}/flows/${shopType}/${shopName}/edit/${workflowId}`,
                    {
                        doShowDisplayInChannels: !isDraft,
                    },
                )
            } else {
                history.replace(
                    `${baseURL}/${shopType}/${shopName}/flows/edit/${workflowId}`,
                    {
                        doShowDisplayInChannels: !isDraft,
                    },
                )
            }
        },
        [history, shopName, shopType, workflowId, baseURL, isAutomateSettings],
    )

    const handleFlowPublished = useCallback(() => {
        logActionOnFlowBuilder('publish')
    }, [])

    const handleFlowDiscard = useCallback(
        (fromView: string | undefined) => {
            if (fromView === 'templates') goToWorkflowTemplatesPage()
            else goToWorkflowsListPage()
        },
        [goToWorkflowsListPage, goToWorkflowTemplatesPage],
    )

    const goToWorkflowAnalyticsPage = useCallback(
        (zoom: number) => {
            const params = new URLSearchParams({ zoom: zoom.toString() })
            if (isAutomateSettings) {
                history.push({
                    pathname: `${baseURL}/flows/${shopType}/${shopName}/analytics/${editWorkflowId}`,
                    search: params.toString(),
                    state: { from: 'workflow-editor' },
                })
            } else {
                history.push({
                    pathname: `${baseURL}/${shopType}/${shopName}/flows/analytics/${editWorkflowId}`,
                    search: params.toString(),
                    state: { from: 'workflow-editor' },
                })
            }
        },
        [
            history,
            shopType,
            shopName,
            editWorkflowId,
            baseURL,
            isAutomateSettings,
        ],
    )

    useEffectOnce(() => {
        logEvent(SegmentEvent.FlowBuilderViewed, {
            type: 'builder',
            source:
                from === PERFORMANCE_BY_FEATURE_ROUTE ? 'analytics' : 'builder',
        })
    })

    const logActionOnFlowBuilder = (action: string) => {
        logEvent(SegmentEvent.FlowBuilderSaved, {
            type: action,
        })
    }

    if (!hasAccess) {
        return <Redirect to={baseURL} />
    }

    return (
        <ErrorBoundary sentryTags={{ section: 'workflows' }}>
            <WorkflowEditorView
                workflowId={workflowId}
                isNewWorkflow={isNewWorkflow}
                onNewWorkflowCreated={handleNewWorkflowCreated}
                onPublish={handleFlowPublished}
                onDiscard={handleFlowDiscard}
                notifyMerchant={notifyMerchant}
                shopName={shopName}
                shopType={shopType}
                goToWorkflowAnalyticsPage={goToWorkflowAnalyticsPage}
                logActionOnFlowBuilder={logActionOnFlowBuilder}
            />
        </ErrorBoundary>
    )
}
