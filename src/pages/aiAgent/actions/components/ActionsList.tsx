import React, { useMemo } from 'react'

import { useParams } from 'react-router-dom'

import useOrderBy from 'hooks/useOrderBy'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import StoreAppsProvider from '../providers/StoreAppsProvider'
import { StoresWorkflowConfiguration } from '../types'
import ActionsRow from './ActionsRow'

import css from './ActionsList.less'

type Props = {
    actions: StoresWorkflowConfiguration
}

export default function ActionsList({ actions }: Props) {
    const { shopName, shopType } = useParams<{
        shopType: 'shopify'
        shopName: string
    }>()
    const { orderDirection, orderBy, orderParam, toggleOrderBy } =
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
        <StoreAppsProvider storeName={shopName} storeType={shopType}>
            <TableWrapper>
                <TableHead>
                    <HeaderCellProperty
                        title="ACTION NAME"
                        className={css.name}
                    />
                    <HeaderCellProperty title="APPS" />
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
        </StoreAppsProvider>
    )
}
