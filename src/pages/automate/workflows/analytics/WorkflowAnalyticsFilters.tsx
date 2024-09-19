import React, {useEffect, useState} from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import {useSearchParam} from 'hooks/useSearchParam'
import {getWorkflowAnalyticsDateRange} from 'pages/automate/workflows/analytics/visualBuilder/utils'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import {withSelfServiceStoreIntegrationContext} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {Notification} from 'state/notifications/types'
import {
    useWorkflowEditorContext,
    withWorkflowEditorContext,
} from '../hooks/useWorkflowEditor'

interface WorkflowAnalyticsFiltersProps {
    shopType: string
    shopName: string
    currentAccountId: number
    workflowId: string
    isNewWorkflow: boolean
    notifyMerchant: (message: Notification) => void
    children?: React.ReactNode
    notReadyFallback?: React.ReactNode
}

function WorkflowAnalyticsFiltersWrapped({
    children,
    notReadyFallback,
}: WorkflowAnalyticsFiltersProps) {
    const workflowEditorContext = useWorkflowEditorContext()

    const dispatch = useAppDispatch()
    const [startDatetime] = useSearchParam('start_datetime')
    const [endDatetime] = useSearchParam('end_datetime')

    const [hasCheckedInitialDateRange, setHasCheckedInitialDateRange] =
        useState(false)

    useEffect(() => {
        if (!workflowEditorContext.configuration.updated_datetime) return
        const dateFromQueryParams = getWorkflowAnalyticsDateRange({
            startDatetime: startDatetime,
            endDatetime: endDatetime,
            flowUpdateDatetime:
                workflowEditorContext.configuration.updated_datetime,
        })
        dispatch(mergeStatsFilters({period: dateFromQueryParams}))
        setHasCheckedInitialDateRange(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, workflowEditorContext.configuration])

    return <> {hasCheckedInitialDateRange ? children : notReadyFallback}</>
}

export default withSelfServiceStoreIntegrationContext(
    withWorkflowEditorContext(WorkflowAnalyticsFiltersWrapped)
)
