import { logEvent, SegmentEvent } from '@repo/logging'
import { TicketInfobarTab } from '@repo/navigation'
import { formatMetricValue } from '@repo/reporting'
import classNames from 'classnames'

import { Tag } from '@gorgias/axiom'

import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { DROPDOWN_NESTING_DELIMITER } from 'custom-fields/constants'
import {
    defaultEnrichmentFields,
    extraEnrichmentFieldsPerMetric,
    useEnrichedDrillDownData,
} from 'domains/reporting/hooks/useDrillDownData'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { TicketQAScoreMeasure } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { AiSalesAgentChart } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { AgentAvatar } from 'domains/reporting/pages/common/AgentAvatar'
import { DrillDownTableContentSkeleton } from 'domains/reporting/pages/common/components/Table/DrillDownTableContentSkeleton'
import { TruncateCellContent } from 'domains/reporting/pages/common/components/TruncateCellContent'
import { useDrillDownDataContext } from 'domains/reporting/pages/common/drill-down/DrillDownDataContext'
import { formatTicketDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import { DrillDownHeaderCellWithTooltip } from 'domains/reporting/pages/common/drill-down/DrillDownHeaderCellWithTooltip'
import css from 'domains/reporting/pages/common/drill-down/DrillDownTable.less'
import { DrillDownTicketDetailsCell } from 'domains/reporting/pages/common/drill-down/DrillDownTicketDetailsCell'
import { DrillDownTruncateMultilineCellContent } from 'domains/reporting/pages/common/drill-down/DrillDownTruncateMultilineCellContent'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import type { ColumnConfig } from 'domains/reporting/pages/common/drill-down/types'
import { HintTooltipContent } from 'domains/reporting/pages/common/HintTooltip'
import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import { CSAT_SCORE } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionMetricsConfig'
import { SLAStatusCell } from 'domains/reporting/pages/sla/components/SlaStatusCell'
import { SLA_FORMAT } from 'domains/reporting/pages/sla/SlaConfig'
import { AutoQAAgentsTableColumn } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { AutoQACompletenessCell } from 'domains/reporting/pages/support-performance/auto-qa/AutoQACompletenessCell'
import {
    ACCURACY_LABEL,
    BRAND_VOICE_LABEL,
    COMMUNICATION_SKILLS_LABEL,
    EFFICIENCY_LABEL,
    INTERNAL_COMPLIANCE_LABEL,
    LANGUAGE_PROFICIENCY_SKILLS_LABEL,
    RESOLUTION_COMPLETENESS_SHORT_LABEL,
    TrendCardConfig,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import type {
    AutoQAAgentMetric,
    DrillDownMetric,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    AIInsightsMetric,
    AutoQAMetric,
    KnowledgeMetric,
    SatisfactionMetric,
} from 'domains/reporting/state/ui/stats/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

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
                `/app/ticket/${ticketId}?activeTab=${TicketInfobarTab.AIFeedback}`,
                '_blank',
            )
        } else {
            window.open(`/app/ticket/${ticketId}`, '_blank')
        }
    }

export const TicketDrillDownTableContent = ({
    metricData,
    columnConfig,
}: {
    metricData: DrillDownMetric
    columnConfig: ColumnConfig
}) => {
    const isAutoQAResolutionCompleteness =
        metricData.metricName === AutoQAMetric.ResolutionCompleteness ||
        metricData.metricName === AutoQAAgentsTableColumn.ResolutionCompleteness
    const isAutoQAReviewedClosedTickets =
        metricData.metricName === AutoQAMetric.ReviewedClosedTickets ||
        metricData.metricName === AutoQAAgentsTableColumn.ReviewedClosedTickets
    const showSurveyScore =
        metricData.metricName === SatisfactionMetric.SatisfactionScore ||
        metricData.metricName === KnowledgeMetric.CSAT

    const isKnowledgeMetric =
        metricData.metricName === KnowledgeMetric.Tickets ||
        metricData.metricName === KnowledgeMetric.HandoverTickets ||
        metricData.metricName === KnowledgeMetric.CSAT

    const { showMetric, metricTitle, metricValueFormat } = columnConfig

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
    const isAiJourneyTotalOrdersMetric =
        metricData.metricName === AIJourneyMetric.TotalOrders

    const isAiJourneyResponseRateMetric =
        metricData.metricName === AIJourneyMetric.ResponseRate

    const isAiJourneyOptOutRateMetric =
        metricData.metricName === AIJourneyMetric.OptOutRate

    const isAiJourneyClickThroughRateMetric =
        metricData.metricName === AIJourneyMetric.ClickThroughRate

    const isAiSalesAgentDiscountOfferedMetric =
        metricData.metricName === AiSalesAgentChart.AiSalesDiscountOffered

    const isAiSalesAgentTotalProductRecommendationsMetric =
        metricData.metricName ===
        AiSalesAgentChart.AiSalesAgentTotalProductRecommendations

    const isAiAgentAutomatedInteractionsMetric =
        metricData.metricName ===
            AiAgentDrillDownMetricName.AutomatedInteractionsCard ||
        metricData.metricName ===
            AiAgentDrillDownMetricName.ResolvedInteractionsCard ||
        metricData.metricName ===
            AiAgentDrillDownMetricName.SupportInteractionsCard

    // Fetch data directly (used by legacy table, or when context is not available)
    const fetchedData = useEnrichedDrillDownData(
        getDrillDownQuery(metricData),
        metricData,
        extraEnrichmentFieldsPerMetric[metricData.metricName] ||
            defaultEnrichmentFields,
        formatTicketDrillDownRowData,
        EnrichmentFields.TicketId,
    )

    // Try to use context data (for new paginated table), fall back to fetched data (for legacy table)
    const contextData = useDrillDownDataContext() as
        | typeof fetchedData
        | undefined

    // Use context data if available (new table with pagination), otherwise use fetched data (legacy)
    const { data, isFetching } = contextData ?? fetchedData

    const getTicketColumnWidth = () => {
        if (
            isAiInsightsMetric ||
            isAiPerformanceMetric ||
            isAiInsightsCsatMetric ||
            isAiAgentAutomatedInteractionsMetric
        ) {
            return 280
        }

        if (isKnowledgeMetric) {
            return 600
        }

        if (showMetric) {
            return 300
        }

        return 440
    }

    const columnWidths = {
        ticket: getTicketColumnWidth(),
        metric: 140,
        surveyScore: 48,
        assignee: 180,
        created: 180,
        contactReason: 180,
        outcome: 180,
        intent: 180,
        order: 140,
        product: 180,
    }
    const getColumnWidthsForSkeleton = () => {
        const hasOrderColumns =
            isAiSalesAgentTotalNumberOfOrdersMetric ||
            isAiJourneyTotalOrdersMetric
        const hasCustomerColumn =
            isAiJourneyResponseRateMetric ||
            isAiJourneyOptOutRateMetric ||
            isAiJourneyClickThroughRateMetric
        const hasOutcomeColumn =
            isAiInsightsMetric ||
            isAiPerformanceMetric ||
            isAiSalesAgentConversationsMetric ||
            isAiSalesAgentSuccessRateMetric ||
            isAiSalesAgentDiscountOfferedMetric ||
            isAiSalesAgentTotalProductRecommendationsMetric ||
            (isKnowledgeMetric &&
                metricData.metricName !== KnowledgeMetric.CSAT)
        const hasAssigneeColumn =
            (!isAiSalesAgentTotalNumberOfOrdersMetric ||
                isAiJourneyTotalOrdersMetric ||
                hasCustomerColumn) &&
            !isKnowledgeMetric
        const hasContactReasonColumn = !(
            isAiInsightsMetric ||
            isAiPerformanceMetric ||
            isAiInsightsCsatMetric ||
            isAiSalesAgentSuccessRateMetric ||
            isAiSalesAgentDiscountOfferedMetric ||
            isAiSalesAgentTotalProductRecommendationsMetric ||
            isAiAgentAutomatedInteractionsMetric ||
            hasCustomerColumn ||
            isKnowledgeMetric
        )
        const hasIntentColumn =
            isAiPerformanceMetric ||
            isAiInsightsCsatMetric ||
            isAiAgentAutomatedInteractionsMetric

        return [
            columnWidths.ticket,
            ...(hasOrderColumns
                ? [columnWidths.order, columnWidths.order, columnWidths.order]
                : []),
            ...(hasCustomerColumn ? [columnWidths.order] : []),
            ...(isAiSalesAgentTotalProductRecommendationsMetric
                ? [columnWidths.product]
                : []),
            ...(hasOutcomeColumn ? [columnWidths.outcome] : []),
            ...(showMetric ? [columnWidths.metric] : []),
            ...(showSurveyScore ? [columnWidths.surveyScore] : []),
            ...(isAutoQAResolutionCompleteness ? [columnWidths.metric] : []),
            ...(hasAssigneeColumn ? [columnWidths.assignee] : []),
            columnWidths.created,
            ...(isAutoQAReviewedClosedTickets
                ? Array(7).fill(columnWidths.metric)
                : []),
            ...(hasContactReasonColumn ? [columnWidths.contactReason] : []),
            ...(hasIntentColumn ? [columnWidths.intent] : []),
        ].map((width) => width - 40)
    }

    const columnWidthsForSkeleton = getColumnWidthsForSkeleton()

    return (
        <>
            <TableHead>
                <HeaderCellProperty
                    title="Ticket"
                    width={columnWidths.ticket}
                    className={css.headerCell}
                    titleClassName={css.headerCellTitle}
                />
                {(isAiSalesAgentTotalNumberOfOrdersMetric ||
                    isAiJourneyTotalOrdersMetric) && (
                    <>
                        <HeaderCellProperty
                            title="Order"
                            width={columnWidths.order}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                        />
                        <HeaderCellProperty
                            title="Amount"
                            width={columnWidths.order}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                        />
                        <HeaderCellProperty
                            title="Customer"
                            width={columnWidths.order}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                        />
                    </>
                )}
                {(isAiJourneyResponseRateMetric ||
                    isAiJourneyOptOutRateMetric ||
                    isAiJourneyClickThroughRateMetric) && (
                    <HeaderCellProperty
                        title="Customer"
                        width={columnWidths.order}
                        className={css.headerCell}
                        titleClassName={css.headerCellTitle}
                    />
                )}
                {isAiSalesAgentTotalProductRecommendationsMetric && (
                    <>
                        <HeaderCellProperty
                            title="Products SKUs"
                            width={columnWidths.product}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                        />
                    </>
                )}
                {(isAiInsightsMetric ||
                    isAiPerformanceMetric ||
                    isAiSalesAgentConversationsMetric ||
                    isAiSalesAgentSuccessRateMetric ||
                    isAiSalesAgentDiscountOfferedMetric ||
                    isAiSalesAgentTotalProductRecommendationsMetric ||
                    (isKnowledgeMetric &&
                        metricData.metricName !== KnowledgeMetric.CSAT)) && (
                    <DrillDownHeaderCellWithTooltip
                        title="Outcome"
                        width={columnWidths.outcome}
                        className={css.headerCell}
                        titleClassName={css.headerCellTitle}
                        tooltip={tooltipHints.outcome}
                    />
                )}
                {showMetric && (
                    <DrillDownHeaderCellWithTooltip
                        title={metricTitle}
                        width={columnWidths.metric}
                        className={css.headerCell}
                        titleClassName={css.headerCellTitle}
                        tooltip={tooltipHints.metric}
                    />
                )}
                {showSurveyScore && (
                    <HeaderCellProperty
                        title={CSAT_SCORE}
                        width={columnWidths.surveyScore}
                        className={css.headerCell}
                        titleClassName={css.headerCellTitle}
                    />
                )}
                {isAutoQAResolutionCompleteness && (
                    <DrillDownHeaderCellWithTooltip
                        title={RESOLUTION_COMPLETENESS_SHORT_LABEL}
                        width={columnWidths.metric}
                        className={css.headerCell}
                        titleClassName={css.headerCellTitle}
                        tooltip={
                            <HintTooltipContent
                                {...TrendCardConfig[
                                    AutoQAMetric.ResolutionCompleteness
                                ].hint}
                            />
                        }
                    />
                )}
                {(!isAiSalesAgentTotalNumberOfOrdersMetric ||
                    isAiJourneyTotalOrdersMetric ||
                    isAiJourneyResponseRateMetric ||
                    isAiJourneyOptOutRateMetric ||
                    isAiJourneyClickThroughRateMetric) &&
                    !isKnowledgeMetric && (
                        <DrillDownHeaderCellWithTooltip
                            title="Assignee"
                            width={columnWidths.assignee}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                            tooltip={tooltipHints.assignee}
                        />
                    )}
                <HeaderCellProperty
                    title={isKnowledgeMetric ? 'Date' : 'Created'}
                    width={columnWidths.created}
                    className={css.headerCell}
                    titleClassName={css.headerCellTitle}
                />
                {isAutoQAReviewedClosedTickets && (
                    <>
                        <DrillDownHeaderCellWithTooltip
                            title={RESOLUTION_COMPLETENESS_SHORT_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[
                                        AutoQAMetric.ResolutionCompleteness
                                    ].hint}
                                />
                            }
                        />
                        <DrillDownHeaderCellWithTooltip
                            title={ACCURACY_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[AutoQAMetric.Accuracy]
                                        .hint}
                                />
                            }
                        />
                        <DrillDownHeaderCellWithTooltip
                            title={INTERNAL_COMPLIANCE_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[
                                        AutoQAMetric.InternalCompliance
                                    ].hint}
                                />
                            }
                        />
                        <DrillDownHeaderCellWithTooltip
                            title={EFFICIENCY_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[AutoQAMetric.Efficiency]
                                        .hint}
                                />
                            }
                        />
                        <DrillDownHeaderCellWithTooltip
                            title={COMMUNICATION_SKILLS_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[
                                        AutoQAMetric.CommunicationSkills
                                    ].hint}
                                />
                            }
                        />
                        <DrillDownHeaderCellWithTooltip
                            title={LANGUAGE_PROFICIENCY_SKILLS_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                            tooltip={
                                <HintTooltipContent
                                    {...TrendCardConfig[
                                        AutoQAMetric.LanguageProficiency
                                    ].hint}
                                />
                            }
                        />
                        <DrillDownHeaderCellWithTooltip
                            title={BRAND_VOICE_LABEL}
                            width={columnWidths.metric}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
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
                    isAiSalesAgentTotalProductRecommendationsMetric ||
                    isAiSalesAgentTotalNumberOfOrdersMetric ||
                    isAiJourneyTotalOrdersMetric ||
                    isAiJourneyResponseRateMetric ||
                    isAiJourneyOptOutRateMetric ||
                    isAiJourneyClickThroughRateMetric ||
                    isAiAgentAutomatedInteractionsMetric ||
                    isKnowledgeMetric
                ) && (
                    <DrillDownHeaderCellWithTooltip
                        title="Contact Reason"
                        width={columnWidths.contactReason}
                        className={css.headerCell}
                        titleClassName={css.headerCellTitle}
                        tooltip={tooltipHints.contactReason}
                    />
                )}

                {(isAiPerformanceMetric ||
                    isAiInsightsCsatMetric ||
                    isAiAgentAutomatedInteractionsMetric) && (
                    <DrillDownHeaderCellWithTooltip
                        title="Intent"
                        width={columnWidths.intent}
                        className={css.headerCell}
                        titleClassName={css.headerCellTitle}
                        tooltip={tooltipHints.intent}
                    />
                )}
            </TableHead>
            <TableBody>
                {isFetching ? (
                    <DrillDownTableContentSkeleton
                        columnWidths={columnWidthsForSkeleton}
                        rowCount={10}
                        height={40}
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
                            {isAiJourneyTotalOrdersMetric && (
                                <>
                                    <BodyCell width={columnWidths.order}>
                                        {item.order?.id}
                                    </BodyCell>
                                    <BodyCell width={columnWidths.order}>
                                        {formatMetricValue(
                                            parseFloat(
                                                item?.rowData?.[
                                                    AiSalesAgentOrdersMeasure
                                                        .GmvUsd
                                                ],
                                            ),
                                            'currency',
                                        )}
                                    </BodyCell>
                                    <BodyCell width={columnWidths.order}>
                                        {item.order?.customer}
                                    </BodyCell>
                                </>
                            )}
                            {(isAiJourneyResponseRateMetric ||
                                isAiJourneyOptOutRateMetric ||
                                isAiJourneyClickThroughRateMetric) && (
                                <BodyCell width={columnWidths.order}>
                                    {item?.rowData?.[
                                        EnrichmentFields.CustomerName
                                    ] ?? NOT_AVAILABLE_PLACEHOLDER}
                                </BodyCell>
                            )}
                            {isAiSalesAgentTotalProductRecommendationsMetric && (
                                <BodyCell width={columnWidths.product}>
                                    <TruncateCellContent
                                        content={item.product?.variants.join(
                                            ', ',
                                        )}
                                    />
                                </BodyCell>
                            )}
                            {(isAiInsightsMetric ||
                                isAiPerformanceMetric ||
                                isAiSalesAgentConversationsMetric ||
                                isAiSalesAgentSuccessRateMetric ||
                                isAiSalesAgentDiscountOfferedMetric ||
                                isAiSalesAgentTotalProductRecommendationsMetric ||
                                (isKnowledgeMetric &&
                                    metricData.metricName !==
                                        KnowledgeMetric.CSAT)) && (
                                <BodyCell width={columnWidths.outcome}>
                                    {item.outcome ? (
                                        isKnowledgeMetric ? (
                                            <Tag
                                                color={
                                                    item.outcome === 'Automated'
                                                        ? 'green'
                                                        : 'orange'
                                                }
                                            >
                                                {item.outcome}
                                            </Tag>
                                        ) : (
                                            <DrillDownTruncateMultilineCellContent
                                                className={css.multiLineOutcome}
                                                maxLines={
                                                    item.outcome
                                                        ? item.outcome.split(
                                                              DROPDOWN_NESTING_DELIMITER,
                                                          ).length
                                                        : 1
                                                }
                                                tooltip={item.outcome}
                                                value={item.outcome}
                                                splitDelimiter={
                                                    DROPDOWN_NESTING_DELIMITER
                                                }
                                                level1ClassName={css.level1}
                                                sublevelsClassName={
                                                    css.sublevels
                                                }
                                            />
                                        )
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
                            {(!isAiSalesAgentTotalNumberOfOrdersMetric ||
                                isAiJourneyResponseRateMetric ||
                                isAiJourneyOptOutRateMetric ||
                                isAiJourneyClickThroughRateMetric) &&
                                !isKnowledgeMetric && (
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
                                isAiSalesAgentDiscountOfferedMetric ||
                                isAiSalesAgentTotalProductRecommendationsMetric ||
                                isAiJourneyResponseRateMetric ||
                                isAiJourneyOptOutRateMetric ||
                                isAiJourneyClickThroughRateMetric ||
                                isAiAgentAutomatedInteractionsMetric ||
                                isKnowledgeMetric
                            ) && (
                                <BodyCell width={columnWidths.contactReason}>
                                    {item.ticket.contactReason ? (
                                        <DrillDownTruncateMultilineCellContent
                                            className={css.multiLineOutcome}
                                            tooltip={item.ticket.contactReason}
                                            value={item.ticket.contactReason}
                                            splitDelimiter={
                                                DROPDOWN_NESTING_DELIMITER
                                            }
                                            maxLines={
                                                item.ticket.contactReason
                                                    ? item.ticket.contactReason.split(
                                                          DROPDOWN_NESTING_DELIMITER,
                                                      ).length
                                                    : 1
                                            }
                                            level1ClassName={css.level1}
                                            sublevelsClassName={css.sublevels}
                                        />
                                    ) : (
                                        <span className={css.noData}>
                                            {NOT_AVAILABLE_PLACEHOLDER}
                                        </span>
                                    )}
                                </BodyCell>
                            )}

                            {(isAiPerformanceMetric ||
                                isAiInsightsCsatMetric ||
                                isAiAgentAutomatedInteractionsMetric) && (
                                <BodyCell width={columnWidths.intent}>
                                    {item.intent ? (
                                        <DrillDownTruncateMultilineCellContent
                                            className={css.multiLineOutcome}
                                            value={item.intent}
                                            maxLines={
                                                item.intent
                                                    ? item.intent.split(
                                                          DROPDOWN_NESTING_DELIMITER,
                                                      ).length
                                                    : 1
                                            }
                                            splitDelimiter={
                                                DROPDOWN_NESTING_DELIMITER
                                            }
                                            level1ClassName={css.level1}
                                            sublevelsClassName={css.sublevels}
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
