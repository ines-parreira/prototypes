import React, { useCallback, useMemo } from 'react'

import { Redirect, useHistory, useLocation, useParams } from 'react-router-dom'
import { ulid } from 'ulidx'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { getHasAutomate } from 'state/billing/selectors'
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
    const hasAutomate = useAppSelector(getHasAutomate)
    const location = useLocation<{ from?: string }>()
    const { from } = location.state || {}

    const goToWorkflowsListPage = useCallback(() => {
        history.push(`/app/automation/${shopType}/${shopName}/flows`)
    }, [history, shopName, shopType])
    const goToWorkflowTemplatesPage = useCallback(() => {
        history.push(`/app/automation/${shopType}/${shopName}/flows/templates`)
    }, [history, shopName, shopType])

    const isNewWorkflow = editWorkflowId == null
    const workflowId = useMemo(() => editWorkflowId ?? ulid(), [editWorkflowId])

    const notifyMerchant = useCallback(
        (message: Notification) => {
            void dispatch(notify(message))
        },
        [dispatch],
    )

    const handleNewWorkflowCreated = useCallback(
        (isDraft) => {
            if (isDraft) {
                logActionOnFlowBuilder('draft')
            }
            history.replace(
                `/app/automation/${shopType}/${shopName}/flows/edit/${workflowId}`,
                {
                    doShowDisplayInChannels: !isDraft,
                },
            )
        },
        [history, shopName, shopType, workflowId],
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
            history.push({
                pathname: `/app/automation/${shopType}/${shopName}/flows/analytics/${editWorkflowId}`,
                search: params.toString(),
                state: { from: 'workflow-editor' },
            })
        },
        [history, shopType, shopName, editWorkflowId],
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

    if (!hasAutomate) {
        return <Redirect to="/app/automation" />
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
