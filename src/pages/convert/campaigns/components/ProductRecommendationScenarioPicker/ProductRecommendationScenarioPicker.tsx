import React from 'react'
import {ListGroup, ListGroupItem} from 'reactstrap'
import {ulid} from 'ulidx'
import {IntegrationDataItem} from 'models/integration/types'
import {Product} from 'constants/integrations/types/shopify'
import {AttachmentEnum} from 'common/types'
import {
    ProductRecommendationAttachment,
    ProductRecommendationScenario,
} from 'pages/convert/campaigns/types/CampaignAttachment'

import css from './ProductRecommendationScenarioPicker.less'

const SCENARIO_CONFIG = {
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

type Props = {
    products: IntegrationDataItem<Product>[]
    onClick: (attachment: ProductRecommendationAttachment) => void
}

const ProductRecommendationScenarioPicker = ({onClick}: Props) => {
    const handleScenarioClick = (scenario: ProductRecommendationScenario) => {
        const productRecommendationAttachment = {
            content_type: AttachmentEnum.ProductRecommendation,
            name: SCENARIO_CONFIG[scenario].title,
            extra: {
                id: ulid(),
                scenario,
                description: SCENARIO_CONFIG[scenario].description,
            },
        } as ProductRecommendationAttachment

        onClick(productRecommendationAttachment)
    }

    return (
        <ListGroup flush>
            {Object.values(ProductRecommendationScenario).map((scenario) => (
                <ListGroupItem
                    key={scenario}
                    tag="button"
                    action
                    onClick={(event) => {
                        event.preventDefault()
                        handleScenarioClick(scenario)
                    }}
                >
                    <div className={css.scenarioTitle}>
                        {SCENARIO_CONFIG[scenario].title}
                    </div>
                    <div className={css.scenarioDescription}>
                        {SCENARIO_CONFIG[scenario].description}
                    </div>
                </ListGroupItem>
            ))}
        </ListGroup>
    )
}

export default ProductRecommendationScenarioPicker
