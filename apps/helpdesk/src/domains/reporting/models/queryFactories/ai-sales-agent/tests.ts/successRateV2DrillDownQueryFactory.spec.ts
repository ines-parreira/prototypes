import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import {
    SuccessRateDimension,
    SuccessRateFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/SuccessRateCube'
import { successRateV2DrillDownQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

const successRateFiltersMembers = {
    periodStart: SuccessRateFilterMember.PeriodStart,
    periodEnd: SuccessRateFilterMember.PeriodEnd,
    storeIntegrations: SuccessRateFilterMember.StoreIntegrationId,
}

describe('successRateV2DrillDownQueryFactory', () => {
    it('should build a query', () => {
        const filters = {
            period: {
                start_datetime: '2021-01-01T00:00:00Z',
                end_datetime: '2021-01-02T00:00:00Z',
            },
        }

        expect(successRateV2DrillDownQueryFactory(filters, 'UTC')).toEqual({
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES_DRILL_DOWN,
            measures: [],
            dimensions: [SuccessRateDimension.TicketId],
            filters: [
                {
                    member: SuccessRateFilterMember.AiAgentSkill,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSales],
                },
                ...statsFiltersToReportingFilters(
                    successRateFiltersMembers,
                    filters,
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
            timezone: 'UTC',
        })
    })

    it('should build a query with storeIntegrationId filter', () => {
        const filters = {
            period: {
                start_datetime: '2021-01-01T00:00:00Z',
                end_datetime: '2021-01-02T00:00:00Z',
            },
            storeIntegrations: {
                values: [123],
                operator: LogicalOperatorEnum.ONE_OF,
            },
        }

        expect(successRateV2DrillDownQueryFactory(filters, 'UTC')).toEqual({
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES_DRILL_DOWN,
            measures: [],
            dimensions: [SuccessRateDimension.TicketId],
            filters: [
                {
                    member: SuccessRateFilterMember.AiAgentSkill,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSales],
                },
                ...statsFiltersToReportingFilters(
                    successRateFiltersMembers,
                    filters,
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
            timezone: 'UTC',
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
            successRateV2DrillDownQueryFactory(
                filters,
                'UTC',
                OrderDirection.Desc,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES_DRILL_DOWN,
            measures: [],
            dimensions: [SuccessRateDimension.TicketId],
            filters: [
                {
                    member: SuccessRateFilterMember.AiAgentSkill,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSales],
                },
                ...statsFiltersToReportingFilters(
                    successRateFiltersMembers,
                    filters,
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[SuccessRateDimension.TicketId, OrderDirection.Desc]],
            timezone: 'UTC',
        })
    })
})
