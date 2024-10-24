import classNames from 'classnames'
import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {
    defaultEnrichmentFields,
    useEnrichedDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import useAppSelector from 'hooks/useAppSelector'
import {TicketQAScoreDimensionName} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {EnrichmentFields} from 'models/reporting/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import {AgentAvatar} from 'pages/stats/common/AgentAvatar'
import {DrillDownTableContentSkeleton} from 'pages/stats/common/components/Table/DrillDownTableContentSkeleton'
import {HintTooltipContent} from 'pages/stats/common/HintTooltip'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {formatTicketDrillDownRowData} from 'pages/stats/DrillDownFormatters'
import css from 'pages/stats/DrillDownTable.less'
import {DrillDownTicketDetailsCell} from 'pages/stats/DrillDownTicketDetailsCell'
import {SLAStatusCell} from 'pages/stats/sla/components/SlaStatusCell'
import {AutoQAAgentsTableColumn} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {AutoQACompletenessCell} from 'pages/stats/support-performance/auto-qa/AutoQACompletenessCell'
import {
    COMMUNICATION_SKILLS_LABEL,
    RESOLUTION_COMPLETENESS_SHORT_LABEL,
    TrendCardConfig,
} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {TruncateCellContent} from 'pages/stats/TruncateCellContent'
import {
    DrillDownMetric,
    getDrillDownMetricColumn,
    SLA_FORMAT,
} from 'state/ui/stats/drillDownSlice'
import {AutoQAMetric} from 'state/ui/stats/types'

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

const getOnClickHandler =
    (ticketId: string | number, metricName: DrillDownMetric['metricName']) =>
    () => {
        logEvent(SegmentEvent.StatDrillDownTicketClicked, {
            metric: metricName,
        })
        window.open(`/app/ticket/${ticketId}`, '_blank')
    }

export const TicketDrillDownTableContent = ({
    metricData,
}: {
    metricData: DrillDownMetric
}) => {
    const isAutoQAResolutionCompleteness =
        metricData.metricName === AutoQAMetric.ResolutionCompleteness ||
        metricData.metricName === AutoQAAgentsTableColumn.ResolutionCompleteness
    const isAutoQAReviewedClosedTickets =
        metricData.metricName === AutoQAMetric.ReviewedClosedTickets ||
        metricData.metricName === AutoQAAgentsTableColumn.ReviewedClosedTickets
    const {showMetric, metricTitle, metricValueFormat} = useAppSelector(
        getDrillDownMetricColumn
    )

    const {data, isFetching} = useEnrichedDrillDownData(
        metricData,
        defaultEnrichmentFields,
        formatTicketDrillDownRowData,
        EnrichmentFields.TicketId
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
                {isAutoQAResolutionCompleteness && (
                    <HeaderCellProperty
                        title={RESOLUTION_COMPLETENESS_SHORT_LABEL}
                        width={columnWidths.metric}
                        className={css.headerCell}
                        tooltip={
                            <HintTooltipContent
                                {...TrendCardConfig[
                                    AutoQAMetric.ResolutionCompleteness
                                ].hint}
                            />
                        }
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
                {isAutoQAReviewedClosedTickets && (
                    <>
                        <HeaderCellProperty
                            title={RESOLUTION_COMPLETENESS_SHORT_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[
                                        AutoQAMetric.ResolutionCompleteness
                                    ].hint}
                                />
                            }
                        />
                        <HeaderCellProperty
                            title={COMMUNICATION_SKILLS_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[
                                        AutoQAMetric.CommunicationSkills
                                    ].hint}
                                />
                            }
                        />
                    </>
                )}
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
                            onClick={getOnClickHandler(
                                item.ticket.id,
                                metricData.metricName
                            )}
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
                            {isAutoQAResolutionCompleteness && (
                                <BodyCell width={columnWidths.metric}>
                                    {
                                        <AutoQACompletenessCell
                                            data={
                                                item?.qaScore?.[
                                                    TicketQAScoreDimensionName
                                                        .ResolutionCompleteness
                                                ]
                                            }
                                        />
                                    }
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
                            {isAutoQAReviewedClosedTickets && (
                                <>
                                    <BodyCell width={columnWidths.metric}>
                                        {
                                            <AutoQACompletenessCell
                                                data={
                                                    item?.qaScore?.[
                                                        TicketQAScoreDimensionName
                                                            .ResolutionCompleteness
                                                    ]
                                                }
                                            />
                                        }
                                    </BodyCell>
                                    <BodyCell width={columnWidths.metric}>
                                        {item?.qaScore &&
                                            item.qaScore[
                                                TicketQAScoreDimensionName
                                                    .CommunicationSkills
                                            ]}
                                    </BodyCell>
                                </>
                            )}

                            <BodyCell width={columnWidths.contactReason}>
                                {item.ticket.contactReason ? (
                                    <TruncateCellContent
                                        content={item.ticket.contactReason}
                                        left
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
