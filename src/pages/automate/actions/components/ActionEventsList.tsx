import React, {useEffect} from 'react'

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
}

export default function ActionEventsList({
    executions,
    onChangeOrder,
    isLoading,
}: Props) {
    const {orderDirection, orderBy, toggleOrderBy} =
        useOrderBy<'updated'>('updated')

    useEffect(() => {
        onChangeOrder(orderDirection === OrderDirection.Asc ? 'ASC' : 'DESC')
    }, [orderDirection, onChangeOrder])

    return (
        <div className={css.container}>
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
            {!isLoading && !executions?.length && (
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
