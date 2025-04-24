import classNames from 'classnames'

import { logEvent, SegmentEvent } from 'common/segment'
import {
    defaultEnrichmentFields,
    enrichmentMappingPerMetric,
    extraEnrichmentFieldsPerMetric,
    useEnrichedDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import { TicketQAScoreMeasure } from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import { EnrichmentFields } from 'models/reporting/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { AiSalesAgentChart } from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { AgentAvatar } from 'pages/stats/common/AgentAvatar'
import { DrillDownTableContentSkeleton } from 'pages/stats/common/components/Table/DrillDownTableContentSkeleton'
import { TruncateCellContent } from 'pages/stats/common/components/TruncateCellContent'
import { formatTicketDrillDownRowData } from 'pages/stats/common/drill-down/DrillDownFormatters'
import css from 'pages/stats/common/drill-down/DrillDownTable.less'
import { DrillDownTicketDetailsCell } from 'pages/stats/common/drill-down/DrillDownTicketDetailsCell'
import { getDrillDownMetricColumn } from 'pages/stats/common/drill-down/helpers'
import { HintTooltipContent } from 'pages/stats/common/HintTooltip'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { CSAT_SCORE } from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import { SLAStatusCell } from 'pages/stats/sla/components/SlaStatusCell'
import { SLA_FORMAT } from 'pages/stats/sla/SlaConfig'
import { AutoQAAgentsTableColumn } from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { AutoQACompletenessCell } from 'pages/stats/support-performance/auto-qa/AutoQACompletenessCell'
import {
    ACCURACY_LABEL,
    BRAND_VOICE_LABEL,
    COMMUNICATION_SKILLS_LABEL,
    EFFICIENCY_LABEL,
    INTERNAL_COMPLIANCE_LABEL,
    LANGUAGE_PROFICIENCY_SKILLS_LABEL,
    RESOLUTION_COMPLETENESS_SHORT_LABEL,
    TrendCardConfig,
} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {
    AutoQAAgentMetric,
    DrillDownMetric,
} from 'state/ui/stats/drillDownSlice'
import {
    AIInsightsMetric,
    AutoQAMetric,
    SatisfactionMetric,
} from 'state/ui/stats/types'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'

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
    outcome:
        'Current resolution or result of the ticket after being processed by AI Agent. It may be different from the what the outcome was at the end of selected timeframe.',
    intent: 'The primary topic or issue identified by AI Agent for this ticket.',
}

const isAutoQAMetric = (
    metricName: DrillDownMetric['metricName'],
): metricName is AutoQAMetric =>
    Object.values(AutoQAMetric).map(String).includes(String(metricName))

const isAutoQAAgentsTableColumn = (
    metricName: DrillDownMetric['metricName'],
): metricName is AutoQAAgentMetric =>
    [
        AutoQAAgentsTableColumn.ResolutionCompleteness,
        AutoQAAgentsTableColumn.ReviewedClosedTickets,
        AutoQAAgentsTableColumn.CommunicationSkills,
        AutoQAAgentsTableColumn.LanguageProficiency,
        AutoQAAgentsTableColumn.Accuracy,
        AutoQAAgentsTableColumn.Efficiency,
        AutoQAAgentsTableColumn.InternalCompliance,
        AutoQAAgentsTableColumn.BrandVoice,
    ]
        .map(String)
        .includes(String(metricName))

const getOnClickHandler =
    (ticketId: string | number, metricName: DrillDownMetric['metricName']) =>
    () => {
        logEvent(SegmentEvent.StatDrillDownTicketClicked, {
            metric: metricName,
            ticket_id: ticketId,
        })
        if (
            isAutoQAMetric(metricName) ||
            isAutoQAAgentsTableColumn(metricName)
        ) {
            window.open(
                `/app/ticket/${ticketId}?activeTab=${TicketAIAgentFeedbackTab.AIAgent}`,
                '_blank',
            )
        } else {
            window.open(`/app/ticket/${ticketId}`, '_blank')
        }
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
    const showSurveyScore =
        metricData.metricName === SatisfactionMetric.SatisfactionScore

    const { showMetric, metricTitle, metricValueFormat } =
        getDrillDownMetricColumn(metricData)

    const isAiInsightsMetric =
        metricData.metricName === AIInsightsMetric.TicketCustomFieldsTicketCount

    const isAiInsightsCsatMetric =
        metricData.metricName ===
        AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction

    const isAiPerformanceMetric =
        metricData.metricName ===
        AIInsightsMetric.TicketDrillDownPerCoverageRate

    const isAiSalesAgentConversationsMetric =
        metricData.metricName === AiSalesAgentChart.AiSalesAgentTotalSalesConv

    const isAiSalesAgentSuccessRateMetric =
        metricData.metricName === AiSalesAgentChart.AiSalesAgentSuccessRate
    const isAiSalesAgentTotalNumberOfOrdersMetric =
        metricData.metricName ===
        AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders

    const isAiSalesAgentDiscountOfferedMetric =
        metricData.metricName === AiSalesAgentChart.AiSalesDiscountOffered

    const { data, isFetching } = useEnrichedDrillDownData(
        metricData,
        extraEnrichmentFieldsPerMetric[metricData.metricName] ||
            defaultEnrichmentFields,
        formatTicketDrillDownRowData,
        EnrichmentFields.TicketId,
        enrichmentMappingPerMetric[metricData.metricName],
    )

    const getTicketColumnWidth = () => {
        if (
            isAiInsightsMetric ||
            isAiPerformanceMetric ||
            isAiInsightsCsatMetric
        ) {
            return 280
        }

        if (showMetric) {
            return 300
        }

        return 440
    }

    const columnWidths = {
        ticket: getTicketColumnWidth(),
        metric: 140,
        surveyScore: 140,
        assignee: 180,
        created: 180,
        contactReason: 200,
        outcome: 140,
        intent: 180,
        order: 140,
    }
    const columnWidthsForSkeleton = [
        columnWidths.ticket,
        columnWidths.metric,
        ...(showSurveyScore ? [columnWidths.surveyScore] : []),
        columnWidths.assignee,
        columnWidths.created,
        columnWidths.contactReason,
        columnWidths.outcome,
        columnWidths.intent,
        columnWidths.order,
    ].map((width) => width - 40)

    return (
        <>
            <TableHead>
                <HeaderCellProperty
                    title="Ticket"
                    width={columnWidths.ticket}
                    className={css.headerCell}
                />
                {isAiSalesAgentTotalNumberOfOrdersMetric && (
                    <>
                        <HeaderCellProperty
                            title="Order"
                            width={columnWidths.order}
                            className={css.headerCell}
                        />
                        <HeaderCellProperty
                            title="Amount"
                            width={columnWidths.order}
                            className={css.headerCell}
                        />
                        <HeaderCellProperty
                            title="Customer"
                            width={columnWidths.order}
                            className={css.headerCell}
                        />
                    </>
                )}
                {(isAiInsightsMetric ||
                    isAiPerformanceMetric ||
                    isAiSalesAgentConversationsMetric ||
                    isAiSalesAgentSuccessRateMetric ||
                    isAiSalesAgentDiscountOfferedMetric) && (
                    <HeaderCellProperty
                        title="Outcome"
                        width={columnWidths.outcome}
                        className={css.headerCell}
                        tooltip={tooltipHints.outcome}
                    />
                )}
                {showMetric && (
                    <HeaderCellProperty
                        title={metricTitle}
                        width={columnWidths.metric}
                        className={css.headerCell}
                        tooltip={tooltipHints.metric}
                    />
                )}
                {showSurveyScore && (
                    <HeaderCellProperty
                        title={CSAT_SCORE}
                        width={columnWidths.surveyScore}
                        className={css.headerCell}
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
                {!isAiSalesAgentTotalNumberOfOrdersMetric && (
                    <HeaderCellProperty
                        title="Assignee"
                        width={columnWidths.assignee}
                        className={css.headerCell}
                        tooltip={tooltipHints.assignee}
                    />
                )}
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
                            title={ACCURACY_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[AutoQAMetric.Accuracy]
                                        .hint}
                                />
                            }
                        />
                        <HeaderCellProperty
                            title={INTERNAL_COMPLIANCE_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[
                                        AutoQAMetric.InternalCompliance
                                    ].hint}
                                />
                            }
                        />
                        <HeaderCellProperty
                            title={EFFICIENCY_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[AutoQAMetric.Efficiency]
                                        .hint}
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
                        <HeaderCellProperty
                            title={LANGUAGE_PROFICIENCY_SKILLS_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[
                                        AutoQAMetric.LanguageProficiency
                                    ].hint}
                                />
                            }
                        />
                        <HeaderCellProperty
                            title={BRAND_VOICE_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[AutoQAMetric.BrandVoice]
                                        .hint}
                                />
                            }
                        />
                    </>
                )}
                {!(
                    isAiInsightsMetric ||
                    isAiPerformanceMetric ||
                    isAiInsightsCsatMetric ||
                    isAiSalesAgentConversationsMetric ||
                    isAiSalesAgentSuccessRateMetric ||
                    isAiSalesAgentDiscountOfferedMetric ||
                    isAiSalesAgentTotalNumberOfOrdersMetric
                ) && (
                    <HeaderCellProperty
                        title="Contact Reason"
                        width={columnWidths.contactReason}
                        className={css.headerCell}
                        tooltip={tooltipHints.contactReason}
                    />
                )}

                {(isAiPerformanceMetric || isAiInsightsCsatMetric) && (
                    <HeaderCellProperty
                        title="Intent"
                        width={columnWidths.intent}
                        className={css.headerCell}
                        tooltip={tooltipHints.intent}
                    />
                )}
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
                                metricData.metricName,
                            )}
                        >
                            <DrillDownTicketDetailsCell
                                ticketDetails={item.ticket}
                                bodyCellProps={{
                                    width: columnWidths.ticket,
                                }}
                            />
                            {isAiSalesAgentTotalNumberOfOrdersMetric && (
                                <>
                                    <BodyCell width={columnWidths.order}>
                                        {item.order?.id}
                                    </BodyCell>
                                    <BodyCell width={columnWidths.order}>
                                        {item.order?.amount}
                                    </BodyCell>
                                    <BodyCell width={columnWidths.order}>
                                        {item.order?.customer}
                                    </BodyCell>
                                </>
                            )}
                            {(isAiInsightsMetric ||
                                isAiPerformanceMetric ||
                                isAiSalesAgentConversationsMetric ||
                                isAiSalesAgentSuccessRateMetric ||
                                isAiSalesAgentDiscountOfferedMetric) && (
                                <BodyCell width={columnWidths.outcome}>
                                    {item.outcome ? (
                                        <TruncateCellContent
                                            content={item.outcome}
                                        />
                                    ) : (
                                        <span className={css.noData}>
                                            {NOT_AVAILABLE_PLACEHOLDER}
                                        </span>
                                    )}
                                </BodyCell>
                            )}
                            {showMetric && (
                                <BodyCell width={columnWidths.metric}>
                                    {metricValueFormat !== SLA_FORMAT
                                        ? formatMetricValue(
                                              item.metricValue,
                                              metricValueFormat,
                                              NOT_AVAILABLE_PLACEHOLDER,
                                          )
                                        : item.slas && (
                                              <SLAStatusCell item={item.slas} />
                                          )}
                                </BodyCell>
                            )}
                            {showSurveyScore && (
                                <BodyCell width={columnWidths.surveyScore}>
                                    {item.surveyScore ||
                                        NOT_AVAILABLE_PLACEHOLDER}
                                </BodyCell>
                            )}
                            {isAutoQAResolutionCompleteness && (
                                <BodyCell width={columnWidths.metric}>
                                    {
                                        <AutoQACompletenessCell
                                            data={
                                                item?.rowData?.[
                                                    TicketQAScoreMeasure
                                                        .AverageResolutionCompletenessScore
                                                ]
                                            }
                                        />
                                    }
                                </BodyCell>
                            )}
                            {!isAiSalesAgentTotalNumberOfOrdersMetric && (
                                <BodyCell width={columnWidths.assignee}>
                                    {item.assignee && (
                                        <AgentAvatar
                                            agent={item.assignee}
                                            avatarSize={24}
                                            className={css.agent}
                                        />
                                    )}
                                </BodyCell>
                            )}
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
                                                    item?.rowData?.[
                                                        TicketQAScoreMeasure
                                                            .AverageResolutionCompletenessScore
                                                    ]
                                                }
                                            />
                                        }
                                    </BodyCell>
                                    <BodyCell width={columnWidths.metric}>
                                        {
                                            item?.rowData?.[
                                                TicketQAScoreMeasure
                                                    .AverageAccuracyScore
                                            ]
                                        }
                                    </BodyCell>
                                    <BodyCell width={columnWidths.metric}>
                                        {
                                            item?.rowData?.[
                                                TicketQAScoreMeasure
                                                    .AverageInternalComplianceScore
                                            ]
                                        }
                                    </BodyCell>
                                    <BodyCell width={columnWidths.metric}>
                                        {
                                            item?.rowData?.[
                                                TicketQAScoreMeasure
                                                    .AverageEfficiencyScore
                                            ]
                                        }
                                    </BodyCell>
                                    <BodyCell width={columnWidths.metric}>
                                        {
                                            item?.rowData?.[
                                                TicketQAScoreMeasure
                                                    .AverageCommunicationSkillsScore
                                            ]
                                        }
                                    </BodyCell>
                                    <BodyCell width={columnWidths.metric}>
                                        {
                                            item?.rowData?.[
                                                TicketQAScoreMeasure
                                                    .AverageLanguageProficiencyScore
                                            ]
                                        }
                                    </BodyCell>
                                    <BodyCell width={columnWidths.metric}>
                                        {
                                            item?.rowData?.[
                                                TicketQAScoreMeasure
                                                    .AverageBrandVoiceScore
                                            ]
                                        }
                                    </BodyCell>
                                </>
                            )}

                            {!(
                                isAiInsightsMetric ||
                                isAiPerformanceMetric ||
                                isAiInsightsCsatMetric ||
                                isAiSalesAgentSuccessRateMetric ||
                                isAiSalesAgentDiscountOfferedMetric
                            ) && (
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
                            )}

                            {(isAiPerformanceMetric ||
                                isAiInsightsCsatMetric) && (
                                <BodyCell width={columnWidths.intent}>
                                    {item.intent ? (
                                        <TruncateCellContent
                                            content={item.intent}
                                        />
                                    ) : (
                                        <span className={css.noData}>
                                            {NOT_AVAILABLE_PLACEHOLDER}
                                        </span>
                                    )}
                                </BodyCell>
                            )}
                        </TableBodyRow>
                    ))
                )}
            </TableBody>
        </>
    )
}
