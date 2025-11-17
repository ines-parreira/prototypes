import { ulid } from 'ulidx'

import { ProductRecommendationScenario } from 'pages/convert/campaigns/types/CampaignAttachment'
import type { CampaignTrigger } from 'pages/convert/campaigns/types/CampaignTrigger'
import { CampaignTriggerOperator } from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'

export const getRecommendedTriggerForScenario = (
    scenario: ProductRecommendationScenario,
): CampaignTrigger | undefined => {
    switch (scenario) {
        case ProductRecommendationScenario.SimilarBought:
            return {
                id: ulid(),
                type: CampaignTriggerType.OrdersCount,
                operator: CampaignTriggerOperator.Gt,
                value: 0,
            }
        case ProductRecommendationScenario.OutOfStockAlternatives:
            return {
                id: ulid(),
                type: CampaignTriggerType.OutOfStockProductPages,
                operator: CampaignTriggerOperator.Eq,
                value: 'true',
            }
    }
}
