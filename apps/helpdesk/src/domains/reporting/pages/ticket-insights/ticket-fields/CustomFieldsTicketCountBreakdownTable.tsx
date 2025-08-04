import React, { UIEventHandler, useEffect, useMemo, useState } from 'react'

import { useMeasure } from '@repo/hooks'
import classNames from 'classnames'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useCustomFieldsTicketCountPerCustomFields } from 'domains/reporting/hooks/ticket-insights/useCustomFieldsTicketCountPerCustomFields'
import { BREAKDOWN_FIELD } from 'domains/reporting/hooks/withBreakdown'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import css from 'domains/reporting/pages/common/components/Table/BreakdownTable.less'
import {
    CustomFieldsTicketCountDataRowContent,
    DataRowProps,
    WithSelectedCustomField,
} from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldsTicketCountDataRowContent'
import { formatDates } from 'domains/reporting/pages/utils'
import {
    setOrder,
    TicketInsightsOrder,
} from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import { opposite } from 'models/api/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import { TableBodyRowExpandable } from 'pages/common/components/table/TableBodyRowExpandable'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

export const CUSTOM_FIELD_COLUMN_LABEL = 'Value / Category'
export const TOTAL_COLUMN_LABEL = 'Total'
export const CUSTOM_FIELDS_PER_PAGE = 15
const CATEGORY_COLUMN_WIDTH = 250
const DATA_COLUMN_WIDTH = 120

export const CustomFieldsTicketCountBreakdownTable = ({
    selectedCustomField,
}: {
    selectedCustomField: { id: number; label: string }
}) => {
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

    const dispatch = useAppDispatch()
    const setOrdering = (column: TicketInsightsOrder['column']) =>
        dispatch(setOrder({ column }))

    const { granularity } = useStatsFilters()
    const {
        data: customFieldDataRows,
        dateTimes,
        isLoading,
        order,
    } = useCustomFieldsTicketCountPerCustomFields(selectedCustomField.id)

    useEffect(() => {
        setCurrentPage(1)
    }, [customFieldDataRows.length])

    const currentPageOfCustomFieldDataRows = useMemo(() => {
        return customFieldDataRows.slice(
            (currentPage - 1) * CUSTOM_FIELDS_PER_PAGE,
            currentPage * CUSTOM_FIELDS_PER_PAGE,
        )
    }, [currentPage, customFieldDataRows])

    const hasPagination = customFieldDataRows.length >= CUSTOM_FIELDS_PER_PAGE

    return customFieldDataRows.length === 0 && !isLoading ? (
        <NoDataAvailable className={css.NoDataAvailable} />
    ) : (
        <>
            <div
                ref={ref}
                className={classNames(css.container, {
                    [css.withPagination]: hasPagination,
                })}
                onScroll={handleScroll}
            >
                <TableWrapper className={css.table} style={{ width }}>
                    <TableHead>
                        <HeaderCellProperty
                            colSpan={3}
                            title={CUSTOM_FIELD_COLUMN_LABEL}
                            className={classNames(
                                {
                                    [css.withShadow]: isTableScrolled,
                                },
                                css.categoryHeader,
                            )}
                            direction={opposite(order.direction)}
                            isOrderedBy={order.column === 'label'}
                            onClick={() => setOrdering('label')}
                        />
                        <HeaderCellProperty
                            title={TOTAL_COLUMN_LABEL}
                            justifyContent={'right'}
                            className={classNames(css.BodyCell)}
                            wrapContent={true}
                            direction={opposite(order.direction)}
                            isOrderedBy={order.column === 'total'}
                            onClick={() => setOrdering('total')}
                            colSpan={1}
                        />
                        {dateTimes.map((dateTime, index) => (
                            <HeaderCellProperty
                                key={dateTime}
                                title={formatDates(granularity, dateTime)}
                                justifyContent={'right'}
                                wrapContent={true}
                                className={classNames(css.dateTimeHeader)}
                                direction={opposite(order.direction)}
                                isOrderedBy={order.column === index}
                                onClick={() => setOrdering(index)}
                                colSpan={1}
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
                                  ),
                              )
                            : currentPageOfCustomFieldDataRows.map((row) => (
                                  <TableBodyRowExpandable<
                                      DataRowProps,
                                      WithSelectedCustomField
                                  >
                                      key={row[BREAKDOWN_FIELD]}
                                      innerClassName={css.small}
                                      rowContentProps={{
                                          ...row,
                                          isLoading,
                                          isTableScrolled,
                                      }}
                                      tableProps={{ selectedCustomField }}
                                      RowContentComponent={
                                          CustomFieldsTicketCountDataRowContent
                                      }
                                  />
                              ))}
                    </TableBody>
                </TableWrapper>
            </div>
            <div>
                {hasPagination && (
                    <NumberedPagination
                        count={Math.ceil(
                            customFieldDataRows.length / CUSTOM_FIELDS_PER_PAGE,
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

export const LoadingRow = ({
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
                    { [css.withShadow]: isTableScrolled },
                    css.sticky,
                    css.leadColumn,
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
