import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'

import { useKey } from '@repo/hooks'
import classnames from 'classnames'
import moment from 'moment'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import {
    useGetConfigurationExecution,
    useGetConfigurationExecutionLogs,
    useGetConfigurationExecutions,
    useGetWorkflowConfiguration,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SUPPORT_ACTIONS } from 'pages/aiAgent/constants'

import ActionEventsHeader from './components/ActionEventsHeader'
import ActionEventSidePanel from './components/ActionEventSidePanel'
import ActionEventsList from './components/ActionEventsList'
import ActionEventsNumberedPagination from './components/ActionEventsNumberedPagination'
import type { LlmTriggeredExecution } from './types'

import css from './ActionEventsView.less'

export type Filter = Omit<
    Parameters<typeof useGetConfigurationExecutions>[0],
    'configurationInternalId'
>

export default function ActionExecutionsView() {
    const location = useLocation()
    const history = useHistory()

    const queryParams = useMemo(
        () => new URLSearchParams(location.search),
        [location.search],
    )
    const initialUserJourneyId = useMemo(() => {
        const ticket = queryParams.get('ticket')

        if (!ticket) {
            return undefined
        }

        const parsedTicketId = Number(ticket)

        return Number.isFinite(parsedTicketId) ? parsedTicketId : undefined
    }, [queryParams])

    const [filterState, dispatchFilter] = useReducer(
        (state: Filter, action: Partial<Filter>): Filter => {
            return {
                ...state,
                ...action,
            }
        },
        {
            from: moment().subtract(1, 'week').toDate(),
            to: moment().toDate(),
            status: undefined,
            userJourneyId: initialUserJourneyId,
            orderBy: 'DESC',
            page: 1,
        },
    )

    const [selectedExecutionId, setSelectedExecutionId] = useState<
        string | null
    >(queryParams.get('execution_id'))

    useEffect(() => {
        const nextSearchParams = new URLSearchParams()

        if (selectedExecutionId) {
            nextSearchParams.set('execution_id', selectedExecutionId)
        }

        if (filterState.userJourneyId) {
            nextSearchParams.set('ticket', filterState.userJourneyId.toString())
        }

        history.replace({
            search: nextSearchParams.toString(),
        })
    }, [filterState.userJourneyId, history, selectedExecutionId])

    const { shopName, id: configurationId } = useParams<{
        id: string
        shopName: string
    }>()

    const { data: actionConfiguration, isFetching } =
        useGetWorkflowConfiguration(configurationId)

    const { data: executionsData, isFetching: isFechingExecutions } =
        useGetConfigurationExecutions(
            {
                configurationInternalId: actionConfiguration?.internal_id || '',
                from: filterState.from,
                orderBy: filterState.orderBy,
                page: filterState.page,
                to: filterState.to,
                status: filterState.status,
                userJourneyId: filterState.userJourneyId,
            },
            {
                enabled: !!actionConfiguration?.internal_id,
            },
        )

    const { data: httpExecutionLogs, isFetching: isFetchinghttpExecutionLogs } =
        useGetConfigurationExecutionLogs(
            actionConfiguration?.internal_id || '',
            selectedExecutionId || '',
            {
                enabled:
                    !!selectedExecutionId && !!actionConfiguration?.internal_id,
            },
        )

    const { data: execution, isFetching: isFetchingExecution } =
        useGetConfigurationExecution(
            actionConfiguration?.internal_id || '',
            selectedExecutionId || '',
            {
                enabled:
                    !!selectedExecutionId && !!actionConfiguration?.internal_id,
                initialData: executionsData?.data?.find(
                    (execution) => execution.id === selectedExecutionId,
                ),
            },
        )

    const handleFilterChange = useCallback(
        (filter: Pick<Filter, 'from' | 'to' | 'status' | 'userJourneyId'>) => {
            dispatchFilter(filter)
        },
        [dispatchFilter],
    )

    const handleChangeOrder = useCallback(
        (orderBy: 'DESC' | 'ASC') => {
            dispatchFilter({ orderBy })
        },
        [dispatchFilter],
    )

    const handleSelectedExecutionIdChange = useCallback(
        (executionId: string) => {
            setSelectedExecutionId(executionId)
        },
        [setSelectedExecutionId],
    )

    const {
        data: templateConfigurations,
        isInitialLoading: isTemplateConfigurationsLoading,
    } = useGetWorkflowConfigurationTemplates({
        triggers: ['llm-prompt', 'reusable-llm-prompt'],
    })

    useKey(
        'Escape',
        () => {
            setSelectedExecutionId(null)
        },
        undefined,
        [setSelectedExecutionId],
    )

    return (
        <AiAgentLayout
            isLoading={isFetching}
            shopName={shopName}
            className={classnames(css.container, css.actionLogsView)}
            title={SUPPORT_ACTIONS}
        >
            <ActionEventsHeader
                initialEndDate={filterState.to}
                initialStartDate={filterState.from}
                initialUserJourneyId={initialUserJourneyId}
                onChange={handleFilterChange}
            />
            <ActionEventsList
                selectedExecutionId={selectedExecutionId}
                onSelectedExecutionIdChange={handleSelectedExecutionIdChange}
                isLoading={isFechingExecutions}
                executions={executionsData?.data as LlmTriggeredExecution[]}
                onChangeOrder={handleChangeOrder}
            />
            <ActionEventsNumberedPagination
                page={executionsData?.meta.pagination.current_page}
                count={executionsData?.meta.pagination.total_pages}
                onChange={(page) => dispatchFilter({ page })}
            />

            <ActionEventSidePanel
                templateConfigurations={templateConfigurations}
                actionConfiguration={actionConfiguration}
                onClose={() => setSelectedExecutionId(null)}
                isLoading={
                    isFetchinghttpExecutionLogs ||
                    isFetchingExecution ||
                    isTemplateConfigurationsLoading
                }
                isOpen={!!selectedExecutionId}
                httpExecutionLogs={httpExecutionLogs}
                execution={execution as LlmTriggeredExecution}
            />
        </AiAgentLayout>
    )
}
