import {Skeleton} from '@gorgias/merchant-ui-kit'
import React, {useCallback} from 'react'
import {useHistory, useLocation, useParams} from 'react-router-dom'

import {SegmentEvent, logEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'

import {ErrorBoundary} from 'pages/ErrorBoundary'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'
import {Notification} from 'state/notifications/types'

import WorkflowAnalytics from './WorkflowAnalytics'
import WorkflowAnalyticsFilters from './WorkflowAnalyticsFilters'

const PERFORMANCE_BY_FEATURE_ROUTE = 'stats-automate-performance-by-features'

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
    const location = useLocation<{from?: string}>()
    const {from} = location.state || {}

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

    useEffectOnce(() => {
        logEvent(SegmentEvent.FlowBuilderViewed, {
            type: 'analytics',
            source:
                from === PERFORMANCE_BY_FEATURE_ROUTE ? 'analytics' : 'builder',
        })
    })

    return (
        <ErrorBoundary
            sentryTags={{
                section: 'workflow-analytics',
                team: 'automate-obs',
            }}
        >
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
