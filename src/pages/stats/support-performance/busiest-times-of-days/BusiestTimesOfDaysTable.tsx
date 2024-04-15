import classNames from 'classnames'
import React, {UIEventHandler, useState} from 'react'
import {useAggregatedBusiestTimesOfDayData} from 'pages/stats/support-performance/busiest-times-of-days/useAggregatedBusiestTimesOfDayData'
import {calculateDecile} from 'hooks/reporting/useCustomFieldsTicketCountPerCustomFields'
import {TimeSeriesHook} from 'hooks/reporting/useTimeSeries'
import useMeasure from 'hooks/useMeasure'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import css from 'pages/stats/AgentsTable.less'
import {BusiestTimesOfDaysCellContent} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysCellContent'
import {
    BTODColumns,
    BusiestTimeOfDaysMetrics,
    columnsOrder,
    isHourCell,
} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {get24Hours} from 'pages/stats/support-performance/busiest-times-of-days/utils'

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
    const {btodData, max, isLoading} =
        useAggregatedBusiestTimesOfDayData(useMetricQuery)

    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }
    const [ref, {width}] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const getCellWidth = (field: BTODColumns) => {
        return field === 'HOUR' ? 90 : 170
    }

    return (
        <div ref={ref} className={css.container} onScroll={handleScroll}>
            <TableWrapper className={css.table} style={{width}}>
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
                                                  max
                                              )
                                    }
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
