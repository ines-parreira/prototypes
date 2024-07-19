import React from 'react'

import classNames from 'classnames'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import css from 'pages/stats/DrillDownTable.less'
import TableBody from 'pages/common/components/table/TableBody'
import {
    defaultEnrichmentFields,
    useEnrichedDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {DrillDownTicketDetailsCell} from 'pages/stats/DrillDownTicketDetailsCell'
import {
    DrillDownMetric,
    getDrillDownMetricColumn,
    SLA_FORMAT,
} from 'state/ui/stats/drillDownSlice'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {SLAStatusCell} from 'pages/stats/sla/components/SlaStatusCell'
import {AgentAvatar} from 'pages/stats/AgentAvatar'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import {TruncateCellContent} from 'pages/stats/TruncateCellContent'
import useAppSelector from 'hooks/useAppSelector'
import {DrillDownTableContentSkeleton} from 'pages/stats/common/components/Table/DrillDownTableContentSkeleton'
import {formatTicketDrillDownRowData} from 'pages/stats/DrillDownFormatters'

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

export const TicketDrillDownTableContent = ({
    metricData,
}: {
    metricData: DrillDownMetric
}) => {
    const {showMetric, metricTitle, metricValueFormat} = useAppSelector(
        getDrillDownMetricColumn
    )

    const {data, isFetching} = useEnrichedDrillDownData(
        metricData,
        defaultEnrichmentFields,
        formatTicketDrillDownRowData
    )

    const columnWidths = {
        ticket: showMetric ? 300 : 440,
        metric: 140,
        assignee: 180,
        created: 180,
        contactReason: 200,
    }
    const columnWidthsForSkeleton = [
        columnWidths.ticket,
        columnWidths.metric,
        columnWidths.assignee,
        columnWidths.created,
        columnWidths.contactReason,
    ].map((width) => width - 40)

    return (
        <>
            <TableHead>
                <HeaderCellProperty
                    title="Ticket"
                    width={columnWidths.ticket}
                    className={css.headerCell}
                />
                {showMetric && (
                    <HeaderCellProperty
                        title={metricTitle}
                        width={columnWidths.metric}
                        className={css.headerCell}
                        tooltip={tooltipHints.metric}
                    />
                )}
                <HeaderCellProperty
                    title="Assignee"
                    width={columnWidths.assignee}
                    className={css.headerCell}
                    tooltip={tooltipHints.assignee}
                />
                <HeaderCellProperty
                    title="Created"
                    width={columnWidths.created}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Contact Reason"
                    width={columnWidths.contactReason}
                    className={css.headerCell}
                    tooltip={tooltipHints.contactReason}
                />
            </TableHead>
            <TableBody>
                {isFetching ? (
                    <DrillDownTableContentSkeleton
                        columnWidths={columnWidthsForSkeleton}
                    />
                ) : (
                    data.map((item) => (
                        <TableBodyRow
                            key={item.ticket.id}
                            className={classNames(css.tableRow, {
                                [css.isHighlighted]: !item.ticket.isRead,
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
                                    width: columnWidths.ticket,
                                }}
                            />
                            {showMetric && (
                                <BodyCell width={columnWidths.metric}>
                                    {metricValueFormat !== SLA_FORMAT
                                        ? formatMetricValue(
                                              item.metricValue,
                                              metricValueFormat,
                                              NOT_AVAILABLE_PLACEHOLDER
                                          )
                                        : item.rowData && (
                                              <SLAStatusCell
                                                  item={item.rowData}
                                              />
                                          )}
                                </BodyCell>
                            )}
                            <BodyCell width={columnWidths.assignee}>
                                {item.assignee && (
                                    <AgentAvatar
                                        agent={item.assignee}
                                        avatarSize={24}
                                        className={css.agent}
                                    />
                                )}
                            </BodyCell>

                            <BodyCell width={columnWidths.created}>
                                {item.ticket.created ? (
                                    <DatetimeLabel
                                        dateTime={item.ticket.created}
                                    />
                                ) : (
                                    NOT_AVAILABLE_PLACEHOLDER
                                )}
                            </BodyCell>
                            <BodyCell width={columnWidths.contactReason}>
                                {item.ticket.contactReason ? (
                                    <TruncateCellContent
                                        content={item.ticket.contactReason}
                                    />
                                ) : (
                                    <span className={css.noData}>
                                        {NOT_AVAILABLE_PLACEHOLDER}
                                    </span>
                                )}
                            </BodyCell>
                        </TableBodyRow>
                    ))
                )}
            </TableBody>
        </>
    )
}
