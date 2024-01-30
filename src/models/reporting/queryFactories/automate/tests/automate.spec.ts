import moment from 'moment/moment'

import {resolutionTimeWithAutomateFeaturesQueryFactory} from 'models/reporting/queryFactories/automate/resolutionTimeWithAutomateFeatures'
import {
    AutomationBillingEventMeasure,
    AutomationBillingEventMember,
} from 'models/reporting/cubes/AutomationBillingEventCube'
import {firstResponseTimeWithAutomateFeaturesQueryFactory} from 'models/reporting/queryFactories/automate/firstResponseTimeWithAutomateFeaturesQueryFactory'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {automatedInteractionsQueryFactory} from 'models/reporting/queryFactories/automate/automatedInteractions'
import {automationRateQueryFactory} from 'models/reporting/queryFactories/automate/automationRate'
import {decreaseInResolutionTimeQueryFactory} from '../decreaseInResolutionTime'

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
            AutomationBillingEventMeasure.FirstResponseTimeWithAutomateFeatures,
            firstResponseTimeWithAutomateFeaturesQueryFactory,
        ],
        [
            'ResolutionTimeWithAutomation',
            AutomationBillingEventMeasure.ResolutionTimeWithAutomateFeatures,
            resolutionTimeWithAutomateFeaturesQueryFactory,
        ],
        [
            'DecreaseInResolutionTime',
            AutomationBillingEventMeasure.DecreaseInResolutionTimeWithAutomateFeatures,
            decreaseInResolutionTimeQueryFactory,
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
                        operator: ReportingFilterOperator.AfterOrOnDate,
                        values: [periodStart],
                    },
                    {
                        member: AutomationBillingEventMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeOrOnDate,
                        values: [periodEnd],
                    },
                ],
                timezone,
            })
        })
    })
})
