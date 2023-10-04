import classNames from 'classnames'
import moment from 'moment/moment'
import React, {UIEventHandler, useState} from 'react'
import useMeasure from 'react-use/lib/useMeasure'
import useAppDispatch from 'hooks/useAppDispatch'
import {OrderDirection} from 'models/api/types'
import {useCustomFieldsTicketCountPerCustomFields} from 'hooks/reporting/useCustomFieldsTicketCountPerCustomFields'
import {
    BREAKDOWN_FIELD,
    TicketCustomFieldsTicketCountTimeSeriesData,
    VALUE_FIELD,
} from 'hooks/reporting/withBreakdown'
import useAppSelector from 'hooks/useAppSelector'
import {ReportingGranularity} from 'models/reporting/types'
import {NumberedPagination} from 'pages/common/components/Paginations'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import {TableBodyRowExpandable} from 'pages/common/components/table/TableBodyRowExpandable'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import css from 'pages/stats/BreakdownTable.less'
import {getFormat} from 'pages/stats/common/utils'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import {toggleOrder} from 'state/ui/stats/ticketInsightsSlice'

export const CUSTOM_FIELD_COLUMN_LABEL = 'Value / Category'
export const TOTAL_COLUMN_LABEL = 'Total'
const PER_PAGE = 10
const EXPAND_COLUMN_WIDTH = 45
const CATEGORY_COLUMN_WIDTH = 250
const DATA_COLUMN_WIDTH = 120
const TICKET_INSIGHTS_TABLE_DAILY_FORMAT = 'ddd, MMM D'

export const formatDates =
    (granularity: ReportingGranularity) => (dateTime: string) => {
        let format = getFormat(granularity)
        if (granularity === ReportingGranularity.Day) {
            format = TICKET_INSIGHTS_TABLE_DAILY_FORMAT
        }

        return moment(dateTime).format(format)
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
    const toggleOrdering = () => dispatch(toggleOrder())

    const {granularity} = useAppSelector(getCleanStatsFiltersWithTimezone)
    const {
        data: customFieldDataRows,
        dateTimes,
        isLoading,
        order,
    } = useCustomFieldsTicketCountPerCustomFields(selectedCustomFieldId)

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
                                order === OrderDirection.Asc
                                    ? OrderDirection.Desc
                                    : OrderDirection.Asc
                            }
                            isOrderedBy={true}
                            onClick={toggleOrdering}
                        />
                        <HeaderCellProperty title={TOTAL_COLUMN_LABEL} />
                        {dateTimes.map((dateTime) => (
                            <HeaderCellProperty
                                key={dateTime}
                                title={formatDates(granularity)(dateTime)}
                            />
                        ))}
                    </TableHead>

                    <TableBody>
                        {isLoading
                            ? Array.from(Array(PER_PAGE)).map((_, index) => (
                                  <LoadingRow
                                      key={index}
                                      dateTimes={dateTimes}
                                      isTableScrolled={isTableScrolled}
                                  />
                              ))
                            : customFieldDataRows.map((row) => (
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
                {customFieldDataRows.length >= PER_PAGE && (
                    <NumberedPagination
                        count={Math.ceil(customFieldDataRows.length / PER_PAGE)}
                        page={currentPage}
                        onChange={setCurrentPage}
                        className={css.pagination}
                    />
                )}
            </div>
        </>
    )
}

type DataRowProps = TicketCustomFieldsTicketCountTimeSeriesData & {
    level?: number
    isLoading?: boolean
    isTableScrolled?: boolean
}

const CustomFieldsTicketCountDataRowContent = ({
    isTableScrolled = false,
    timeSeries,
    [BREAKDOWN_FIELD]: label,
    [VALUE_FIELD]: value,
    level = 0,
}: DataRowProps) => {
    return (
        <>
            <BodyCell
                className={classNames(
                    {[css.withShadow]: isTableScrolled},
                    css.sticky,
                    css.categoryColumn
                )}
                style={{
                    left: `${(level + 1) * EXPAND_COLUMN_WIDTH}px`,
                }}
                innerClassName={classNames(css.BodyCellContent)}
            >
                {label}
            </BodyCell>
            <BodyCell
                isHighlighted={true}
                innerClassName={classNames(css.BodyCellContent)}
                justifyContent={'right'}
            >
                {value}
            </BodyCell>
            {timeSeries.map((data) => (
                <BodyCell
                    key={data.dateTime}
                    innerClassName={classNames(css.BodyCellContent)}
                    justifyContent={'right'}
                >
                    {data?.value}
                </BodyCell>
            ))}
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
