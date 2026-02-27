import {
    AI_AGENT_TICKET_HANDOVER,
    FLOW_HANDOVER_TICKET_CREATED,
} from 'domains/reporting/hooks/automate/types'
import { AutomateEventType } from 'domains/reporting/hooks/automate/utils'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AIAgentInteractionsBySkillDatasetDimension,
    AIAgentInteractionsBySkillMeasure,
    AIAgentSkills,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import {
    AutomationDatasetFilterMember,
    AutomationDatasetMeasure,
} from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import {
    aiAgentAutomatedInteractionsQueryFactory,
    aiAgentHandoversQueryFactory,
    aiAgentSupportInteractionsQueryFactory,
    articleRecommendationAutomatedInteractionsQueryFactory,
    automationDatasetQueryFactory,
    billableTicketDatasetExcludingAIAgentQueryFactory,
    billableTicketDatasetQueryFactory,
    billableTicketDatasetResolvedByAIAgentQueryFactory,
    flowsAutomatedInteractionsQueryFactory,
    flowsHandoversQueryFactory,
    orderManagementAutomatedInteractionsQueryFactory,
} from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'

describe('Automate metrics', () => {
    const timezone = 'UTC'
    const filters: StatsFilters = {
        channels: withDefaultLogicalOperator(['chat']),
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }

    describe('billableTicketDatasetExcludingAIAgentQueryFactory', () => {
        it('filters out tickets resolved by AI agent', () => {
            const aiAgentUserId = 4000
            expect(
                billableTicketDatasetExcludingAIAgentQueryFactory(
                    filters,
                    timezone,
                    aiAgentUserId,
                ),
            ).toEqual({
                metricName:
                    METRIC_NAMES.AUTOMATE_BILLABLE_TICKET_DATASET_EXCLUDING_AI_AGENT,
                dimensions: [],
                filters: [
                    {
                        member: 'BillableTicketDataset.periodStart',
                        operator: 'afterDate',
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.periodEnd',
                        operator: 'beforeDate',
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.resolvedByAgentUserId',
                        operator: 'notEquals',
                        values: ['4000'],
                    },
                ],
                measures: [
                    'BillableTicketDataset.billableTicketCount',
                    'BillableTicketDataset.totalFirstResponseTime',
                    'BillableTicketDataset.totalResolutionTime',
                ],
                timezone: 'UTC',
            })
        })

        it('does not filter out tickets resolved by AI agent if there is no AI agent', () => {
            expect(
                billableTicketDatasetExcludingAIAgentQueryFactory(
                    filters,
                    timezone,
                    undefined,
                ),
            ).toEqual({
                metricName:
                    METRIC_NAMES.AUTOMATE_BILLABLE_TICKET_DATASET_EXCLUDING_AI_AGENT,
                dimensions: [],
                filters: [
                    {
                        member: 'BillableTicketDataset.periodStart',
                        operator: 'afterDate',
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.periodEnd',
                        operator: 'beforeDate',
                        values: ['2021-01-02T00:00:00.000'],
                    },
                ],
                measures: [
                    'BillableTicketDataset.billableTicketCount',
                    'BillableTicketDataset.totalFirstResponseTime',
                    'BillableTicketDataset.totalResolutionTime',
                ],
                timezone: 'UTC',
            })
        })
    })

    describe('billableTicketDatasetResolvedByAIAgentQueryFactory', () => {
        it('filters by resolved by agent user id', () => {
            const aiAgentUserId = '4000'
            expect(
                billableTicketDatasetResolvedByAIAgentQueryFactory(
                    filters,
                    timezone,
                    aiAgentUserId,
                ),
            ).toEqual({
                metricName:
                    METRIC_NAMES.AUTOMATE_BILLABLE_TICKET_DATASET_RESOLVED_BY_AI_AGENT,
                dimensions: [],
                filters: [
                    {
                        member: 'BillableTicketDataset.periodStart',
                        operator: 'afterDate',
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.periodEnd',
                        operator: 'beforeDate',
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.resolvedByAgentUserId',
                        operator: 'equals',
                        values: ['4000'],
                    },
                ],
                measures: [
                    'BillableTicketDataset.billableTicketCount',
                    'BillableTicketDataset.totalFirstResponseTime',
                    'BillableTicketDataset.totalResolutionTime',
                ],
                timezone: 'UTC',
            })
        })

        it('filters with resolvedByAgentUserId = -1 if there is no AI agent', () => {
            expect(
                billableTicketDatasetResolvedByAIAgentQueryFactory(
                    filters,
                    timezone,
                    undefined,
                ),
            ).toEqual({
                metricName:
                    METRIC_NAMES.AUTOMATE_BILLABLE_TICKET_DATASET_RESOLVED_BY_AI_AGENT,
                dimensions: [],
                filters: [
                    {
                        member: 'BillableTicketDataset.periodStart',
                        operator: 'afterDate',
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.periodEnd',
                        operator: 'beforeDate',
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.resolvedByAgentUserId',
                        operator: 'equals',
                        values: ['-1'],
                    },
                ],
                measures: [
                    'BillableTicketDataset.billableTicketCount',
                    'BillableTicketDataset.totalFirstResponseTime',
                    'BillableTicketDataset.totalResolutionTime',
                ],
                timezone: 'UTC',
            })
        })
    })

    describe('aiAgentAutomatedInteractionsQueryFactory', () => {
        it('creates a query for AI agent automated interactions', () => {
            const result = aiAgentAutomatedInteractionsQueryFactory(
                filters,
                timezone,
            )
            expect(result).toEqual({
                metricName: METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS,
                dimensions: [],
                filters: [
                    {
                        member: AutomationDatasetFilterMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.EventType,
                        operator: ReportingFilterOperator.Equals,
                        values: [AutomateEventType.AI_AGENT_TICKET_RESOLVED],
                    },
                ],
                measures: [
                    AutomationDatasetMeasure.AutomatedInteractions,
                    AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
                ],
                timezone: timezone,
            })
        })
    })

    describe('automationDatasetQueryFactory', () => {
        it('creates a query for automation dataset', () => {
            const result = automationDatasetQueryFactory(filters, timezone)
            expect(result).toEqual({
                metricName: METRIC_NAMES.AUTOMATE_AUTOMATION_DATASET,
                dimensions: [],
                filters: [
                    {
                        member: AutomationDatasetFilterMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: ['chat'],
                    },
                ],
                measures: [
                    AutomationDatasetMeasure.AutomatedInteractions,
                    AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
                ],
                timezone: 'UTC',
            })
        })
    })

    describe('billableTicketDatasetQueryFactory', () => {
        it('creates a query for billable ticket dataset', () => {
            const result = billableTicketDatasetQueryFactory(filters, timezone)
            expect(result).toEqual({
                metricName: METRIC_NAMES.AUTOMATE_BILLABLE_TICKET_DATASET,
                dimensions: [],
                filters: [
                    {
                        member: 'BillableTicketDataset.periodStart',
                        operator: 'afterDate',
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: 'BillableTicketDataset.periodEnd',
                        operator: 'beforeDate',
                        values: ['2021-01-02T00:00:00.000'],
                    },
                ],
                measures: [
                    BillableTicketDatasetMeasure.BillableTicketCount,
                    BillableTicketDatasetMeasure.TotalFirstResponseTime,
                    BillableTicketDatasetMeasure.TotalResolutionTime,
                ],
                timezone: 'UTC',
            })
        })
    })

    describe('flowsAutomatedInteractionsQueryFactory', () => {
        it('creates a query for flows automated interactions', () => {
            const result = flowsAutomatedInteractionsQueryFactory(
                filters,
                timezone,
            )
            expect(result).toEqual({
                metricName: METRIC_NAMES.AUTOMATE_FLOWS_AUTOMATED_INTERACTIONS,
                dimensions: [],
                filters: [
                    {
                        member: AutomationDatasetFilterMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.EventType,
                        operator: ReportingFilterOperator.Equals,
                        values: [
                            AutomateEventType.FLOW_STARTED,
                            AutomateEventType.FLOW_PROMPT_STARTED,
                            AutomateEventType.FLOW_ENDED_WITHOUT_ACTION,
                        ],
                    },
                ],
                measures: [AutomationDatasetMeasure.AutomatedInteractions],
                timezone: 'UTC',
            })
        })
    })

    describe('articleRecommendationAutomatedInteractionsQueryFactory', () => {
        it('creates a query for article recommendation automated interactions', () => {
            const result =
                articleRecommendationAutomatedInteractionsQueryFactory(
                    filters,
                    timezone,
                )
            expect(result).toEqual({
                metricName:
                    METRIC_NAMES.AUTOMATE_ARTICLE_RECOMMENDATION_AUTOMATED_INTERACTIONS,
                dimensions: [],
                filters: [
                    {
                        member: AutomationDatasetFilterMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.EventType,
                        operator: ReportingFilterOperator.Equals,
                        values: [
                            AutomateEventType.ARTICLE_RECOMMENDATION_STARTED,
                        ],
                    },
                ],
                measures: [AutomationDatasetMeasure.AutomatedInteractions],
                timezone: 'UTC',
            })
        })
    })

    describe('orderManagementAutomatedInteractionsQueryFactory', () => {
        it('creates a query for order management automated interactions', () => {
            const result = orderManagementAutomatedInteractionsQueryFactory(
                filters,
                timezone,
            )
            expect(result).toEqual({
                metricName:
                    METRIC_NAMES.AUTOMATE_ORDER_MANAGEMENT_AUTOMATED_INTERACTIONS,
                dimensions: [],
                filters: [
                    {
                        member: AutomationDatasetFilterMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.EventType,
                        operator: ReportingFilterOperator.Equals,
                        values: [
                            AutomateEventType.TRACK_ORDER,
                            AutomateEventType.LOOP_RETURNS_STARTED,
                            AutomateEventType.AUTOMATED_RESPONSE_STARTED,
                        ],
                    },
                ],
                measures: [AutomationDatasetMeasure.AutomatedInteractions],
                timezone: 'UTC',
            })
        })
    })

    describe('aiAgentSupportInteractionsQueryFactory', () => {
        it('creates a query for AI agent support interactions', () => {
            const result = aiAgentSupportInteractionsQueryFactory(
                filters,
                timezone,
            )
            expect(result).toEqual({
                metricName:
                    METRIC_NAMES.AUTOMATE_AI_AGENT_INTERACTIONS_BY_SKILL,
                dimensions: [
                    AIAgentInteractionsBySkillDatasetDimension.BillableType,
                ],
                filters: [
                    {
                        member: 'AIAgentAutomatedInteractions.periodStart',
                        operator: ReportingFilterOperator.AfterDate,
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: 'AIAgentAutomatedInteractions.periodEnd',
                        operator: ReportingFilterOperator.BeforeDate,
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: AIAgentInteractionsBySkillDatasetDimension.BillableType,
                        operator: ReportingFilterOperator.Equals,
                        values: [AIAgentSkills.AIAgentSupport],
                    },
                ],
                measures: [AIAgentInteractionsBySkillMeasure.Count],
                timezone: 'UTC',
            })
        })
    })

    describe('aiAgentHandoversQueryFactory', () => {
        it('creates a query for AI agent handovers', () => {
            const result = aiAgentHandoversQueryFactory(filters, timezone)
            expect(result).toEqual({
                metricName: METRIC_NAMES.AUTOMATE_AI_AGENT_HANDOVERS,
                dimensions: [],
                filters: [
                    {
                        member: AutomationDatasetFilterMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.EventType,
                        operator: ReportingFilterOperator.Equals,
                        values: [AI_AGENT_TICKET_HANDOVER],
                    },
                ],
                measures: [
                    AutomationDatasetMeasure.AutomatedInteractions,
                    AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
                ],
                timezone: 'UTC',
            })
        })
    })

    describe('flowsHandoversQueryFactory', () => {
        it('creates a query for flows handovers', () => {
            const result = flowsHandoversQueryFactory(filters, timezone)
            expect(result).toEqual({
                metricName: METRIC_NAMES.AUTOMATE_FLOWS_HANDOVERS,
                dimensions: [],
                filters: [
                    {
                        member: AutomationDatasetFilterMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: AutomationDatasetFilterMember.EventType,
                        operator: ReportingFilterOperator.Equals,
                        values: [FLOW_HANDOVER_TICKET_CREATED],
                    },
                ],
                measures: [
                    AutomationDatasetMeasure.AutomatedInteractions,
                    AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
                ],
                timezone: 'UTC',
            })
        })
    })
})
