import React, {useMemo} from 'react'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'

import useOrderBy from 'hooks/useOrderBy'
import {StoresWorkflowConfiguration} from '../types'
import css from './ActionsList.less'
import ActionsRow from './ActionsRow'

type Props = {
    actions: StoresWorkflowConfiguration
}

export default function ActionsList({actions}: Props) {
    const {orderDirection, orderBy, orderParam, toggleOrderBy} =
        useOrderBy<'updated'>('updated')

    const sortedActions = useMemo(() => {
        return [...actions].sort((a, b) => {
            if (!a.updated_datetime || !b.updated_datetime) {
                return 0
            }
            if (orderParam === 'updated:asc') {
                return a.updated_datetime > b.updated_datetime ? -1 : 1
            }
            if (orderParam === 'updated:desc') {
                return a.updated_datetime < b.updated_datetime ? -1 : 1
            }
            return 0
        })
    }, [actions, orderParam])

    return (
        <TableWrapper className={css.container}>
            <TableHead>
                <HeaderCellProperty title="NAME" />
                <HeaderCellProperty justifyContent="left" title="ACTION" />
                <HeaderCellProperty
                    justifyContent="center"
                    title="AVAILABLE FOR AI AGENT"
                />
                <HeaderCellProperty
                    justifyContent="right"
                    title="LAST UPDATED"
                    direction={orderDirection}
                    isOrderedBy={orderBy === 'updated'}
                    onClick={() => {
                        toggleOrderBy('updated')
                    }}
                />
                <HeaderCell />
            </TableHead>
            <TableBody>
                {sortedActions.map((action) => (
                    <ActionsRow action={action} key={action.id} />
                ))}
            </TableBody>
        </TableWrapper>
    )
}
