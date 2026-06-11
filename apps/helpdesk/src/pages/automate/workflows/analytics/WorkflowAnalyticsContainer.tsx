/* istanbul ignore file */
import React, { useCallback } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { useEffectOnce } from '@gorgias/toolkit-react'

import { Skeleton, toast } from '@gorgias/axiom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useAppSelector } from 'hooks/useAppSelector'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { useAutomateBaseURL } from 'settings/automate/hooks/useAutomateBaseURL'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import type { Notification } from 'state/notifications/types'

import { WorkflowAnalytics } from './WorkflowAnalytics'
import { DefaultExportWorkflowAnalyticsFilters as WorkflowAnalyticsFilters } from './WorkflowAnalyticsFilters'

const PERFORMANCE_BY_FEATURE_ROUTE = 'stats-automate-performance-by-features'

export function WorkflowAnalyticsContainer() {
    const currentAccountId: number = useAppSelector(getCurrentAccountState).get(
        'id',
    )
    const { shopType, shopName, editWorkflowId } = useParams<{
        shopType: string
        shopName: string
        editWorkflowId: string
    }>()
    const history = useHistory()
    const location = useLocation<{ from?: string }>()
    const isAutomateSettings = useIsAutomateSettings()
    const { from } = location.state || {}

    const notifyMerchant = useCallback((message: Notification) => {
        const text = String(('message' in message ? message.message : '') || '')
        const status = 'status' in message ? message.status : undefined
        if (status === 'error') {
            toast.error(text)
        } else if (status === 'warning') {
            toast.warning(text)
        } else if (status === 'success') {
            toast.success(text)
        } else {
            toast.info(text)
        }
    }, [])

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
                team: SentryTeam.CPLT_ANALYTICS_FRONTEND,
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
