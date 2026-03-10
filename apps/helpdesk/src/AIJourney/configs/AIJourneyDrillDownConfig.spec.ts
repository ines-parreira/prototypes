import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { defaultEnrichmentFields } from 'domains/reporting/hooks/useDrillDownData'
import { EnrichmentFields } from 'domains/reporting/models/types'

import { getEnrichmentFields } from './AIJourneyDrillDownConfig'

describe('AIJourneyDrillDownConfig', () => {
    describe('getEnrichmentFields', () => {
        it('should return default fields plus customer data for TotalOrders metric', () => {
            const result = getEnrichmentFields(AIJourneyMetric.TotalOrders)

            expect(result).toEqual([
                ...defaultEnrichmentFields,
                EnrichmentFields.CustomerName,
                EnrichmentFields.CustomerIntegrationDataByExternalId,
            ])
        })

        it('should return default fields plus customer name for ResponseRate metric', () => {
            const result = getEnrichmentFields(AIJourneyMetric.ResponseRate)

            expect(result).toEqual([
                ...defaultEnrichmentFields,
                EnrichmentFields.CustomerName,
            ])
        })

        it('should return default fields plus customer name for OptOutRate metric', () => {
            const result = getEnrichmentFields(AIJourneyMetric.OptOutRate)

            expect(result).toEqual([
                ...defaultEnrichmentFields,
                EnrichmentFields.CustomerName,
            ])
        })

        it('should return default fields plus customer name for ClickThroughRate metric', () => {
            const result = getEnrichmentFields(AIJourneyMetric.ClickThroughRate)

            expect(result).toEqual([
                ...defaultEnrichmentFields,
                EnrichmentFields.CustomerName,
            ])
        })

        it('should return default fields plus customer name for DiscountCodesGenerated metric', () => {
            const result = getEnrichmentFields(
                AIJourneyMetric.DiscountCodesGenerated,
            )

            expect(result).toEqual([
                ...defaultEnrichmentFields,
                EnrichmentFields.CustomerName,
            ])
        })

        it('should return default fields plus customer data for DiscountCodesUsed metric', () => {
            const result = getEnrichmentFields(
                AIJourneyMetric.DiscountCodesUsed,
            )

            expect(result).toEqual([
                ...defaultEnrichmentFields,
                EnrichmentFields.CustomerName,
                EnrichmentFields.CustomerIntegrationDataByExternalId,
            ])
        })

        it('should return only default fields for unknown metric', () => {
            const result = getEnrichmentFields('unknownMetric')

            expect(result).toEqual([...defaultEnrichmentFields])
        })
    })
})
