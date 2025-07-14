import React, { UIEventHandler, useCallback, useMemo, useState } from 'react'

import { Link } from 'react-router-dom'

import css from 'domains/reporting/pages/convert/components/CampaignTableStats/CampaignTableStats.less'
import { CampaignTableCell } from 'domains/reporting/pages/convert/components/CampaignTableStats/components/CampaignTableCell'
import { CampaignPerformanceConfig } from 'domains/reporting/pages/convert/components/CampaignTableStats/constants'
import { ITEMS_PER_PAGE } from 'domains/reporting/pages/convert/constants/campaignPerformanceTable'
import { useCampaignPerformanceTableSetting } from 'domains/reporting/pages/convert/hooks/useCampaignPerformanceTableSetting'
import { useSortedAndPaginatedTableRows } from 'domains/reporting/pages/convert/hooks/useSortedAndPaginatedTableRows'
import { CampaignTableColumn } from 'domains/reporting/pages/convert/types/CampaignTableColumn'
import { CampaignTableContentCell } from 'domains/reporting/pages/convert/types/CampaignTableContentCell'
import { CampaignTableKeys } from 'domains/reporting/pages/convert/types/enums/CampaignTableKeys.enum'
import { getDataFromTableCell } from 'domains/reporting/pages/convert/utils/getDataFromTableCell'
import useMeasure from 'hooks/useMeasure'
import { opposite, OrderDirection } from 'models/api/types'
import Navigation from 'pages/common/components/Navigation/Navigation'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { generateVariantName } from 'pages/convert/abVariants/utils/generateVariantName'
import { CampaignVariant } from 'pages/convert/campaigns/types/CampaignVariant'
import { useIsConvertPerformanceViewEnabled } from 'pages/convert/common/hooks/useIsConvertPerformanceViewEnabled'

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
    const [ref, { width }] = useMeasure<HTMLDivElement>()
    const isConvertPerformanceViewEnabled = useIsConvertPerformanceViewEnabled()
    const { isLoading: isLoadingConfiguration, columnsOrder: selectedColumns } =
        useCampaignPerformanceTableSetting()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const [orderKey, setOrderKey] = useState<CampaignTableKeys>(
        CampaignTableKeys.TotalRevenue,
    )
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(
        OrderDirection.Desc,
    )

    const columnsOrder: CampaignTableKeys[] = useMemo(() => {
        if (isConvertPerformanceViewEnabled) {
            return selectedColumns
        }

        return Object.keys(CampaignPerformanceConfig) as CampaignTableKeys[]
    }, [isConvertPerformanceViewEnabled, selectedColumns])

    const paginatedRows = useSortedAndPaginatedTableRows(rows, {
        orderKey,
        orderDirection,
        offset,
        page: ITEMS_PER_PAGE,
    })

    const [variantToggleState, setVariantToggleState] = useState<
        Record<string, boolean>
    >({})

    const handleClickHeaderCell = useCallback(
        (key: CampaignTableKeys) => {
            if (orderKey === key) {
                setOrderDirection((direction) =>
                    direction === OrderDirection.Asc
                        ? OrderDirection.Desc
                        : OrderDirection.Asc,
                )
            } else {
                setOrderKey(key)
                setOrderDirection(OrderDirection.Asc)
            }
        },
        [orderKey],
    )

    const renderHeaderCells = useCallback(
        (headerCell: CampaignTableColumn) => {
            // Ideally we shouldn't have to use the opposite function here
            // But I could not understand what was wrong with the sorting
            // logic here because the HeaderCellProperty component is used
            // in many places and it works fine
            const arrowDirection = opposite(orderDirection)
            return (
                <HeaderCellProperty
                    key={headerCell.key}
                    title={headerCell.title}
                    tooltip={headerCell?.hint?.title}
                    direction={arrowDirection}
                    isOrderedBy={orderKey === headerCell.key}
                    isSticky={
                        isTableScrolled && headerCell.key === 'campaignName'
                    }
                    className={
                        headerCell.className
                            ? css[headerCell.className]
                            : undefined
                    }
                    onClick={() => handleClickHeaderCell(headerCell.key)}
                />
            )
        },
        [handleClickHeaderCell, orderDirection, orderKey, isTableScrolled],
    )

    const renderCells = useCallback(
        (
            column: CampaignTableColumn,
            cell: CampaignTableContentCell,
            variantName?: string,
            variant?: CampaignVariant,
        ) => {
            const variantId = variantName
                ? variant
                    ? variant.id
                    : cell.campaign.id
                : undefined

            return (
                <CampaignTableCell
                    column={column}
                    cell={cell}
                    data={getDataFromTableCell(cell, column.key, variantId)}
                    isTableScrolled={isTableScrolled}
                    isLoading={isLoading}
                    variantId={variantId}
                    variantName={variantName}
                    variantToggleState={variantToggleState}
                    setVariantToggleState={setVariantToggleState}
                />
            )
        },
        [isLoading, isTableScrolled, variantToggleState],
    )

    const renderRows = useCallback(
        (cell: CampaignTableContentCell, index: number) => {
            return (
                <>
                    <TableBodyRow key={index}>
                        {columnsOrder.map((column) =>
                            renderCells(
                                CampaignPerformanceConfig[column],
                                cell,
                            ),
                        )}
                    </TableBodyRow>
                    {variantToggleState[cell.campaign.id] && (
                        <>
                            <TableBodyRow key={`variant-${cell.campaign.id}`}>
                                {columnsOrder.map((column) =>
                                    renderCells(
                                        CampaignPerformanceConfig[column],
                                        cell,
                                        'Control Variant',
                                    ),
                                )}
                            </TableBodyRow>
                            {(cell.campaign.variants ?? []).map(
                                (variant, variantIdx) => (
                                    <TableBodyRow
                                        key={`variant-${cell.campaign.id}-${variantIdx}`}
                                    >
                                        {columnsOrder.map((column) =>
                                            renderCells(
                                                CampaignPerformanceConfig[
                                                    column
                                                ],
                                                cell,
                                                generateVariantName(variantIdx),
                                                variant,
                                            ),
                                        )}
                                    </TableBodyRow>
                                ),
                            )}
                        </>
                    )}
                </>
            )
        },
        [renderCells, variantToggleState, columnsOrder],
    )

    const renderTableBody = useCallback(() => {
        if (isLoading === false && paginatedRows.length === 0) {
            if (typeof chatIntegrationId === 'number') {
                const url = `/app/convert/${chatIntegrationId}/campaigns/new`
                return (
                    <TableBodyRow>
                        <BodyCell
                            colSpan={
                                Object.values(CampaignPerformanceConfig).length
                            }
                        >
                            Start by
                            <Link
                                to={url}
                                style={{ marginLeft: 3, marginRight: 3 }}
                            >
                                creating
                            </Link>
                            a campaign for this store or update your filter
                            criteria!
                        </BodyCell>
                    </TableBodyRow>
                )
            }
            return (
                <TableBodyRow>
                    <BodyCell
                        colSpan={
                            Object.values(CampaignPerformanceConfig).length
                        }
                    >
                        This store is not associated with any chat integration!
                    </BodyCell>
                </TableBodyRow>
            )
        }
        return isLoading || isLoadingConfiguration
            ? paginatedRows.slice(0, ITEMS_PER_PAGE).map(renderRows)
            : paginatedRows.map(renderRows)
    }, [
        chatIntegrationId,
        isLoading,
        isLoadingConfiguration,
        paginatedRows,
        renderRows,
    ])

    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }

    return (
        <>
            <div ref={ref} className={css.container} onScroll={handleScroll}>
                <TableWrapper className={css.table} style={{ width }}>
                    <TableHead className={css.header}>
                        {columnsOrder.map((column) =>
                            renderHeaderCells(
                                CampaignPerformanceConfig[column],
                            ),
                        )}
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
        </>
    )
}
