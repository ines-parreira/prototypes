import { FilterKey } from 'domains/reporting/models/stat/types'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

const baseFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}

describe('applyAiAgentFilter', () => {
    it('should set Agents filter with the provided aiAgentUserId', () => {
        const result = applyAiAgentFilter(baseFilters, 42)

        expect(result[FilterKey.Agents]).toEqual({
            operator: 'one-of',
            values: [42],
        })
    })

    it('should set an empty Agents filter when aiAgentUserId is undefined', () => {
        const result = applyAiAgentFilter(baseFilters, undefined)

        expect(result[FilterKey.Agents]).toEqual({
            operator: 'one-of',
            values: [],
        })
    })

    it('should preserve other filter properties', () => {
        const result = applyAiAgentFilter(baseFilters, 42)

        expect(result.period).toBe(baseFilters.period)
    })
})
