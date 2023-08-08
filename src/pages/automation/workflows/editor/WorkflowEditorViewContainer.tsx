import React, {useCallback, useMemo} from 'react'
import {Redirect, useHistory, useParams} from 'react-router-dom'
import {ulid} from 'ulidx'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
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
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const goToWorkflowsListPage = useCallback(() => {
        history.push(`/app/automation/${shopType}/${shopName}/flows`)
    }, [history, shopName, shopType])
    const goToWorkflowTemplatesPage = useCallback(() => {
        history.push(`/app/automation/${shopType}/${shopName}/flows/templates`)
    }, [history, shopName, shopType])
    const goToConnectedChannelsPage = useCallback(() => {
        history.push(
            `/app/automation/${shopType}/${shopName}/connected-channels`
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

    if (!hasAutomationAddOn) {
        return <Redirect to="/app/automation" />
    }

    return (
        <ErrorBoundary sentryTags={{section: 'workflows'}}>
            <WorkflowEditorView
                currentAccountId={currentAccountId}
                goToWorkflowsListPage={goToWorkflowsListPage}
                goToWorkflowTemplatesPage={goToWorkflowTemplatesPage}
                goToConnectedChannelsPage={goToConnectedChannelsPage}
                workflowId={workflowId}
                isNewWorkflow={isNewWorkflow}
                notifyMerchant={notifyMerchant}
                shopName={shopName}
                shopType={shopType}
            />
        </ErrorBoundary>
    )
}
