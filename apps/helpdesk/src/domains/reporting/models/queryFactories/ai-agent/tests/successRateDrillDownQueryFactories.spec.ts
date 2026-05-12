import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    SuccessRateDimension,
    SuccessRateFilterMember,
} from 'domains/reporting/models/cubes/ai-agent/SuccessRateCube'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import {
    allAgentsSuccessRateDrillDownQueryFactory,
    shoppingAssistantSuccessRateDrillDownQueryFactory,
    supportAgentSuccessRateDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-agent/successRateDrillDownQueryFactories'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

const timezone = 'UTC'

const successRateFiltersMembers = {
    periodStart: SuccessRateFilterMember.PeriodStart,
    periodEnd: SuccessRateFilterMember.PeriodEnd,
    channels: SuccessRateFilterMember.Channel,
    stores: SuccessRateFilterMember.StoreIntegrationId,
}

const isSuccessfulFilter = {
    member: SuccessRateFilterMember.IsSuccessful,
    operator: ReportingFilterOperator.Equals,
    values: ['1'],
}

describe('shoppingAssistantSuccessRateDrillDownQueryFactory', () => {
    it('should build a query', () => {
        const filters = {
            period: {
                start_datetime: '2021-01-01T00:00:00Z',
                end_datetime: '2021-01-02T00:00:00Z',
            },
        }

        expect(
            shoppingAssistantSuccessRateDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName: METRIC_NAMES.AI_SALES_AGENT_SUCCESS_RATE_DRILL_DOWN,
            measures: [],
            dimensions: [SuccessRateDimension.TicketId],
            filters: [
                {
                    member: SuccessRateFilterMember.AiAgentRole,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSales],
                },
                isSuccessfulFilter,
                ...statsFiltersToReportingFilters(
                    successRateFiltersMembers,
                    filters,
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
            timezone,
        })
    })

    it('should build a query with stores filter', () => {
        const filters = {
            period: {
                start_datetime: '2021-01-01T00:00:00Z',
                end_datetime: '2021-01-02T00:00:00Z',
            },
            stores: withDefaultLogicalOperator([123]),
        }

        expect(
            shoppingAssistantSuccessRateDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName: METRIC_NAMES.AI_SALES_AGENT_SUCCESS_RATE_DRILL_DOWN,
            measures: [],
            dimensions: [SuccessRateDimension.TicketId],
            filters: [
                {
                    member: SuccessRateFilterMember.AiAgentRole,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSales],
                },
                isSuccessfulFilter,
                ...statsFiltersToReportingFilters(
                    successRateFiltersMembers,
                    filters,
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
            timezone,
        })
    })

    it('should build a query with sorting', () => {
        const filters = {
            period: {
                start_datetime: '2021-01-01T00:00:00Z',
                end_datetime: '2021-01-02T00:00:00Z',
            },
        }

        expect(
            shoppingAssistantSuccessRateDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Desc,
            ),
        ).toEqual({
            metricName: METRIC_NAMES.AI_SALES_AGENT_SUCCESS_RATE_DRILL_DOWN,
            measures: [],
            dimensions: [SuccessRateDimension.TicketId],
            filters: [
                {
                    member: SuccessRateFilterMember.AiAgentRole,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSales],
                },
                isSuccessfulFilter,
                ...statsFiltersToReportingFilters(
                    successRateFiltersMembers,
                    filters,
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[SuccessRateDimension.TicketId, OrderDirection.Desc]],
            timezone,
        })
    })
})

describe('allAgentsSuccessRateDrillDownQueryFactory', () => {
    const filters = {
        channels: withDefaultLogicalOperator(['chat']),
        stores: withDefaultLogicalOperator([122]),
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }

    it('returns correct query', () => {
        expect(
            allAgentsSuccessRateDrillDownQueryFactory(filters, timezone),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_ALL_AGENTS_SUCCESS_RATE_DRILL_DOWN,
            measures: [],
            dimensions: [SuccessRateDimension.TicketId],
            filters: [
                isSuccessfulFilter,
                ...statsFiltersToReportingFilters(
                    successRateFiltersMembers,
                    filters,
                ),
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            allAgentsSuccessRateDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Desc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [[SuccessRateDimension.TicketId, OrderDirection.Desc]],
            }),
        )
    })
})

describe('supportAgentSuccessRateDrillDownQueryFactory', () => {
    const filters = {
        channels: withDefaultLogicalOperator(['chat']),
        stores: withDefaultLogicalOperator([122]),
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }

    it('returns correct query', () => {
        expect(
            supportAgentSuccessRateDrillDownQueryFactory(filters, timezone),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_SUCCESS_RATE_DRILL_DOWN,
            measures: [],
            dimensions: [SuccessRateDimension.TicketId],
            filters: [
                {
                    member: SuccessRateFilterMember.AiAgentRole,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSupport],
                },
                isSuccessfulFilter,
                ...statsFiltersToReportingFilters(
                    successRateFiltersMembers,
                    filters,
                ),
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            supportAgentSuccessRateDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Asc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [[SuccessRateDimension.TicketId, OrderDirection.Asc]],
            }),
        )
    })
})
