import { withEnrichment } from 'hooks/reporting/withEnrichment'
import { EnrichmentFields } from 'models/reporting/types'

describe('withEnrichment', () => {
    const results = [
        { [EnrichmentFields.TicketId]: 1, metric: 123 },
        { [EnrichmentFields.TicketId]: 2, metric: 456 },
        { [EnrichmentFields.TicketId]: 3, metric: 789 },
        { [EnrichmentFields.TicketId]: 4, metric: 369 },
        { [EnrichmentFields.TicketId]: 5, metric: 529 },
    ]
    const enrichments = [
        { [EnrichmentFields.TicketId]: 1, fieldA: 'Jan', fieldB: 'Kowalski' },
        { [EnrichmentFields.TicketId]: 2, fieldA: 'Petar', fieldB: 'Petrović' },
        { [EnrichmentFields.TicketId]: 3, fieldA: 'Jean', fieldB: 'Dupont' },
        { [EnrichmentFields.TicketId]: 4, fieldB: null },
    ]
    const enrichmentFields = ['fieldA' as const, 'fieldB' as const]

    const response = {
        data: {
            data: results,
            enrichment: enrichments,
        },
    }

    it('should merge results with enrichment', () => {
        const responseWithEnrichment = withEnrichment<
            'metric',
            'fieldA' | 'fieldB' | EnrichmentFields.TicketId,
            EnrichmentFields.TicketId,
            EnrichmentFields.TicketId
        >(
            response as any,
            EnrichmentFields.TicketId,
            enrichmentFields,
            EnrichmentFields.TicketId,
        )

        expect(responseWithEnrichment.data.data).toEqual([
            {
                [EnrichmentFields.TicketId]: 1,
                metric: 123,
                fieldA: 'Jan',
                fieldB: 'Kowalski',
            },
            {
                [EnrichmentFields.TicketId]: 2,
                metric: 456,
                fieldA: 'Petar',
                fieldB: 'Petrović',
            },
            {
                [EnrichmentFields.TicketId]: 3,
                metric: 789,
                fieldA: 'Jean',
                fieldB: 'Dupont',
            },
            {
                [EnrichmentFields.TicketId]: 4,
                metric: 369,
                fieldA: null,
                fieldB: null,
            },
            {
                [EnrichmentFields.TicketId]: 5,
                metric: 529,
                fieldA: null,
                fieldB: null,
            },
        ])
    })
})
