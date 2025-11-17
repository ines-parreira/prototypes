import moment from 'moment/moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AutomationDatasetFilterMember,
    AutomationDatasetMeasure,
} from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { automationDatasetQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

describe('Automate', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
        channels: withDefaultLogicalOperator(['chat', 'help-center']),
    }
    const timezone = 'someTimeZone'

    describe.each([
        [
            'AutomatedInteractions',
            [
                AutomationDatasetMeasure.AutomatedInteractions,
                AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
            ],
            automationDatasetQueryFactory,
        ],
    ])('%s', (_testName, kpi, getAutomationFactory) => {
        it('should create a query', () => {
            const query = getAutomationFactory(statsFilters, timezone)

            expect(query).toEqual({
                metricName: METRIC_NAMES.AUTOMATE_AUTOMATION_DATASET,
                measures: [...kpi],
                dimensions: [],
                filters: [
                    {
                        member: AutomationDatasetFilterMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: AutomationDatasetFilterMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    {
                        member: AutomationDatasetFilterMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: ['chat', 'help-center'],
                    },
                ],
                timezone,
            })
        })
    })
})
