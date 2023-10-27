import classNames from 'classnames'
import moment from 'moment/moment'
import React, {UIEventHandler, useEffect, useMemo, useState} from 'react'
import useMeasure from 'react-use/lib/useMeasure'
import {useCustomFieldsTicketCountPerCustomFields} from 'hooks/reporting/useCustomFieldsTicketCountPerCustomFields'
import {BREAKDOWN_FIELD} from 'hooks/reporting/withBreakdown'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {OrderDirection} from 'models/api/types'
import {ReportingGranularity} from 'models/reporting/types'
import {NumberedPagination} from 'pages/common/components/Paginations'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import {TableBodyRowExpandable} from 'pages/common/components/table/TableBodyRowExpandable'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import css from 'pages/stats/BreakdownTable.less'
import {getFormat} from 'pages/stats/common/utils'
import {
    CustomFieldsTicketCountDataRowContent,
    DataRowProps,
} from 'pages/stats/CustomFieldsTicketCountDataRowContent'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {setOrder, TicketInsightsOrder} from 'state/ui/stats/ticketInsightsSlice'
import {
    MONTH_AND_YEAR_SHORT,
    SHORT_DATE_FORMAT_US,
    SHORT_DATE_FORMAT_WORLD,
    SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_US,
    SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_WORLD,
} from 'utils/date'

export const CUSTOM_FIELD_COLUMN_LABEL = 'Value / Category'
export const TOTAL_COLUMN_LABEL = 'Total'
export const CUSTOM_FIELDS_PER_PAGE = 15
const CATEGORY_COLUMN_WIDTH = 250
const DATA_COLUMN_WIDTH = 120

export const formatDates = (
    granularity: ReportingGranularity,
    dateTime: string
) => {
    const date = moment(dateTime)
    let format = getFormat(granularity)
    const isUsFormat = window.navigator.language === 'en-US'

    switch (granularity) {
        case ReportingGranularity.Day:
            format = isUsFormat
                ? SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_US
                : SHORT_DATE_WITH_DAY_OF_THE_WEEK_FORMAT_WORLD
            break
        case ReportingGranularity.Week:
            format = isUsFormat ? SHORT_DATE_FORMAT_US : SHORT_DATE_FORMAT_WORLD
            break
        case ReportingGranularity.Month:
            format = MONTH_AND_YEAR_SHORT
            break
    }

    if (granularity === ReportingGranularity.Week) {
        return `${date
            .clone()
            .subtract(6, 'days')
            .format(format)} - ${date.format(format)}`
    }

    return date.format(format)
}

export const CustomFieldsTicketCountBreakdownTable = ({
    selectedCustomFieldId,
}: {
    selectedCustomFieldId: number
}) => {
    const [currentPage, setCurrentPage] = useState(1)
    const [ref, {width}] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }

    const dispatch = useAppDispatch()
    const setOrdering = (column: TicketInsightsOrder['column']) =>
        dispatch(setOrder({column}))

    const {granularity} = useAppSelector(getCleanStatsFiltersWithTimezone)
    const {
        data: customFieldDataRows,
        dateTimes,
        isLoading,
        order,
    } = useCustomFieldsTicketCountPerCustomFields(selectedCustomFieldId)

    useEffect(() => {
        setCurrentPage(1)
    }, [customFieldDataRows.length])

    const currentPageOfCustomFieldDataRows = useMemo(() => {
        return customFieldDataRows.slice(
            (currentPage - 1) * CUSTOM_FIELDS_PER_PAGE,
            currentPage * CUSTOM_FIELDS_PER_PAGE
        )
    }, [currentPage, customFieldDataRows])

    return customFieldDataRows.length === 0 && !isLoading ? (
        <NoDataAvailable className={css.NoDataAvailable} />
    ) : (
        <>
            <div ref={ref} className={css.container} onScroll={handleScroll}>
                <TableWrapper className={css.table} style={{width}}>
                    <TableHead>
                        <HeaderCellProperty
                            colSpan={2}
                            title={CUSTOM_FIELD_COLUMN_LABEL}
                            className={classNames(
                                {
                                    [css.withShadow]: isTableScrolled,
                                },
                                css.categoryHeader
                            )}
                            direction={
                                order.direction === OrderDirection.Asc
                                    ? OrderDirection.Desc
                                    : OrderDirection.Asc
                            }
                            isOrderedBy={order.column === 'label'}
                            onClick={() => setOrdering('label')}
                        />
                        <HeaderCellProperty
                            title={TOTAL_COLUMN_LABEL}
                            justifyContent={'right'}
                            className={classNames(css.BodyCell)}
                            wrapContent={true}
                            direction={
                                order.direction === OrderDirection.Asc
                                    ? OrderDirection.Desc
                                    : OrderDirection.Asc
                            }
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
                            ? Array.from(Array(CUSTOM_FIELDS_PER_PAGE)).map(
                                  (_, index) => (
                                      <LoadingRow
                                          key={index}
                                          dateTimes={dateTimes}
                                          isTableScrolled={isTableScrolled}
                                      />
                                  )
                              )
                            : currentPageOfCustomFieldDataRows.map((row) => (
                                  <TableBodyRowExpandable<DataRowProps>
                                      key={row[BREAKDOWN_FIELD]}
                                      innerClassName={css.small}
                                      rowContentProps={{
                                          ...row,
                                          isLoading,
                                          isTableScrolled,
                                      }}
                                      RowContentComponent={
                                          CustomFieldsTicketCountDataRowContent
                                      }
                                  />
                              ))}
                    </TableBody>
                </TableWrapper>
            </div>
            <div>
                {customFieldDataRows.length >= CUSTOM_FIELDS_PER_PAGE && (
                    <NumberedPagination
                        count={Math.ceil(
                            customFieldDataRows.length / CUSTOM_FIELDS_PER_PAGE
                        )}
                        page={currentPage}
                        onChange={setCurrentPage}
                        className={css.pagination}
                    />
                )}
            </div>
        </>
    )
}

const LoadingRow = ({
    isTableScrolled = false,
    dateTimes,
}: {
    isTableScrolled: boolean
    dateTimes: string[]
}) => {
    return (
        <TableBodyRow>
            <BodyCell
                className={classNames(
                    {[css.withShadow]: isTableScrolled},
                    css.sticky,
                    css.categoryColumn
                )}
            >
                <Skeleton inline width={CATEGORY_COLUMN_WIDTH} />
            </BodyCell>
            <BodyCell
                isHighlighted={true}
                className={classNames(css.BodyCellContent)}
            >
                <Skeleton inline width={DATA_COLUMN_WIDTH} />
            </BodyCell>
            {dateTimes.map((dateTime) => (
                <BodyCell
                    key={dateTime}
                    className={classNames(css.BodyCellContent)}
                >
                    <Skeleton inline width={DATA_COLUMN_WIDTH} />
                </BodyCell>
            ))}
        </TableBodyRow>
    )
}
