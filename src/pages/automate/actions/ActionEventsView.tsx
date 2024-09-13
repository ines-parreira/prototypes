import React, {useReducer, useCallback} from 'react'
import {useParams} from 'react-router-dom'
import moment from 'moment'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {
    useGetConfigurationExecutions,
    useGetWorkflowConfiguration,
} from 'models/workflows/queries'
import ActionEventsHeader from './components/ActionEventsHeader'
import ActionEventsList from './components/ActionEventsList'
import ActionEventsNumberedPagination from './components/ActionEventsNumberedPagination'

import {LlmTriggeredExecution} from './types'
import css from './ActionEventsView.less'

export type Filter = Omit<
    Parameters<typeof useGetConfigurationExecutions>[0],
    'configurationInternalId'
>

export default function ActionExecutionsView() {
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
            orderBy: 'DESC',
            page: 1,
        }
    )

    const {shopName, id: id} = useParams<{
        id: string
        shopName: string
    }>()

    const {data: configurationData, isFetching} = useGetWorkflowConfiguration({
        id,
    })

    const {data: executionsData, isFetching: isFechingExecutions} =
        useGetConfigurationExecutions(
            {
                configurationInternalId: configurationData?.internal_id || '',
                from: filterState.from,
                orderBy: filterState.orderBy,
                page: filterState.page,
                to: filterState.to,
                success: filterState.success,
            },
            {
                enabled: !!configurationData?.internal_id,
            }
        )

    const handleFilterChange = useCallback(
        (filter: Pick<Filter, 'from' | 'to' | 'success'>) => {
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

    return (
        <AiAgentLayout
            isLoading={isFetching}
            shopName={shopName}
            className={css.container}
        >
            <ActionEventsHeader
                initialEndDate={filterState.to}
                initialStartDate={filterState.from}
                onChange={handleFilterChange}
            />
            <ActionEventsList
                isLoading={isFechingExecutions}
                executions={executionsData?.data as LlmTriggeredExecution[]}
                onChangeOrder={handleChangeOrder}
            />
            <ActionEventsNumberedPagination
                page={executionsData?.meta.pagination.current_page}
                count={executionsData?.meta.pagination.total_pages}
                onChange={(page) => dispatchFilter({page})}
            />
        </AiAgentLayout>
    )
}
