import type { UIEventHandler } from 'react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useEffectOnce, useMeasure } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { isEqual } from 'lodash'
import { useParams } from 'react-router-dom'

import { useAIAgentInsightsDataset } from 'domains/reporting/hooks/automate/useAIAgentInsightsDataset'
import { INTENT_LEVEL } from 'domains/reporting/hooks/automate/utils'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import css from 'domains/reporting/pages/common/components/Table/BreakdownTable.less'
import { AgentsHeaderCellContent } from 'domains/reporting/pages/support-performance/agents/AgentsHeaderCellContent'
import {
    getPaginatedIntents,
    isSortingMetricLoading,
    pageSet,
} from 'domains/reporting/state/ui/stats/insightsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type {
    Intent,
    PaginatedIntents,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import { IntentTableColumn } from 'pages/aiAgent/insights/IntentTableWidget/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import { TableBodyRowExpandable } from 'pages/common/components/table/TableBodyRowExpandable'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { sanitizeHtmlDefault } from 'utils/html'

import { useIntentQuery } from './hooks/useIntentQuery'
import { LoadingIntentCellContent } from './IntentTableCells'
import {
    getColumnContentAlignment,
    getColumnWidth,
    IntentsColumnsConfig,
    TableColumnsOrder,
    TableLabels,
    useIntentSortingQuery,
} from './IntentTableConfig'
import type { IntentTableExpandedRowContentProps } from './IntentTableExpandedRowContent'
import { IntentTableExpandedRowContent } from './IntentTableExpandedRowContent'

import intentTableCss from './IntentTable.less'

const getSortingQuery = (
    column: IntentTableColumn,
    shopName: string,
    intentId?: string,
    intentLevel?: number,
) => {
    return () =>
        useIntentSortingQuery(
            column,
            useAIAgentInsightsDataset,
            shopName,
            intentId,
            intentLevel,
        )
}

export const IntentTable = ({
    paginatedIntents,
    intentLevel,
}: {
    paginatedIntents: PaginatedIntents
    intentLevel: number
}) => {
    const dispatch = useAppDispatch()
    const { intents, allIntents, currentPage, perPage } = paginatedIntents

    const [ref, { width }] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const [selectedIntentId, setSelectedIntentId] = useState<string>()
    const [childrenDataMap, setChildrenDataMap] = useState<Record<string, any>>(
        {},
    )

    const isSortingLoading = useAppSelector(isSortingMetricLoading)

    const { intentId, shopName } = useParams<{
        shopName: string
        intentId: string
    }>()

    const childrenQuery = useIntentQuery(
        IntentTableColumn.SuccessRateUpliftOpportunity,
        shopName,
        selectedIntentId,
        intentLevel + 1,
        !!selectedIntentId,
    )

    useEffect(() => {
        if (!selectedIntentId) {
            return
        }

        const intentsArray = Array.isArray(childrenQuery.data)
            ? childrenQuery.data
            : []

        const newChildrenData = intentsArray.map((childIntent) => ({
            intent: childIntent,
            intentLevel: intentLevel + 1,
            allIntents: intentsArray,
            isTableScrolled,
            hasChildren: false,
            children: [],
            level: intentLevel,
        }))

        setChildrenDataMap((prevMap) => {
            const existing = prevMap[selectedIntentId] ?? {
                data: [],
                isLoading: false,
            }
            const next = {
                data: newChildrenData,
                isLoading: childrenQuery.isLoading,
            }

            const isUnchanged =
                isEqual(existing.data, next.data) &&
                existing.isLoading === next.isLoading

            return isUnchanged
                ? prevMap
                : {
                      ...prevMap,
                      [selectedIntentId]: next,
                  }
        })
    }, [
        childrenQuery.isLoading,
        childrenQuery.data,
        selectedIntentId,
        isTableScrolled,
        intentLevel,
    ])

    useEffectOnce(() => {
        logEvent(SegmentEvent.AiAgentOptimizePageChanged, {
            page: 1,
        })
    })

    const shouldLazyLoadChildren = useMemo(() => {
        return intentLevel === INTENT_LEVEL
    }, [intentLevel])

    const onLazyLoadChildren = useCallback(
        (intent: Intent) => {
            if (intentLevel === INTENT_LEVEL) {
                setSelectedIntentId(intent.id)

                logEvent(SegmentEvent.AiAgentOptimizeToggleClicked, {
                    intent: intent.id,
                })
            }
        },
        [intentLevel],
    )

    const onPageChangeCallback = (page: number) => {
        dispatch(pageSet(page))
        logEvent(SegmentEvent.AiAgentOptimizePageChanged, {
            page,
        })
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
            <div ref={ref} onScroll={handleScroll}>
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
                                    shopName,
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
                                colSpan={index === 0 ? 2 : 1}
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        {!isSortingLoading ? (
                            intents.map((intent) => {
                                return (
                                    <TableBodyRowExpandable<
                                        IntentTableExpandedRowContentProps,
                                        undefined
                                    >
                                        key={
                                            intent[IntentTableColumn.IntentName]
                                        }
                                        innerClassName={intentTableCss.small}
                                        rowContentProps={{
                                            intent,
                                            intentLevel,
                                            allIntents,
                                            isTableScrolled,
                                            hasChildren: true,
                                            children:
                                                childrenDataMap[intent.id]
                                                    ?.data || [],
                                        }}
                                        lazyLoadChildren={
                                            shouldLazyLoadChildren
                                        }
                                        onClickCallback={() =>
                                            onLazyLoadChildren(intent)
                                        }
                                        RowContentComponent={
                                            IntentTableExpandedRowContent
                                        }
                                        tableProps={undefined}
                                        SkeletonComponent={() => (
                                            <LoadingTableRows
                                                numberOfLoadingRows={1}
                                                intentLevel={
                                                    intentLevel
                                                        ? intentLevel + 1
                                                        : INTENT_LEVEL + 1
                                                }
                                            />
                                        )}
                                        isLoading={
                                            childrenDataMap[intent.id]
                                                ?.isLoading
                                        }
                                    />
                                )
                            })
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

export const LoadingTableRows = ({
    numberOfLoadingRows = 4,
    intentLevel,
}: {
    numberOfLoadingRows?: number
    intentLevel?: number
}) => {
    const loadingRows = Array.from(
        { length: numberOfLoadingRows },
        (_, index) => (
            <TableBodyRow key={`loading-row-${index}`}>
                {TableColumnsOrder.map((column) => (
                    <React.Fragment key={column}>
                        <LoadingIntentCellContent
                            column={column}
                            intentLevel={intentLevel}
                        />
                    </React.Fragment>
                ))}
            </TableBodyRow>
        ),
    )
    return <>{loadingRows}</>
}

export const IntentTableWithDefaultState = ({
    tableTitle,
    tableDescription,
    tableHint,
    intentLevel,
}: {
    tableTitle: string
    tableDescription?: string
    tableHint?: {
        title: string
        link: string
        linkText: string
    }
    intentLevel: number
}) => {
    const { intentId, shopName } = useParams<{
        shopName: string
        intentId: string
    }>()

    useIntentSortingQuery(
        IntentTableColumn.SuccessRateUpliftOpportunity,
        useAIAgentInsightsDataset,
        shopName,
        intentId,
        intentLevel,
    )

    const paginatedIntents = useAppSelector(getPaginatedIntents)
    const isSortingLoading = useAppSelector(isSortingMetricLoading)

    const shouldUseNoPagination =
        paginatedIntents &&
        paginatedIntents?.allIntents.length <= paginatedIntents.perPage

    const shouldRemoveButtonBorder =
        shouldUseNoPagination && paginatedIntents.intents.length !== 0

    return (
        <div
            className={classNames(intentTableCss.chartContainer, {
                [intentTableCss.chartContainerNoPagination]:
                    shouldUseNoPagination,
            })}
        >
            <ChartCard
                title={tableTitle}
                hint={tableHint}
                noPadding
                className={
                    shouldRemoveButtonBorder ? intentTableCss.noBorder : ''
                }
            >
                {tableDescription && (
                    <div
                        className={intentTableCss.tableDescription}
                        dangerouslySetInnerHTML={
                            typeof tableDescription === 'string'
                                ? {
                                      __html: sanitizeHtmlDefault(
                                          tableDescription,
                                      ),
                                  }
                                : undefined
                        }
                    ></div>
                )}
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
