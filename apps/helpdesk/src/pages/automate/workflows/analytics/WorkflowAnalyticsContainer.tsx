/* istanbul ignore file */
import React, { useCallback } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { Skeleton } from '@gorgias/axiom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { useAutomateBaseURL } from 'settings/automate/hooks/useAutomateBaseURL'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { Notification } from 'state/notifications/types'

import WorkflowAnalytics from './WorkflowAnalytics'
import WorkflowAnalyticsFilters from './WorkflowAnalyticsFilters'

const PERFORMANCE_BY_FEATURE_ROUTE = 'stats-automate-performance-by-features'

export default function WorkflowAnalyticsContainer() {
    const currentAccountId: number = useAppSelector(getCurrentAccountState).get(
        'id',
    )
    const { shopType, shopName, editWorkflowId } = useParams<{
        shopType: string
        shopName: string
        editWorkflowId: string
    }>()
    const dispatch = useAppDispatch()
    const history = useHistory()
    const location = useLocation<{ from?: string }>()
    const isAutomateSettings = useIsAutomateSettings()
    const { from } = location.state || {}

    const notifyMerchant = useCallback(
        (message: Notification) => {
            void dispatch(notify(message))
        },
        [dispatch],
    )

    const baseURL = useAutomateBaseURL()

    const goToWorkflowEditorPage = useCallback(() => {
        if (isAutomateSettings) {
            history.push(
                `${baseURL}/flows/${shopType}/${shopName}/edit/${editWorkflowId}`,
            )
        } else {
            history.push(
                `${baseURL}/${shopType}/${shopName}/flows/edit/${editWorkflowId}`,
            )
        }
    }, [
        history,
        shopName,
        shopType,
        editWorkflowId,
        baseURL,
        isAutomateSettings,
    ])

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
                team: SentryTeam.CRM_REPORTING,
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
