import {withEnrichment} from 'hooks/reporting/withEnrichment'
import {EnrichmentFields} from 'models/reporting/types'

describe('withEnrichment', () => {
    const results = [
        {entityId: 1, metric: 123},
        {entityId: 2, metric: 456},
        {entityId: 3, metric: 789},
        {entityId: 4, metric: 369},
        {entityId: 5, metric: 529},
    ]
    const enrichments = [
        {[EnrichmentFields.TicketId]: 1, fieldA: 'Jan', fieldB: 'Kowalski'},
        {[EnrichmentFields.TicketId]: 2, fieldA: 'Petar', fieldB: 'Petrović'},
        {[EnrichmentFields.TicketId]: 3, fieldA: 'Jean', fieldB: 'Dupont'},
        {[EnrichmentFields.TicketId]: 4, fieldB: null},
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
            'fieldA' | 'fieldB',
            'entityId'
        >(response as any, 'entityId', enrichmentFields)

        expect(responseWithEnrichment.data.data).toEqual([
            {entityId: 1, metric: 123, fieldA: 'Jan', fieldB: 'Kowalski'},
            {entityId: 2, metric: 456, fieldA: 'Petar', fieldB: 'Petrović'},
            {entityId: 3, metric: 789, fieldA: 'Jean', fieldB: 'Dupont'},
            {entityId: 4, metric: 369, fieldA: null, fieldB: null},
            {entityId: 5, metric: 529, fieldA: null, fieldB: null},
        ])
    })
})
