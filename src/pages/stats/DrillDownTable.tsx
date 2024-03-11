import React from 'react'
import classNames from 'classnames'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {
    DrillDownMetric,
    getDrillDownMetricColumn,
} from 'state/ui/stats/drillDownSlice'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {NumberedPagination} from 'pages/common/components/Paginations'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import {
    DRILL_DOWN_PER_PAGE,
    useDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import {DrillDownTicketDetailsCell} from './DrillDownTicketDetailsCell'
import {TruncateCellContent} from './TruncateCellContent'
import {AgentAvatar} from './AgentAvatar'
import css from './DrillDownTable.less'

const tooltipHints = {
    metric: 'The metric values displayed in this column are based on the tickets’ state at the end of the selected period.',
    assignee:
        'The current assignee is displayed in this column. It may be different from who the assignee was at the end of the selected timeframe.',
    contactReason: (
        <span>
            The current value of the Contact reason is displayed. It may be
            different from the Contact reason at the end of the selected period.{' '}
            <a
                href="https://docs.gorgias.com/en-US/managed-ticket-fields-273001"
                target="_blank"
                rel="noreferrer"
            >
                Learn more about Contact reason.
            </a>
        </span>
    ),
}

export const DrillDownTable = ({metricData}: {metricData: DrillDownMetric}) => {
    const {showMetric, metricTitle, metricValueFormat} = useAppSelector(
        getDrillDownMetricColumn
    )

    const {currentPage, pagesCount, onPageChange, data, isFetching} =
        useDrillDownData(metricData)

    return (
        <>
            <div className={css.container}>
                <TableWrapper className={css.table}>
                    <TableHead>
                        <HeaderCellProperty
                            title="Ticket"
                            width={showMetric ? 300 : 440}
                            className={css.headerCell}
                        />
                        {showMetric && (
                            <HeaderCellProperty
                                title={metricTitle}
                                width={140}
                                className={css.headerCell}
                                tooltip={tooltipHints.metric}
                            />
                        )}
                        <HeaderCellProperty
                            title="Assignee"
                            width={180}
                            className={css.headerCell}
                            tooltip={tooltipHints.assignee}
                        />
                        <HeaderCellProperty
                            title="Created"
                            width={180}
                            className={css.headerCell}
                        />
                        <HeaderCellProperty
                            title="Contact Reason"
                            width={200}
                            className={css.headerCell}
                            tooltip={tooltipHints.contactReason}
                        />
                    </TableHead>
                    <TableBody>
                        {isFetching
                            ? new Array(DRILL_DOWN_PER_PAGE)
                                  .fill(null)
                                  .map((_, rowIndex) => (
                                      <TableBodyRow key={rowIndex}>
                                          <BodyCell>
                                              <Skeleton
                                                  inline
                                                  width={showMetric ? 260 : 400}
                                              />
                                          </BodyCell>
                                          <BodyCell>
                                              <Skeleton inline width={108} />
                                          </BodyCell>
                                          <BodyCell>
                                              <Skeleton inline width={148} />
                                          </BodyCell>
                                          <BodyCell>
                                              <Skeleton inline width={148} />
                                          </BodyCell>
                                          <BodyCell>
                                              <Skeleton inline width={160} />
                                          </BodyCell>
                                      </TableBodyRow>
                                  ))
                            : data.map((item) => (
                                  <TableBodyRow
                                      key={item.ticket.id}
                                      className={classNames(css.tableRow, {
                                          [css.isHighlighted]:
                                              !item.ticket.isRead,
                                      })}
                                      onClick={() =>
                                          window.open(
                                              `/app/ticket/${item.ticket.id}`,
                                              '_blank'
                                          )
                                      }
                                  >
                                      <DrillDownTicketDetailsCell
                                          ticketDetails={item.ticket}
                                          bodyCellProps={{
                                              width: showMetric ? 300 : 440,
                                          }}
                                      />
                                      {showMetric && (
                                          <BodyCell width={140}>
                                              {formatMetricValue(
                                                  item.metricValue,
                                                  metricValueFormat,
                                                  NOT_AVAILABLE_PLACEHOLDER
                                              )}
                                          </BodyCell>
                                      )}
                                      <BodyCell width={180}>
                                          {item.assignee && (
                                              <AgentAvatar
                                                  agent={item.assignee}
                                                  avatarSize={24}
                                                  className={css.agent}
                                              />
                                          )}
                                      </BodyCell>

                                      <BodyCell width={180}>
                                          {item.ticket.created ? (
                                              <DatetimeLabel
                                                  dateTime={item.ticket.created}
                                              />
                                          ) : (
                                              NOT_AVAILABLE_PLACEHOLDER
                                          )}
                                      </BodyCell>
                                      <BodyCell width={200}>
                                          {item.ticket.contactReason ? (
                                              <TruncateCellContent
                                                  content={
                                                      item.ticket.contactReason
                                                  }
                                              />
                                          ) : (
                                              <span className={css.noData}>
                                                  {NOT_AVAILABLE_PLACEHOLDER}
                                              </span>
                                          )}
                                      </BodyCell>
                                  </TableBodyRow>
                              ))}
                    </TableBody>
                </TableWrapper>
            </div>
            {pagesCount > 1 && (
                <NumberedPagination
                    count={pagesCount}
                    page={currentPage}
                    onChange={onPageChange}
                    className={css.pagination}
                />
            )}
        </>
    )
}
