import classNames from 'classnames'
import React, {UIEventHandler, useState} from 'react'

import {useDispatch} from 'react-redux'

import useAppSelector from 'hooks/useAppSelector'
import useMeasure from 'hooks/useMeasure'
import {NumberedPagination} from 'pages/common/components/Paginations'
import css from 'pages/common/components/table/cells/HeaderCellProperty.less'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import ChartCard from 'pages/stats/ChartCard'
import {AgentsHeaderCellContent} from 'pages/stats/support-performance/agents/AgentsHeaderCellContent'

import {
    getPaginatedIntents,
    pageSet,
    isSortingMetricLoading,
} from 'state/ui/stats/insightsSlice'

import intentTableCss from './IntentTable.less'

import {
    IntentAutomationOpportunitiesCellContent,
    IntentDefaultCellContent,
    IntentNameCellContent,
    IntentResourcesCellContent,
    LoadingIntentCellContent,
} from './IntentTableCells'
import {
    getColumnWidth,
    IntentsColumnsConfig,
    TableColumnsOrder,
    TableLabels,
    useIntentSoringQuery,
} from './IntentTableConfig'
import {PaginatedIntents, IntentTableColumn} from './types'

const getSortingQuery = (column: IntentTableColumn) => {
    return () => useIntentSoringQuery(column)
}

export const IntentTable = ({
    paginatedIntents,
}: {
    paginatedIntents: PaginatedIntents
}) => {
    const dispatch = useDispatch()

    const [ref, {width}] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const {intents, allIntents, currentPage, perPage} = paginatedIntents

    const isSortingLoading = useAppSelector(isSortingMetricLoading)

    const onPageChangeCallback = (page: number) => {
        dispatch(pageSet(page))
    }

    const getTableCellComponent = (column: IntentTableColumn) => {
        switch (column) {
            case IntentTableColumn.IntentName:
                return IntentNameCellContent
            case IntentTableColumn.AutomationOpportunities:
                return IntentAutomationOpportunitiesCellContent
            case IntentTableColumn.Resources:
                return IntentResourcesCellContent
            default:
                return IntentDefaultCellContent
        }
    }

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
                <TableWrapper className={css.table} style={{width}}>
                    <TableHead>
                        {TableColumnsOrder.map((column, index) => (
                            <AgentsHeaderCellContent
                                key={`header-cell-${column}`}
                                title={TableLabels[column]}
                                hint={
                                    IntentsColumnsConfig[column]?.hint || null
                                }
                                useSortingQuery={getSortingQuery(
                                    column
                                    // statsFilters
                                )}
                                width={getColumnWidth(column)}
                                className={classNames(
                                    css.BodyCell,
                                    css.right,
                                    intentTableCss.bodyCell,
                                    {
                                        [css.withShadow]:
                                            index === 0 && isTableScrolled,
                                    }
                                )}
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        {!isSortingLoading ? (
                            intents.map((intent) => (
                                <TableBodyRow key={intent.id}>
                                    {TableColumnsOrder.map((column) => (
                                        <React.Fragment key={column}>
                                            {React.createElement(
                                                getTableCellComponent(column),
                                                {
                                                    intent,
                                                    column,
                                                    allIntents,
                                                }
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBodyRow>
                            ))
                        ) : (
                            <LoadingTableRows />
                        )}
                    </TableBody>
                </TableWrapper>
            </div>
            <div className={intentTableCss.pagination}>
                {allIntents.length > perPage && (
                    <NumberedPagination
                        count={Math.ceil(allIntents.length / perPage)}
                        page={currentPage}
                        onChange={onPageChangeCallback}
                        className={css.pagination}
                    />
                )}
            </div>
        </>
    )
}

export const LoadingTableRows = () => {
    const numberOfLoadingRows = 4
    const loadingRows = Array.from(
        {length: numberOfLoadingRows},
        (_, index) => (
            <TableBodyRow key={`loading-row-${index}`}>
                {TableColumnsOrder.map((column) => (
                    <React.Fragment key={column}>
                        <LoadingIntentCellContent column={column} />
                    </React.Fragment>
                ))}
            </TableBodyRow>
        )
    )
    return <>{loadingRows}</>
}

export const IntentTableWithDefaultState = ({
    tableTitle,
    tableHint,
}: {
    tableTitle: string
    tableHint?: string
}) => {
    const paginatedIntents = useAppSelector(getPaginatedIntents)

    return (
        <div>
            <ChartCard title={tableTitle} hint={{title: tableHint}} noPadding>
                {paginatedIntents && paginatedIntents.intents.length > 0 ? (
                    <IntentTable paginatedIntents={paginatedIntents} />
                ) : (
                    <div className={intentTableCss.noData}>
                        <div className={intentTableCss.noDataText}>
                            No data available
                        </div>
                        <div>Try adjusting filters to get results.</div>
                    </div>
                )}
            </ChartCard>
        </div>
    )
}
