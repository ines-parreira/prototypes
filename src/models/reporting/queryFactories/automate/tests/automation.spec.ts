import moment from 'moment/moment'

import {overallTimeSavedWithAutomationQueryFactory} from 'models/reporting/queryFactories/automate/overallTimeSavedWithAutomation'
import {resolutionTimeWithAutomationQueryFactory} from 'models/reporting/queryFactories/automate/resolutionTimeWithAutomation'
import {
    AutomationBillingEventMeasure,
    AutomationBillingEventMember,
} from 'models/reporting/cubes/AutomationBillingEventCube'
import {firstResponseTimeWithAutomationQueryFactory} from 'models/reporting/queryFactories/support-performance/firstResponseTimeWithAutomationQueryFactory'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {automatedInteractionsQueryFactory} from 'models/reporting/queryFactories/automate/automatedInteractions'
import {automationRateQueryFactory} from 'models/reporting/queryFactories/automate/automationRate'

describe('Automate', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe.each([
        [
            'FirstResponseTimeWithAutomation',
            AutomationBillingEventMeasure.FirstResponseTimeWithAutomation,
            firstResponseTimeWithAutomationQueryFactory,
        ],
        [
            'ResolutionTimeWithAutomation',
            AutomationBillingEventMeasure.ResolutionTimeWithAutomation,
            resolutionTimeWithAutomationQueryFactory,
        ],
        [
            'OverallTimeSaved',
            AutomationBillingEventMeasure.OverallTimeSaved,
            overallTimeSavedWithAutomationQueryFactory,
        ],
        [
            'AutomationRate',
            AutomationBillingEventMeasure.AutomationRate,
            automationRateQueryFactory,
        ],
        [
            'AutomatedInteractions',
            AutomationBillingEventMeasure.AutomatedInteractions,
            automatedInteractionsQueryFactory,
        ],
    ])('%s', (_testName, kpi, getAutomationFactory) => {
        it('should create a query', () => {
            const query = getAutomationFactory(statsFilters, timezone)

            expect(query).toEqual({
                measures: [kpi],
                dimensions: [],
                filters: [
                    {
                        member: AutomationBillingEventMember.CreatedDate,
                        operator: ReportingFilterOperator.InDateRange,
                        values: [periodStart, periodEnd],
                    },
                    {
                        member: AutomationBillingEventMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: AutomationBillingEventMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                ],
                timezone,
            })
        })
    })
})
