import React, {useEffect} from 'react'

import classNames from 'classnames'
import Spinner from 'pages/common/components/Spinner'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import {OrderDirection} from 'models/api/types'
import useOrderBy from 'hooks/useOrderBy'
import {LlmTriggeredExecution} from '../types'
import ActionEventRow from './ActionEventRow'
import css from './ActionEventsList.less'

type Props = {
    isLoading: boolean
    executions?: LlmTriggeredExecution[]
    onChangeOrder: (orderBy: 'ASC' | 'DESC') => void
    selectedExecutionId: string | null
    onSelectedExecutionIdChange: (executionId: string) => void
}

export default function ActionEventsList({
    executions,
    onChangeOrder,
    isLoading,
    onSelectedExecutionIdChange,
    selectedExecutionId,
}: Props) {
    const {orderDirection, orderBy, toggleOrderBy} = useOrderBy<'updated'>(
        'updated',
        OrderDirection.Desc
    )

    const hasNoData = !isLoading && !executions?.length

    useEffect(() => {
        onChangeOrder(orderDirection === OrderDirection.Asc ? 'ASC' : 'DESC')
    }, [orderDirection, onChangeOrder])

    return (
        <div
            className={classNames(css.container, {
                [css.noData]: hasNoData,
            })}
        >
            <TableWrapper>
                <TableHead>
                    <HeaderCellProperty
                        title="LAST UPDATED"
                        direction={orderDirection}
                        isOrderedBy={orderBy === 'updated'}
                        onClick={() => {
                            toggleOrderBy('updated')
                        }}
                    />
                    <HeaderCellProperty title="STATUS" />
                    <HeaderCellProperty title="TICKET ID" />
                    <HeaderCell />
                </TableHead>
                <TableBody>
                    {!isLoading &&
                        executions?.map((execution) => (
                            <ActionEventRow
                                isSelected={
                                    selectedExecutionId === execution.id
                                }
                                onClick={onSelectedExecutionIdChange}
                                execution={execution}
                                key={execution.id}
                            />
                        ))}
                </TableBody>
            </TableWrapper>
            {isLoading && (
                <div className={css.spinner}>
                    <Spinner color="dark" />
                </div>
            )}
            {hasNoData && (
                <div className={css.noData}>
                    <p>No events found for the selected time period</p>
                    <p>
                        Once this Action has been performed, you can view each
                        event and its details
                    </p>
                </div>
            )}
        </div>
    )
}
