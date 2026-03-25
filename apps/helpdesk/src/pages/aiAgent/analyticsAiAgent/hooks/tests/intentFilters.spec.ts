import { buildIntentFilters } from 'pages/aiAgent/analyticsAiAgent/hooks/intentFilters'
import { TICKET_FIELD_ID_NOT_AVAILABLE } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

const baseFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}

describe('buildIntentFilters', () => {
    it('includes customFieldId filter when intentCustomFieldId is valid', () => {
        const result = buildIntentFilters(baseFilters, 42)

        expect(result).toEqual({
            ...baseFilters,
            customFieldId: {
                operator: 'one-of',
                values: [42],
            },
        })
    })

    it('omits customFieldId filter when intentCustomFieldId is TICKET_FIELD_ID_NOT_AVAILABLE', () => {
        const result = buildIntentFilters(
            baseFilters,
            TICKET_FIELD_ID_NOT_AVAILABLE,
        )

        expect(result).toEqual(baseFilters)
        expect(result).not.toHaveProperty('customFieldId')
    })

    it('preserves all existing filters from statsFilters', () => {
        const result = buildIntentFilters(baseFilters, 99)

        expect(result.period).toEqual(baseFilters.period)
    })
})
