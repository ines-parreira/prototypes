import React, {useCallback, useMemo} from 'react'
import {Redirect, useHistory, useParams} from 'react-router-dom'
import {ulid} from 'ulidx'

import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'
import {Notification} from 'state/notifications/types'
import {ErrorBoundary} from 'pages/ErrorBoundary'

import {FeatureFlagKey} from 'config/featureFlags'
import WorkflowEditorView from './WorkflowEditorView'

export default function WorkflowEditorViewContainer() {
    const currentAccountId: number = useAppSelector(getCurrentAccountState).get(
        'id'
    )
    const {shopType, shopName, editWorkflowId} = useParams<{
        shopType: string
        shopName: string
        editWorkflowId: string
    }>()
    const history = useHistory()
    const dispatch = useAppDispatch()
    const hasAutomate = useAppSelector(getHasAutomate)

    const goToWorkflowsListPage = useCallback(() => {
        history.push(`/app/automation/${shopType}/${shopName}/flows`)
    }, [history, shopName, shopType])
    const goToWorkflowTemplatesPage = useCallback(() => {
        history.push(`/app/automation/${shopType}/${shopName}/flows/templates`)
    }, [history, shopName, shopType])
    const goToConnectedChannelsPage = useCallback(() => {
        history.push(
            `/app/automation/${shopType}/${shopName}/connected-channels`,
            {from: 'workflow-editor'}
        )
    }, [history, shopName, shopType])
    const isPublishFlowFromFlowBuilder =
        useFlags()[FeatureFlagKey.PublishFlowFromFlowBuilder]

    const isNewWorkflow = editWorkflowId == null
    const workflowId = useMemo(() => editWorkflowId ?? ulid(), [editWorkflowId])

    const notifyMerchant = useCallback(
        (message: Notification) => {
            void dispatch(notify(message))
        },
        [dispatch]
    )

    const handleNewWorkflowCreated = useCallback(
        (isDraft) => {
            history.replace(
                `/app/automation/${shopType}/${shopName}/flows/edit/${workflowId}`,
                {
                    doShowDisplayInChannels: !isDraft,
                }
            )
        },
        [history, shopName, shopType, workflowId]
    )

    const handleFlowPublished = useCallback(
        (isFirstTimePublish: boolean) => {
            if (isFirstTimePublish && !isPublishFlowFromFlowBuilder)
                goToConnectedChannelsPage()
        },
        [goToConnectedChannelsPage, isPublishFlowFromFlowBuilder]
    )

    const handleFlowDiscard = useCallback(
        (fromView: string | undefined) => {
            if (fromView === 'templates') goToWorkflowTemplatesPage()
            else goToWorkflowsListPage()
        },
        [goToWorkflowsListPage, goToWorkflowTemplatesPage]
    )

    const goToWorkflowAnalyticsPage = useCallback(
        (zoom: number) => {
            const params = new URLSearchParams({zoom: zoom.toString()})
            history.push({
                pathname: `/app/automation/${shopType}/${shopName}/flows/analytics/${editWorkflowId}`,
                search: params.toString(),
                state: {from: 'workflow-editor'},
            })
        },
        [history, shopType, shopName, editWorkflowId]
    )

    if (!hasAutomate) {
        return <Redirect to="/app/automation" />
    }

    return (
        <ErrorBoundary sentryTags={{section: 'workflows'}}>
            <WorkflowEditorView
                currentAccountId={currentAccountId}
                workflowId={workflowId}
                isNewWorkflow={isNewWorkflow}
                onNewWorkflowCreated={handleNewWorkflowCreated}
                onPublish={handleFlowPublished}
                onDiscard={handleFlowDiscard}
                notifyMerchant={notifyMerchant}
                shopName={shopName}
                shopType={shopType}
                goToWorkflowAnalyticsPage={goToWorkflowAnalyticsPage}
            />
        </ErrorBoundary>
    )
}
