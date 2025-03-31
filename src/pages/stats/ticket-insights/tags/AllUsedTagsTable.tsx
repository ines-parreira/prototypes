import React, { UIEventHandler, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'
import { fromJS } from 'immutable'

import { Tag } from '@gorgias/api-queries'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { calculateDecile } from 'hooks/reporting/ticket-insights/useCustomFieldsTicketCountPerCustomFields'
import { useTicketCountPerTag } from 'hooks/reporting/ticket-insights/useTicketCountPerTag'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import useMeasure from 'hooks/useMeasure'
import { opposite, OrderDirection } from 'models/api/types'
import { AggregationWindow } from 'models/stat/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TicketTag from 'pages/common/components/TicketTag'
import css from 'pages/stats/BreakdownTable.less'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import heatmapCss from 'pages/stats/heatmap.less'
import { getTagName } from 'pages/stats/ticket-insights/tags/helpers'
import { LoadingRow } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTable'
import {
    formatDates,
    getUtcPeriodFromDateAndGranularity,
} from 'pages/stats/utils'
import { TagsMetric, ValueMode } from 'state/ui/stats/types'
import { calculatePercentage } from 'utils/reporting'

export const TAG_COLUMN_LABEL = 'Tag name'
const TOTAL_COLUMN_LABEL = 'Total'
const TAGS_PER_PAGE = 15

export const AllUsedTagsTable = ({
    heatmapMode,
    valueMode,
}: {
    heatmapMode: boolean
    valueMode: ValueMode
}) => {
    const { granularity } = useStatsFilters()
    const [currentPage, setCurrentPage] = useState(1)
    const [ref, { width }] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }
    const {
        data,
        grandTotal,
        columnTotals,
        dateTimes,
        isLoading,
        order,
        setOrdering,
    } = useTicketCountPerTag()

    useEffect(() => {
        setCurrentPage(1)
    }, [data.length])

    const currentPageOfData = useMemo(() => {
        return data.slice(
            (currentPage - 1) * TAGS_PER_PAGE,
            currentPage * TAGS_PER_PAGE,
        )
    }, [currentPage, data])

    const hasPagination = data.length >= TAGS_PER_PAGE

    return (
        <>
            <div
                ref={ref}
                className={classNames(css.tagsTableContainer, {
                    [css.withPagination]: hasPagination,
                })}
                onScroll={handleScroll}
            >
                <TableWrapper className={css.table} style={{ width }}>
                    <TableHead>
                        <HeaderCellProperty
                            title={TAG_COLUMN_LABEL}
                            className={classNames(
                                {
                                    [css.withShadow]: isTableScrolled,
                                },
                                css.categoryHeader,
                            )}
                            direction={opposite(order.direction)}
                            isOrderedBy={order.column === 'tag'}
                            onClick={() => setOrdering('tag')}
                        />
                        <HeaderCellProperty
                            title={TOTAL_COLUMN_LABEL}
                            justifyContent={'right'}
                            className={classNames(css.BodyCell)}
                            wrapContent={true}
                            direction={opposite(order.direction)}
                            isOrderedBy={order.column === 'total'}
                            onClick={() => setOrdering('total')}
                        />
                        {dateTimes.map((dateTime, index) => (
                            <HeaderCellProperty
                                key={dateTime}
                                title={formatDates(granularity, dateTime)}
                                justifyContent={'right'}
                                wrapContent={true}
                                className={classNames(css.dateTimeHeader)}
                                direction={
                                    order.direction === OrderDirection.Asc
                                        ? OrderDirection.Desc
                                        : OrderDirection.Asc
                                }
                                isOrderedBy={order.column === index}
                                onClick={() => setOrdering(index)}
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        {isLoading
                            ? Array.from(Array(TAGS_PER_PAGE)).map(
                                  (_, index) => (
                                      <LoadingRow
                                          key={index}
                                          dateTimes={dateTimes}
                                          isTableScrolled={isTableScrolled}
                                      />
                                  ),
                              )
                            : currentPageOfData.map((row) => (
                                  <TableRow
                                      key={row.tagId}
                                      {...row}
                                      granularity={granularity}
                                      isTableScrolled={isTableScrolled}
                                      isHeatmapMode={heatmapMode}
                                      valueMode={valueMode}
                                      grandTotal={grandTotal}
                                      columnTotals={columnTotals}
                                  />
                              ))}
                    </TableBody>
                </TableWrapper>
            </div>
            <div>
                {hasPagination && (
                    <NumberedPagination
                        count={Math.ceil(data.length / TAGS_PER_PAGE)}
                        page={currentPage}
                        onChange={setCurrentPage}
                        className={css.pagination}
                    />
                )}
            </div>
        </>
    )
}

const format = (valueMode: ValueMode) => (value: number) =>
    formatMetricValue(
        value !== 0 ? value : null,
        valueMode === ValueMode.Percentage ? 'percent-refined' : 'integer',
        NOT_AVAILABLE_PLACEHOLDER,
    )

const TableRow = ({
    tagId,
    tag,
    total,
    timeSeries,
    isTableScrolled,
    granularity,
    isHeatmapMode,
    valueMode,
    grandTotal,
    columnTotals,
}: {
    tagId: string
    tag?: Tag
    total: number
    timeSeries: TimeSeriesDataItem[]
    isTableScrolled: boolean
    granularity: AggregationWindow
    isHeatmapMode: boolean
    valueMode: ValueMode
    grandTotal: number
    columnTotals: number[]
}) => {
    return (
        <TableBodyRow>
            <BodyCell
                className={classNames(
                    { [css.withShadow]: isTableScrolled },
                    css.sticky,
                    css.categoryColumn,
                )}
                innerClassName={css.small}
            >
                {tag ? (
                    <TicketTag
                        text={tag?.name}
                        decoration={fromJS(tag?.decoration)}
                    />
                ) : (
                    getTagName({ id: tagId })
                )}
            </BodyCell>
            <BodyCell
                className={classNames(css.BodyCell)}
                innerClassName={classNames(css.BodyCellContent)}
                isHighlighted={true}
                justifyContent={'right'}
            >
                <DrillDownModalTrigger
                    enabled={total !== 0}
                    highlighted
                    metricData={{
                        title: getTagName({ name: tag?.name, id: tagId }),
                        tagId: tagId,
                        metricName: TagsMetric.TicketCount,
                    }}
                >
                    {format(valueMode)(
                        valueMode === ValueMode.TotalCount
                            ? total
                            : calculatePercentage(total, grandTotal),
                    )}
                </DrillDownModalTrigger>
            </BodyCell>
            {timeSeries.map((data, index) => (
                <BodyCell
                    key={data.dateTime}
                    className={classNames(
                        css.BodyCell,
                        isHeatmapMode && [heatmapCss.heatmap],
                        isHeatmapMode &&
                            heatmapCss[
                                `p${calculateDecile(data.value, total)}`
                            ],
                    )}
                    innerClassName={classNames(
                        css.BodyCellContent,
                        data.value === 0 && css.emptyValue,
                    )}
                    justifyContent={'right'}
                >
                    <DrillDownModalTrigger
                        enabled={data.value !== 0}
                        metricData={{
                            title: `${getTagName({ name: tag?.name, id: tagId })} | ${formatDates(
                                granularity,
                                data.dateTime,
                            )}`,
                            tagId: tagId,
                            metricName: TagsMetric.TicketCount,
                            dateRange: getUtcPeriodFromDateAndGranularity(
                                data.dateTime,
                                granularity,
                            ),
                        }}
                    >
                        {format(valueMode)(
                            valueMode === ValueMode.TotalCount
                                ? data.value
                                : calculatePercentage(
                                      data.value,
                                      columnTotals[index],
                                  ),
                        )}
                    </DrillDownModalTrigger>
                </BodyCell>
            ))}
        </TableBodyRow>
    )
}
