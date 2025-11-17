import type { UIEventHandler } from 'react'
import React, { useState } from 'react'

import { useMeasure } from '@repo/hooks'
import classNames from 'classnames'

import { calculateDecile } from 'domains/reporting/hooks/ticket-insights/useCustomFieldsTicketCountPerCustomFields'
import type { TimeSeriesHook } from 'domains/reporting/hooks/useTimeSeries'
import css from 'domains/reporting/pages/common/components/Table/AnalyticsTable.less'
import { BusiestTimesOfDaysCellContent } from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDaysCellContent'
import type {
    BTODColumns,
    BusiestTimeOfDaysMetrics,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import {
    columnsOrder,
    isHourCell,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import { useAggregatedBusiestTimesOfDayData } from 'domains/reporting/pages/support-performance/busiest-times-of-days/useAggregatedBusiestTimesOfDayData'
import {
    get24Hours,
    getWorkingHoursInTimeZone,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/utils'
import useAppSelector from 'hooks/useAppSelector'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

export const hours = get24Hours()

export const BusiestTimesOfDaysTable = ({
    metricName,
    useMetricQuery,
    isHeatmapMode,
}: {
    metricName: BusiestTimeOfDaysMetrics
    useMetricQuery: TimeSeriesHook
    isHeatmapMode: boolean
}) => {
    const { btodData, max, isLoading, userTimezone } =
        useAggregatedBusiestTimesOfDayData(useMetricQuery)

    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }
    const [ref, { width }] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const getCellWidth = (field: BTODColumns) => {
        return field === 'HOUR' ? 90 : 170
    }

    const wh = useAppSelector(getBusinessHoursSettings)

    const workingHours = getWorkingHoursInTimeZone(wh, userTimezone)

    return (
        <div ref={ref} className={css.container} onScroll={handleScroll}>
            <TableWrapper
                className={classNames(css.table, css.compact)}
                style={{ width }}
            >
                <TableHead>
                    {columnsOrder.map((column, index) => (
                        <HeaderCellProperty
                            key={column.label}
                            title={column.label}
                            wrapContent
                            justifyContent={'center'}
                            width={getCellWidth(column.field)}
                            className={classNames(css.BodyCell, {
                                [css.withShadow]:
                                    index === 0 && isTableScrolled,
                            })}
                        />
                    ))}
                </TableHead>
                <TableBody>
                    {hours.map((hour) => (
                        <TableBodyRow key={hour}>
                            {columnsOrder.map((column) => (
                                <BusiestTimesOfDaysCellContent
                                    isLoading={isLoading}
                                    key={`${hour}-${column.label}`}
                                    metricName={metricName}
                                    metricValue={
                                        isHourCell(column.field)
                                            ? 0
                                            : btodData[hour][column.field]
                                    }
                                    day={column.field}
                                    hour={hour}
                                    decile={
                                        isHourCell(column.field)
                                            ? 0
                                            : calculateDecile(
                                                  btodData[hour][column.field],
                                                  max,
                                              )
                                    }
                                    isWorkingHour={Boolean(
                                        isHourCell(column.field)
                                            ? 0
                                            : workingHours[hour][column.field],
                                    )}
                                    width={getCellWidth(column.field)}
                                    isHeatmapMode={isHeatmapMode}
                                    className={classNames(css.BodyCell, {
                                        [css.withShadow]:
                                            isHourCell(column.field) &&
                                            isTableScrolled,
                                    })}
                                />
                            ))}
                        </TableBodyRow>
                    ))}
                </TableBody>
            </TableWrapper>
        </div>
    )
}
