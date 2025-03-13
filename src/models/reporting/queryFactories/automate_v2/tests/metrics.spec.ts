import { AutomateEventType } from 'hooks/reporting/automate/utils'
import {
    AutomationDatasetFilterMember,
    AutomationDatasetMeasure,
} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {
    aiAgentAutomatedInteractionsQueryFactory,
    billableTicketDatasetExcludingAIAgentQueryFactory,
    billableTicketDatasetResolvedByAIAgentQueryFactory,
} from 'models/reporting/queryFactories/automate_v2/metrics'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

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
            const aiAgentUserId = '4000'
            expect(
                billableTicketDatasetExcludingAIAgentQueryFactory(
                    filters,
                    timezone,
                    aiAgentUserId,
                ),
            ).toEqual({
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
})
