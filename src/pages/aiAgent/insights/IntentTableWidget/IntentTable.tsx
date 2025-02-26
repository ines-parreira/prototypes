import React, { UIEventHandler, useState } from 'react'

import classNames from 'classnames'
// eslint-disable-next-line no-restricted-imports
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import { useAIAgentInsightsDataset } from 'hooks/reporting/automate/useAIAgentInsightsDataset'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import useAppSelector from 'hooks/useAppSelector'
import useMeasure from 'hooks/useMeasure'
import {
    Intent,
    IntentTableColumn,
    PaginatedIntents,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import css from 'pages/common/components/table/cells/HeaderCellProperty.less'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import ChartCard from 'pages/stats/ChartCard'
import { AgentsHeaderCellContent } from 'pages/stats/support-performance/agents/AgentsHeaderCellContent'
import {
    getPaginatedIntents,
    isSortingMetricLoading,
    pageSet,
} from 'state/ui/stats/insightsSlice'
import { AIInsightsMetric } from 'state/ui/stats/types'

import { useGetCustomTicketsFieldsDefinitionData } from './hooks/useGetCustomTicketsFieldsDefinitionData'
import {
    IntentAutomationOpportunitiesCellContent,
    IntentAvgCsatCellContent,
    IntentDefaultCellContent,
    IntentNameCellContent,
    IntentResourcesCellContent,
    LoadingIntentCellContent,
} from './IntentTableCells'
import {
    getColumnContentAlignment,
    getColumnWidth,
    IntentsColumnsConfig,
    TableColumnsOrder,
    TableLabels,
    useIntentSortingQuery,
} from './IntentTableConfig'

import intentTableCss from './IntentTable.less'

const getSortingQuery = (
    column: IntentTableColumn,
    intentId?: string,
    intentLevel?: number,
) => {
    return () =>
        useIntentSortingQuery(
            column,
            useAIAgentInsightsDataset,
            intentId,
            intentLevel,
        )
}

export const IntentTable = ({
    paginatedIntents,
    intentLevel,
}: {
    paginatedIntents: PaginatedIntents
    intentLevel?: number
}) => {
    const dispatch = useDispatch()

    const [ref, { width }] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const { intents, allIntents, currentPage, perPage } = paginatedIntents

    const isSortingLoading = useAppSelector(isSortingMetricLoading)
    const aiAgentUserId = useAIAgentUserId()

    const { intentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    const { intentId } = useParams<{
        shopName: string
        intentId: string
    }>()
    const onPageChangeCallback = (page: number) => {
        dispatch(pageSet(page))
    }

    const getTableCellComponent = (column: IntentTableColumn) => {
        switch (column) {
            case IntentTableColumn.IntentName:
                return IntentNameCellContent
            case IntentTableColumn.AutomationOpportunities:
                return IntentAutomationOpportunitiesCellContent
            case IntentTableColumn.AvgCustomerSatisfaction:
                return IntentAvgCsatCellContent
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

    const getDrillDownMetricData = ({
        column,
        intent,
    }: {
        column: IntentTableColumn
        intent: Intent
    }) => {
        const intentName = intent[IntentTableColumn.IntentName]
        switch (column) {
            case IntentTableColumn.Tickets:
                return {
                    metricName: AIInsightsMetric.TicketCustomFieldsTicketCount,
                    title: intentName,
                    customFieldValue: [intent.id],
                    customFieldId: intentCustomFieldId ?? null,
                }
            case IntentTableColumn.AvgCustomerSatisfaction:
                return {
                    metricName:
                        AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
                    title: intentName,
                    perAgentId: aiAgentUserId,
                    intentFieldId: intentCustomFieldId ?? null,
                    intentFieldValues: [intent.id],
                    customFieldId: null,
                    customFieldValue: null,
                }
            default:
                return null
        }
    }

    return (
        <>
            <div ref={ref} className={css.container} onScroll={handleScroll}>
                <TableWrapper
                    className={classNames(
                        css.table,
                        intentTableCss.tableWrapper,
                    )}
                    style={{ width }}
                >
                    <TableHead>
                        {TableColumnsOrder.map((column, index) => (
                            <AgentsHeaderCellContent
                                key={`header-cell-${column}`}
                                title={TableLabels[column]}
                                hint={
                                    IntentsColumnsConfig[column]?.hint || null
                                }
                                useSortingQuery={getSortingQuery(
                                    column,
                                    intentId,
                                    intentLevel,
                                )}
                                width={getColumnWidth(column)}
                                className={classNames(
                                    css.BodyCell,
                                    css.right,
                                    intentTableCss.bodyCell,
                                    {
                                        [css.withShadow]:
                                            index === 0 && isTableScrolled,
                                    },
                                )}
                                justifyContent={getColumnContentAlignment(
                                    column,
                                )}
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        {!isSortingLoading ? (
                            intents.map((intent) => (
                                <TableBodyRow
                                    key={intent[IntentTableColumn.IntentName]}
                                >
                                    {TableColumnsOrder.map((column) => (
                                        <React.Fragment key={column}>
                                            {React.createElement(
                                                getTableCellComponent(column),
                                                {
                                                    intent,
                                                    column,
                                                    allIntents,
                                                    drillDownMetricData:
                                                        getDrillDownMetricData({
                                                            column,
                                                            intent,
                                                        }),
                                                    intentLevel,
                                                },
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
            {allIntents.length > perPage && (
                <div className={intentTableCss.pagination}>
                    <NumberedPagination
                        count={Math.ceil(allIntents.length / perPage)}
                        page={currentPage}
                        onChange={onPageChangeCallback}
                        className={css.pagination}
                    />
                </div>
            )}
        </>
    )
}

export const LoadingTableRows = () => {
    const numberOfLoadingRows = 4
    const loadingRows = Array.from(
        { length: numberOfLoadingRows },
        (_, index) => (
            <TableBodyRow key={`loading-row-${index}`}>
                {TableColumnsOrder.map((column) => (
                    <React.Fragment key={column}>
                        <LoadingIntentCellContent column={column} />
                    </React.Fragment>
                ))}
            </TableBodyRow>
        ),
    )
    return <>{loadingRows}</>
}

export const IntentTableWithDefaultState = ({
    tableTitle,
    tableHint,
    intentLevel,
}: {
    tableTitle: string
    tableHint?: {
        title: string
        link: string
        linkText: string
    }
    intentLevel?: number
}) => {
    const { intentId } = useParams<{
        shopName: string
        intentId: string
    }>()

    useIntentSortingQuery(
        IntentTableColumn.AutomationOpportunities,
        useAIAgentInsightsDataset,
        intentId,
        intentLevel,
    )

    const paginatedIntents = useAppSelector(getPaginatedIntents)
    const isSortingLoading = useAppSelector(isSortingMetricLoading)

    const shouldRemoveButtonBorder =
        paginatedIntents &&
        paginatedIntents?.allIntents.length <= paginatedIntents.perPage
    return (
        <div>
            <ChartCard
                title={tableTitle}
                hint={{
                    title: tableHint?.title,
                    link: tableHint?.link,
                    linkText: tableHint?.linkText,
                }}
                noPadding
                className={
                    shouldRemoveButtonBorder ? intentTableCss.noBorder : ''
                }
            >
                {(paginatedIntents && paginatedIntents.intents.length > 0) ||
                isSortingLoading ? (
                    <IntentTable
                        paginatedIntents={paginatedIntents}
                        intentLevel={intentLevel}
                    />
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
