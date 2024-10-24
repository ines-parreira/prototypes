import moment from 'moment/moment'

import {
    AutomationDatasetFilterMember,
    AutomationDatasetMeasure,
} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {ReportingFilterOperator} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'

import {automationDatasetQueryFactory} from '../metrics'

describe('Automate', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: LegacyStatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
        channels: ['chat', 'help-center'],
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
