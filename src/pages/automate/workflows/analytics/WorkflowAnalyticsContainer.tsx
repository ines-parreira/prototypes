import React, {useCallback} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import {ErrorBoundary} from 'pages/ErrorBoundary'
import {notify} from 'state/notifications/actions'
import {Notification} from 'state/notifications/types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import WorkflowAnalyticsFilters from './WorkflowAnalyticsFilters'
import WorkflowAnalytics from './WorkflowAnalytics'

export default function WorkflowAnalyticsContainer() {
    const currentAccountId: number = useAppSelector(getCurrentAccountState).get(
        'id'
    )
    const {shopType, shopName, editWorkflowId} = useParams<{
        shopType: string
        shopName: string
        editWorkflowId: string
    }>()
    const dispatch = useAppDispatch()
    const history = useHistory()

    const notifyMerchant = useCallback(
        (message: Notification) => {
            void dispatch(notify(message))
        },
        [dispatch]
    )

    const goToWorkflowEditorPage = useCallback(() => {
        history.push(
            `/app/automation/${shopType}/${shopName}/flows/edit/${editWorkflowId}`
        )
    }, [history, shopName, shopType, editWorkflowId])

    return (
        <ErrorBoundary sentryTags={{section: 'workflows'}}>
            <WorkflowAnalyticsFilters
                notReadyFallback={<Skeleton />}
                currentAccountId={currentAccountId}
                isNewWorkflow={false}
                workflowId={editWorkflowId}
                shopName={shopName}
                shopType={shopType}
                notifyMerchant={notifyMerchant}
            >
                <WorkflowAnalytics
                    workflowId={editWorkflowId}
                    shopName={shopName}
                    shopType={shopType}
                    notifyMerchant={notifyMerchant}
                    goToWorkflowEditorPage={goToWorkflowEditorPage}
                />
            </WorkflowAnalyticsFilters>
        </ErrorBoundary>
    )
}
