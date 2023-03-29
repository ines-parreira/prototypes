import React, {useCallback} from 'react'
import {Redirect, useHistory, useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import WorkflowsView from './WorkflowsView'

export default function WorkflowsViewContainer() {
    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()
    const history = useHistory()
    const dispatch = useAppDispatch()
    const goToNewWorkflowPage = useCallback(() => {
        history.push(`${history.location.pathname}/new`)
    }, [history])

    const goToEditWorkflowPage = useCallback(
        (workflowId: string) => {
            history.push(`${history.location.pathname}/edit/${workflowId}`)
        },
        [history]
    )

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

    const quickResponsesUrl = `/app/automation/${shopType}/${shopName}/quick-responses`

    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    if (!hasAutomationAddOn) {
        return <Redirect to="/app/automation" />
    }

    return (
        <WorkflowsView
            shopName={shopName}
            shopType={shopType}
            goToNewWorkflowPage={goToNewWorkflowPage}
            goToEditWorkflowPage={goToEditWorkflowPage}
            quickResponsesUrl={quickResponsesUrl}
            notifyMerchant={notifyMerchant}
        />
    )
}
