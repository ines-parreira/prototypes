import React, {useCallback} from 'react'
import {Redirect, useHistory, useParams} from 'react-router-dom'
import {ulid} from 'ulidx'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import WorkflowEditorView from './WorkflowEditorView'

export default function WorkflowEditorViewContainer() {
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

    const isNewWorkflow = editWorkflowId == null
    const workflowId = editWorkflowId ?? ulid()

    const notifyMerchant = useCallback(
        (message: string, kind: 'success' | 'error') => {
            void dispatch(
                notify({
                    message,
                    status:
                        kind === 'success'
                            ? NotificationStatus.Success
                            : NotificationStatus.Error,
                })
            )
        },
        [dispatch]
    )

    if (!hasAutomationAddOn) {
        return <Redirect to="/app/automation" />
    }

    return (
        <WorkflowEditorView
            goToWorkflowsListPage={goToWorkflowsListPage}
            workflowId={workflowId}
            isNewWorkflow={isNewWorkflow}
            notifyMerchant={notifyMerchant}
            shopName={shopName}
            shopType={shopType}
        />
    )
}
