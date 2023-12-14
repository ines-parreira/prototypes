import React, {UIEventHandler, useCallback, useState} from 'react'
import {Link} from 'react-router-dom'

import {OrderDirection} from 'models/api/types'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import Navigation from 'pages/common/components/Navigation/Navigation'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import useMeasure from 'hooks/useMeasure'

import {CampaignTableKeys} from '../../types/enums/CampaignTableKeys.enum'
import {CampaignTableColumn} from '../../types/CampaignTableColumn'
import {CampaignTableContentCell} from '../../types/CampaignTableContentCell'

import {ITEMS_PER_PAGE} from '../../constants/campaignPerformanceTable'

import {getDataFromTableCell} from '../../utils/getDataFromTableCell'

import {useSortedAndPaginatedTableRows} from '../../hooks/useSortedAndPaginatedTableRows'

import {CAMPAIGN_TABLE_CELLS} from './constants'

import {CampaignTableCell} from './components/CampaignTableCell'

import css from './CampaignTableStats.less'

type Props = {
    chatIntegrationId?: number
    rows: CampaignTableContentCell[]
    offset: number
    isLoading?: boolean
    onClickNextPage: () => void
    onClickPrevPage: () => void
}

export const CampaignTableStats = ({
    chatIntegrationId,
    rows,
    offset,
    isLoading,
    onClickNextPage,
    onClickPrevPage,
}: Props) => {
    const [ref, {width}] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const [orderKey, setOrderKey] = useState<CampaignTableKeys>(
        CampaignTableKeys.TotalRevenue
    )
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(
        OrderDirection.Desc
    )

    const paginatedRows = useSortedAndPaginatedTableRows(rows, {
        orderKey,
        orderDirection,
        offset,
        page: ITEMS_PER_PAGE,
    })

    const handleClickHeaderCell = useCallback(
        (key: CampaignTableKeys) => {
            if (orderKey === key) {
                setOrderDirection((direction) =>
                    direction === OrderDirection.Asc
                        ? OrderDirection.Desc
                        : OrderDirection.Asc
                )
            } else {
                setOrderKey(key)
                setOrderDirection(OrderDirection.Asc)
            }
        },
        [orderKey]
    )

    const renderHeaderCells = useCallback(
        (headerCell: CampaignTableColumn) => {
            return (
                <HeaderCellProperty
                    key={headerCell.key}
                    title={headerCell.title}
                    tooltip={headerCell?.tooltip}
                    direction={orderDirection}
                    isOrderedBy={orderKey === headerCell.key}
                    className={
                        headerCell.className
                            ? css[headerCell.className]
                            : undefined
                    }
                    onClick={() => handleClickHeaderCell(headerCell.key)}
                />
            )
        },
        [handleClickHeaderCell, orderDirection, orderKey]
    )

    const renderCells = useCallback(
        (column: CampaignTableColumn, cell: CampaignTableContentCell) => {
            return (
                <CampaignTableCell
                    column={column}
                    cell={cell}
                    data={getDataFromTableCell(cell, column.key)}
                    isTableScrolled={isTableScrolled}
                    isLoading={isLoading}
                />
            )
        },
        [isLoading, isTableScrolled]
    )

    const renderRows = useCallback(
        (cell: CampaignTableContentCell, index) => {
            return (
                <TableBodyRow key={index}>
                    {CAMPAIGN_TABLE_CELLS.map((column) =>
                        renderCells(column, cell)
                    )}
                </TableBodyRow>
            )
        },
        [renderCells]
    )

    const renderTableBody = useCallback(() => {
        if (isLoading === false && paginatedRows.length === 0) {
            if (typeof chatIntegrationId === 'number') {
                const url = `/app/settings/channels/gorgias_chat/${chatIntegrationId}/campaigns/new`
                return (
                    <TableBodyRow>
                        <BodyCell colSpan={CAMPAIGN_TABLE_CELLS.length}>
                            Start by
                            <Link
                                to={url}
                                style={{marginLeft: 3, marginRight: 3}}
                            >
                                creating
                            </Link>
                            a campaign for this store!
                        </BodyCell>
                    </TableBodyRow>
                )
            }
            return (
                <TableBodyRow>
                    <BodyCell colSpan={CAMPAIGN_TABLE_CELLS.length}>
                        This store is not associated with any chat integration!
                    </BodyCell>
                </TableBodyRow>
            )
        }
        return isLoading
            ? paginatedRows.slice(0, ITEMS_PER_PAGE).map(renderRows)
            : paginatedRows.map(renderRows)
    }, [chatIntegrationId, isLoading, paginatedRows, renderRows])

    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }

    return (
        <div className={css.wrapper}>
            <div className={css.header}>
                <p className={css.title}>Campaigns performance</p>
            </div>
            <div ref={ref} className={css.container} onScroll={handleScroll}>
                <TableWrapper className={css.table} style={{width}}>
                    <TableHead className={css.header}>
                        {CAMPAIGN_TABLE_CELLS.map(renderHeaderCells)}
                    </TableHead>
                    <TableBody>{renderTableBody()}</TableBody>
                </TableWrapper>
            </div>

            {rows.length > ITEMS_PER_PAGE && (
                <Navigation
                    className={css.pagination}
                    hasNextItems={offset + ITEMS_PER_PAGE < rows.length}
                    hasPrevItems={offset !== 0}
                    fetchNextItems={onClickNextPage}
                    fetchPrevItems={onClickPrevPage}
                />
            )}
        </div>
    )
}
