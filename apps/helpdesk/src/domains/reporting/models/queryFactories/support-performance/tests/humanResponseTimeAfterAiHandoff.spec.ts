import {
    humanResponseTimeAfterAiHandoffDrillDownQueryFactory,
    humanResponseTimeAfterAiHandoffQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

describe('humanResponseTimeAfterAiHandoff', () => {
    const periodStart = '2025-01-01T00:00:00'
    const periodEnd = '2025-01-07T23:59:59'

    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    describe('base query factory', () => {
        it('TODO: implement', () => {
            const actual = humanResponseTimeAfterAiHandoffQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            expect(actual).toEqual({
                measures: [],
                dimensions: [],
                filters: [],
            })
        })
    })

    describe('drill-down query factory', () => {
        it('TODO: implement', () => {
            const actual = humanResponseTimeAfterAiHandoffDrillDownQueryFactory(
                statsFilters,
                timezone,
                sorting,
            )

            expect(actual).toEqual({
                measures: [],
                dimensions: [],
                filters: [],
            })
        })
    })
})
