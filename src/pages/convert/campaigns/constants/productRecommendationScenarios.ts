import {ProductRecommendationScenario} from 'pages/convert/campaigns/types/CampaignAttachment'

export const SCENARIO_CONFIG = {
    [ProductRecommendationScenario.SimilarSeen]: {
        title: 'Similar Products You Have Seen',
        description: 'Recommends based on visitors’ product pages browsed',
        requiresModal: false,
    },
    [ProductRecommendationScenario.SimilarBought]: {
        title: 'Similar Products You Have Bought',
        description: 'Recommends based on customers’ last purchases',
        requiresModal: true,
    },
    [ProductRecommendationScenario.OutOfStockAlternatives]: {
        title: 'Alternatives for Out of Stock Products',
        description: 'Recommends alternatives for out of stock products',
        requiresModal: true,
    },
    [ProductRecommendationScenario.Newest]: {
        title: 'Newest Products',
        description: 'Recommends last products activated on Shopify store',
        requiresModal: false,
    },
}
