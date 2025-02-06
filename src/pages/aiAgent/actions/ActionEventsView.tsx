import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import moment from 'moment'
import React, {
    useReducer,
    useCallback,
    useMemo,
    useEffect,
    useState,
} from 'react'
import {useParams, useLocation, useHistory} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import useKey from 'hooks/useKey'
import {
    useGetConfigurationExecutions,
    useGetWorkflowConfiguration,
    useGetConfigurationExecutionLogs,
    useGetConfigurationExecution,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import {AiAgentLayout} from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {ACTIONS, AI_AGENT} from 'pages/aiAgent/constants'

import css from './ActionEventsView.less'
import ActionEventsHeader from './components/ActionEventsHeader'
import ActionEventSidePanel from './components/ActionEventSidePanel'
import ActionEventsList from './components/ActionEventsList'
import ActionEventsNumberedPagination from './components/ActionEventsNumberedPagination'

import {LlmTriggeredExecution} from './types'

export type Filter = Omit<
    Parameters<typeof useGetConfigurationExecutions>[0],
    'configurationInternalId'
>

export default function ActionExecutionsView() {
    const location = useLocation()
    const history = useHistory()
    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    const queryParams = useMemo(
        () => new URLSearchParams(location.search),
        [location.search]
    )

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
            success: undefined,
            status: undefined,
            orderBy: 'DESC',
            page: 1,
        }
    )

    const [selectedExecutionId, setSelectedExecutionId] = useState<
        string | null
    >(queryParams.get('execution_id'))

    useEffect(() => {
        if (selectedExecutionId) {
            history.replace({
                search: new URLSearchParams({
                    execution_id: selectedExecutionId,
                }).toString(),
            })
        } else {
            history.replace({
                search: '',
            })
        }
    }, [history, location.pathname, queryParams, selectedExecutionId])

    const {shopName, id: configurationId} = useParams<{
        id: string
        shopName: string
    }>()

    const {data: actionConfiguration, isFetching} =
        useGetWorkflowConfiguration(configurationId)

    const {data: executionsData, isFetching: isFechingExecutions} =
        useGetConfigurationExecutions(
            {
                configurationInternalId: actionConfiguration?.internal_id || '',
                from: filterState.from,
                orderBy: filterState.orderBy,
                page: filterState.page,
                to: filterState.to,
                success: filterState.success,
                status: filterState.status,
            },
            {
                enabled: !!actionConfiguration?.internal_id,
            }
        )

    const {data: httpExecutionLogs, isFetching: isFetchinghttpExecutionLogs} =
        useGetConfigurationExecutionLogs(
            actionConfiguration?.internal_id || '',
            selectedExecutionId || '',
            {
                enabled:
                    !!selectedExecutionId && !!actionConfiguration?.internal_id,
            }
        )

    const {data: execution, isFetching: isFetchingExecution} =
        useGetConfigurationExecution(
            actionConfiguration?.internal_id || '',
            selectedExecutionId || '',
            {
                enabled:
                    !!selectedExecutionId && !!actionConfiguration?.internal_id,
                initialData: executionsData?.data?.find(
                    (execution) => execution.id === selectedExecutionId
                ),
            }
        )

    const handleFilterChange = useCallback(
        (filter: Pick<Filter, 'from' | 'to' | 'success' | 'status'>) => {
            dispatchFilter(filter)
        },
        [dispatchFilter]
    )

    const handleChangeOrder = useCallback(
        (orderBy: 'DESC' | 'ASC') => {
            dispatchFilter({orderBy})
        },
        [dispatchFilter]
    )

    const handleSelectedExecutionIdChange = useCallback(
        (executionId: string) => {
            setSelectedExecutionId(executionId)
        },
        [setSelectedExecutionId]
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
        [setSelectedExecutionId]
    )

    return (
        <AiAgentLayout
            isLoading={isFetching}
            shopName={shopName}
            className={classnames(css.container, css.actionLogsView)}
            title={isStandaloneMenuEnabled ? ACTIONS : AI_AGENT}
        >
            <ActionEventsHeader
                initialEndDate={filterState.to}
                initialStartDate={filterState.from}
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
                onChange={(page) => dispatchFilter({page})}
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
