import {ProductRecommendationScenario} from 'pages/convert/campaigns/types/CampaignAttachment'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {getRecommendedTriggerForScenario} from '../geRecommendedTriggerForScenario'

describe('getRecommendedTriggerForScenario', () => {
    it('should return a trigger for SimilarBought scenario', () => {
        const scenario = ProductRecommendationScenario.SimilarBought
        const expected = {
            id: expect.any(String),
            type: CampaignTriggerType.OrdersCount,
            operator: CampaignTriggerOperator.Gt,
            value: 0,
        }

        const result = getRecommendedTriggerForScenario(scenario)

        expect(result).toEqual(expected)
    })

    it('should return a trigger for OutOfStockAlternatives scenario', () => {
        const scenario = ProductRecommendationScenario.OutOfStockAlternatives
        const expected = {
            id: expect.any(String),
            type: CampaignTriggerType.OutOfStockProductPages,
            operator: CampaignTriggerOperator.Eq,
            value: 'true',
        }

        const result = getRecommendedTriggerForScenario(scenario)

        expect(result).toEqual(expected)
    })

    it('should return undefined for other scenarios', () => {
        const scenario = ProductRecommendationScenario.SimilarSeen

        const result = getRecommendedTriggerForScenario(scenario)

        expect(result).toBeUndefined()
    })
})
