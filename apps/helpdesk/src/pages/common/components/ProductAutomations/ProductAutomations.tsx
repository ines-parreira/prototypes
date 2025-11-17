import React, { useState } from 'react'

import { ListGroup, ListGroupItem } from 'reactstrap'

import { LegacyBadge as Badge, LegacyButton as Button } from '@gorgias/axiom'

import css from 'pages/common/components/ProductAutomations/ProductAutomations.less'
import ProductRecommendationScenarioPicker from 'pages/convert/campaigns/components/ProductRecommendationScenarioPicker/ProductRecommendationScenarioPicker'
import type { ProductRecommendationAttachment } from 'pages/convert/campaigns/types/CampaignAttachment'

type Props = {
    productAutomationClicked: (
        attachment: ProductRecommendationAttachment,
    ) => void
    onClick: () => void
    onBackClicked: () => void
}

const ProductAutomations = ({
    productAutomationClicked,
    onClick,
    onBackClicked,
}: Props) => {
    const title = 'Product Recommendation'
    const [isProductRecommendationClicked, setIsProductRecommendationClicked] =
        useState(false)

    const handleOnBackClick = () => {
        setIsProductRecommendationClicked(false)
        onBackClicked()
    }

    const AiBadgeElement = (
        <Badge type={'magenta'} className={css.badge}>
            <i className="material-icons">auto_awesome</i>ai powered
        </Badge>
    )

    return (
        <>
            {!isProductRecommendationClicked && (
                <ListGroup flush>
                    <div className={css.header}>Automations</div>
                    <ListGroupItem
                        key="product-recommendation"
                        tag="button"
                        action
                        className={css.automationBody}
                        onClick={(event) => {
                            event.preventDefault()
                            onClick()
                            setIsProductRecommendationClicked(true)
                        }}
                    >
                        <div>
                            <span className={css.automationTitle}>{title}</span>
                            {AiBadgeElement}
                        </div>
                        <div className={css.automationDescription}>
                            Automatically recommends products based on visitors’
                            behavior
                        </div>
                    </ListGroupItem>
                </ListGroup>
            )}
            {isProductRecommendationClicked && (
                <div className={css.productRecommendationWrapper}>
                    <div className={css.backContainer}>
                        <Button
                            className="mr-2"
                            intent="secondary"
                            fillStyle="fill"
                            onClick={handleOnBackClick}
                            size="small"
                            tabIndex={-1}
                            leadingIcon="arrow_back"
                        >
                            Back
                        </Button>
                        <div className={css.backHeader}>{title}</div>
                        {AiBadgeElement}
                    </div>
                    <ProductRecommendationScenarioPicker
                        onClick={productAutomationClicked}
                    />
                </div>
            )}
        </>
    )
}

export default ProductAutomations
