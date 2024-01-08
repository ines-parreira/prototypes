import React, {useCallback, useMemo} from 'react'
import {Redirect, useHistory, useParams} from 'react-router-dom'
import {ulid} from 'ulidx'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'
import {Notification} from 'state/notifications/types'
import {ErrorBoundary} from 'pages/ErrorBoundary'

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

    const isNewWorkflow = editWorkflowId == null
    const workflowId = useMemo(() => editWorkflowId ?? ulid(), [editWorkflowId])

    const notifyMerchant = useCallback(
        (message: Notification) => {
            void dispatch(notify(message))
        },
        [dispatch]
    )

    const handleFlowDraftCreated = useCallback(() => {
        history.push(
            `/app/automation/${shopType}/${shopName}/flows/edit/${workflowId}`
        )
    }, [history, shopName, shopType, workflowId])

    const handleFlowPublished = useCallback(
        (isFirstTimePublish: boolean) => {
            if (isFirstTimePublish) goToConnectedChannelsPage()
        },
        [goToConnectedChannelsPage]
    )

    const handleFlowDiscard = useCallback(
        (fromView: string | undefined) => {
            if (fromView === 'templates') goToWorkflowTemplatesPage()
            else goToWorkflowsListPage()
        },
        [goToWorkflowsListPage, goToWorkflowTemplatesPage]
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
                onDraftCreated={handleFlowDraftCreated}
                onPublish={handleFlowPublished}
                onDiscard={handleFlowDiscard}
                notifyMerchant={notifyMerchant}
                shopName={shopName}
                shopType={shopType}
            />
        </ErrorBoundary>
    )
}
