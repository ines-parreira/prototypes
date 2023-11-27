import React, {UIEventHandler, useState} from 'react'
import classNames from 'classnames'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import {formatPercentage} from 'pages/common/utils/numbers'
import {formatDatetime} from 'utils'
import {HintTooltip} from 'pages/stats/common/HintTooltip'
import {TooltipData} from 'pages/stats/types'
import {formatMetricValue} from 'pages/stats/common/utils'
import {NumberedPagination} from 'pages/common/components/Paginations'
import css from './HelpCenterStatsTable.less'

export enum TableCellType {
    String = 'string',
    Link = 'link',
    Number = 'number',
    Percent = 'percent',
    Date = 'date',
}

export type HelpCenterTableColumn = {
    type: TableCellType
    name: string
    width?: number
    tooltip?: TooltipData
}

export type HelpCenterTableCell = {
    link?: string | null
    onClick?: () => void
} & (
    | {
          type: TableCellType.String
          value: string | null
      }
    | {
          type: TableCellType.Number
          value: number | null
      }
    | {
          type: TableCellType.Percent
          value: number | null
      }
    | {
          type: TableCellType.Date
          value: Date | string | null
      }
)

const NO_VALUE_PLACEHOLDER = '-'

const getCellFormatter = (cell: HelpCenterTableCell) => {
    if (cell.value === null) return NO_VALUE_PLACEHOLDER

    switch (cell.type) {
        case TableCellType.String:
            return cell.value
        case TableCellType.Number:
            return formatMetricValue(cell.value)
        case TableCellType.Percent:
            return formatPercentage(cell.value)
        case TableCellType.Date:
            return formatDatetime(cell.value)
    }
}

type HelpCenterStatsTableProps = {
    isLoading?: boolean
    pageSize?: number
    columns: HelpCenterTableColumn[]
    data: HelpCenterTableCell[][]
    currentPage: number
    count: number
    onPageChange: (page: number) => void
}

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_COLUMN_WIDTH = 130

const HelpCenterStatsTable = ({
    isLoading,
    pageSize = DEFAULT_PAGE_SIZE,
    data,
    currentPage,
    count,
    onPageChange,
    columns,
}: HelpCenterStatsTableProps) => {
    const tableWidth = columns.map((column) => column.width)

    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }

    return (
        <>
            <div
                className={css.container}
                onScroll={handleScroll}
                data-testid="help-center-stats-table"
            >
                <TableWrapper className={css.table}>
                    <TableHead>
                        {columns.map((column, index) => (
                            <HeaderCellProperty
                                key={column.name}
                                title={column.name}
                                width={
                                    tableWidth[index] ?? DEFAULT_COLUMN_WIDTH
                                }
                                justifyContent={index === 0 ? 'left' : 'right'}
                                wrapContent
                                className={classNames({
                                    [css.withShadow]:
                                        isTableScrolled && index === 0,
                                })}
                            >
                                {column.tooltip && (
                                    <HintTooltip
                                        className={css.columnHeaderTooltip}
                                        {...column.tooltip}
                                    />
                                )}
                            </HeaderCellProperty>
                        ))}
                    </TableHead>

                    <TableBody>
                        {isLoading
                            ? Array(pageSize)
                                  .fill(null)
                                  .map((_, index) => (
                                      <TableBodyRow key={index}>
                                          {columns.map((_, index) => (
                                              <BodyCell
                                                  key={index}
                                                  width={
                                                      tableWidth[index] ??
                                                      DEFAULT_COLUMN_WIDTH
                                                  }
                                              >
                                                  <div className={css.loader}>
                                                      <Skeleton height={17} />
                                                  </div>
                                              </BodyCell>
                                          ))}
                                      </TableBodyRow>
                                  ))
                            : data.map((line, rowNumber) => (
                                  <TableBodyRow key={rowNumber}>
                                      {line.map((cell, columnNumber) => (
                                          <BodyCell
                                              key={`${
                                                  columns[columnNumber]?.name ??
                                                  columnNumber
                                              }-${
                                                  cell.value
                                                      ? cell.value.toString()
                                                      : columnNumber
                                              }`}
                                              className={classNames({
                                                  [css.withShadow]:
                                                      isTableScrolled &&
                                                      columnNumber === 0,
                                              })}
                                              innerClassName={
                                                  css.bodyCellContent
                                              }
                                              justifyContent={
                                                  columnNumber === 0
                                                      ? 'left'
                                                      : 'right'
                                              }
                                              width={
                                                  tableWidth[columnNumber] ??
                                                  DEFAULT_COLUMN_WIDTH
                                              }
                                              onClick={cell.onClick}
                                          >
                                              <span
                                                  className={classNames(
                                                      css.textTruncate,
                                                      {
                                                          [css.clickableSpan]:
                                                              cell.onClick !==
                                                              undefined,
                                                      }
                                                  )}
                                                  data-testid={`${columns[columnNumber]?.name}-${rowNumber}`}
                                                  title={getCellFormatter(
                                                      cell
                                                  ).toString()}
                                              >
                                                  {cell.link ? (
                                                      <a
                                                          href={cell.link}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                      >
                                                          {getCellFormatter(
                                                              cell
                                                          )}
                                                      </a>
                                                  ) : (
                                                      getCellFormatter(cell)
                                                  )}
                                              </span>
                                          </BodyCell>
                                      ))}
                                  </TableBodyRow>
                              ))}
                    </TableBody>
                </TableWrapper>
            </div>

            {count > 1 && (
                <div data-testid="help-center-table-pagination">
                    <NumberedPagination
                        count={count}
                        page={currentPage}
                        onChange={onPageChange}
                        className={css.pagination}
                    />
                </div>
            )}
        </>
    )
}

export default HelpCenterStatsTable
