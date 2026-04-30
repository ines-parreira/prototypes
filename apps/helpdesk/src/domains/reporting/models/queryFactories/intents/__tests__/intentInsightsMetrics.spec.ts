import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    aggregateIntentMetrics,
    intentHandoverDrillDownQueryFactory,
    intentTicketVolumeDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/intents/intentInsightsMetrics'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

const DIMENSION_KEY = TicketCustomFieldsDimension.TicketCustomFieldsValueString
const MEASURE_KEY = TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount

const makeRecord = (intentValue: string, count: number) => ({
    [DIMENSION_KEY]: intentValue,
    [MEASURE_KEY]: String(count),
})

describe('aggregateIntentMetrics', () => {
    it('should return empty map when totalData is undefined', () => {
        const result = aggregateIntentMetrics(undefined, [], 100)
        expect(result.size).toBe(0)
    })

    it('should return empty map when handoverData is undefined', () => {
        const result = aggregateIntentMetrics([], undefined, 100)
        expect(result.size).toBe(0)
    })

    it('should aggregate L2 intents and their L1 parents', () => {
        const totalData = [
            makeRecord('product::details', 30),
            makeRecord('product::pricing', 20),
            makeRecord('shipping::tracking', 50),
        ]
        const handoverData = [
            makeRecord('product::details', 5),
            makeRecord('product::pricing', 3),
            makeRecord('shipping::tracking', 10),
        ]

        const result = aggregateIntentMetrics(totalData, handoverData, 200)

        // L2 intents
        expect(result.get('product::details')).toEqual({
            ticketVolume: 30,
            ticketVolumePercent: 15, // 30/200 = 15%
            handoverCount: 5,
            handoverPercent: 16.7, // 5/30 = 16.67% -> 16.7%
        })

        expect(result.get('product::pricing')).toEqual({
            ticketVolume: 20,
            ticketVolumePercent: 10, // 20/200 = 10%
            handoverCount: 3,
            handoverPercent: 15, // 3/20 = 15%
        })

        expect(result.get('shipping::tracking')).toEqual({
            ticketVolume: 50,
            ticketVolumePercent: 25, // 50/200 = 25%
            handoverCount: 10,
            handoverPercent: 20, // 10/50 = 20%
        })

        // L1 parents (aggregated)
        expect(result.get('product')).toEqual({
            ticketVolume: 50, // 30+20
            ticketVolumePercent: 25, // 50/200 = 25%
            handoverCount: 8, // 5+3
            handoverPercent: 16, // 8/50 = 16%
        })

        expect(result.get('shipping')).toEqual({
            ticketVolume: 50,
            ticketVolumePercent: 25,
            handoverCount: 10,
            handoverPercent: 20,
        })
    })

    it('should handle intents with no handovers', () => {
        const totalData = [makeRecord('product::details', 40)]
        const handoverData: ReturnType<typeof makeRecord>[] = []

        const result = aggregateIntentMetrics(totalData, handoverData, 100)

        expect(result.get('product::details')).toEqual({
            ticketVolume: 40,
            ticketVolumePercent: 40,
            handoverCount: 0,
            handoverPercent: 0,
        })
    })

    it('should handle zero total AI agent tickets', () => {
        const totalData = [makeRecord('product::details', 10)]
        const handoverData = [makeRecord('product::details', 2)]

        const result = aggregateIntentMetrics(totalData, handoverData, 0)

        expect(result.get('product::details')).toEqual({
            ticketVolume: 10,
            ticketVolumePercent: 0,
            handoverCount: 2,
            handoverPercent: 20,
        })
    })

    it('should lowercase intent names', () => {
        const totalData = [makeRecord('Product::Details', 10)]
        const handoverData = [makeRecord('Product::Details', 2)]

        const result = aggregateIntentMetrics(totalData, handoverData, 100)

        expect(result.has('product::details')).toBe(true)
        expect(result.has('product')).toBe(true)
        expect(result.has('Product::Details')).toBe(false)
    })

    it('should skip records with null intent value', () => {
        const totalData = [
            { [DIMENSION_KEY]: null, [MEASURE_KEY]: '10' },
            makeRecord('product::details', 20),
        ]
        const handoverData = [makeRecord('product::details', 5)]

        const result = aggregateIntentMetrics(totalData, handoverData, 100)

        expect(result.size).toBe(2) // product::details + product
    })

    it('should skip records with null count', () => {
        const totalData = [
            { [DIMENSION_KEY]: 'product::details', [MEASURE_KEY]: null },
        ]
        const handoverData: ReturnType<typeof makeRecord>[] = []

        const result = aggregateIntentMetrics(totalData, handoverData, 100)

        expect(result.size).toBe(0)
    })

    it('should handle empty data arrays', () => {
        const result = aggregateIntentMetrics([], [], 100)
        expect(result.size).toBe(0)
    })

    it('should parse string counts correctly', () => {
        const totalData = [makeRecord('product::details', 42)]
        const handoverData = [makeRecord('product::details', 7)]

        const result = aggregateIntentMetrics(totalData, handoverData, 100)

        expect(result.get('product::details')?.ticketVolume).toBe(42)
        expect(result.get('product::details')?.handoverCount).toBe(7)
    })
})

describe('intentTicketVolumeDrillDownQueryFactory', () => {
    it('should produce a drilldown query with correct metric name', () => {
        const filters = {
            [FilterKey.Period]: {
                start_datetime: '2026-01-01',
                end_datetime: '2026-01-28',
            },
        }

        const result = intentTicketVolumeDrillDownQueryFactory(
            filters,
            'UTC',
            456,
            ['product::details'],
            123,
            OrderDirection.Asc,
            ['integration-1'],
        )

        expect(result.metricName).toBe(
            METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_PER_INTENT_LEVEL_DRILL_DOWN,
        )
        expect(result.measures).toEqual([])
        expect(result.dimensions).toContain('TicketEnriched.ticketId')
    })

    it('should not pass outcomeFieldValues', () => {
        const filters = {
            [FilterKey.Period]: {
                start_datetime: '2026-01-01',
                end_datetime: '2026-01-28',
            },
        }

        const result = intentTicketVolumeDrillDownQueryFactory(
            filters,
            'UTC',
            456,
            ['product::details'],
            123,
        )

        const hasOutcomeStartsWith = result.filters.some((f) =>
            f.values?.some(
                (v) => typeof v === 'string' && v.startsWith('123::'),
            ),
        )
        expect(hasOutcomeStartsWith).toBe(true)
    })
})

describe('intentHandoverDrillDownQueryFactory', () => {
    it('should produce a drilldown query with correct metric name', () => {
        const filters = {
            [FilterKey.Period]: {
                start_datetime: '2026-01-01',
                end_datetime: '2026-01-28',
            },
        }

        const result = intentHandoverDrillDownQueryFactory(
            filters,
            'UTC',
            456,
            ['product::details'],
            123,
            OrderDirection.Asc,
            ['integration-1'],
            ['ai_agent_handover'],
        )

        expect(result.metricName).toBe(
            METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT_PER_INTENT_LEVEL_DRILL_DOWN,
        )
        expect(result.measures).toEqual([])
    })

    it('should include outcome field values in filters', () => {
        const filters = {
            [FilterKey.Period]: {
                start_datetime: '2026-01-01',
                end_datetime: '2026-01-28',
            },
        }

        const result = intentHandoverDrillDownQueryFactory(
            filters,
            'UTC',
            456,
            ['product::details'],
            123,
            undefined,
            ['integration-1'],
            ['ai_agent_handover'],
        )

        const hasOutcomeValue = result.filters.some((f) =>
            f.values?.some(
                (v) =>
                    typeof v === 'string' &&
                    v.includes('123::ai_agent_handover'),
            ),
        )
        expect(hasOutcomeValue).toBe(true)
    })
})
