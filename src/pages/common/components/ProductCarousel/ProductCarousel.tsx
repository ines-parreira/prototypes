import React, { useCallback, useEffect, useState } from 'react'

import classnames from 'classnames'

import { useIsHeadlessShopifyStore } from 'pages/convert/campaigns/hooks/useIsHeadlessShopifyStore'
import { CampaignProduct } from 'pages/convert/campaigns/types/CampaignProduct'

import { ProductCard } from '../ProductCard'
import { DEFAULT_CAROUSEL_CONFIGURATION } from './constants/visuals'

import css from './ProductCarousel.less'

type Props = {
    mainColor?: string
    products: CampaignProduct[]
    configuration?: {
        frameGutter: number
        frameWidth: number
        carouselMaxWidth: number
        carouselNavigationPadding: number
    }
    shouldHideRepositionImage: boolean
}

export const ProductCarousel = ({
    mainColor,
    products,
    configuration = DEFAULT_CAROUSEL_CONFIGURATION,
    shouldHideRepositionImage,
}: Props) => {
    const [currentElement, setCurrentElement] = useState<number>(0)
    const [translate, setTranslate] = useState(
        configuration.carouselNavigationPadding,
    )
    const isHeadlessStore = useIsHeadlessShopifyStore()

    useEffect(() => {
        setCurrentElement(0)
    }, [products])

    const calculateNextTranslate = useCallback(
        (element: number): number => {
            if (element === 0) {
                return configuration.carouselNavigationPadding
            }

            const nextTranslate =
                element * configuration.frameWidth -
                configuration.carouselNavigationPadding +
                element * configuration.frameGutter

            return nextTranslate * -1
        },
        [configuration],
    )

    const updateCurrentElement = (nextElement: number) => {
        if (nextElement >= products.length || nextElement < 0) return

        setCurrentElement(nextElement)
        setTranslate(calculateNextTranslate(nextElement))
    }

    const handleMoveNext = () => {
        updateCurrentElement(currentElement + 1)
    }

    const handleMovePrevious = () => {
        updateCurrentElement(currentElement - 1)
    }

    useEffect(() => {
        setTranslate(calculateNextTranslate(currentElement))
    }, [
        setTranslate,
        currentElement,
        products,
        calculateNextTranslate,
        configuration.carouselNavigationPadding,
    ])

    return (
        <div
            className={css.container}
            style={{ maxWidth: configuration.carouselMaxWidth }}
        >
            <div
                className={css.slides}
                style={{
                    transform: `translate3d(${translate}px, 0px, 0px)`,
                }}
            >
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className={classnames({
                            [css.frame]: true,
                            [css.highlighted]: currentElement === index,
                        })}
                    >
                        <ProductCard
                            isHighlighted={currentElement === index}
                            currency={product.currency}
                            imageSrc={product.featured_image}
                            color={mainColor}
                            price={product.price}
                            compareAtPrice={product.compareAtPrice}
                            position={product.position}
                            productId={product.id}
                            title={product.title}
                            hasOptions={!!product.variant_name}
                            isHeadlessStore={isHeadlessStore}
                            shouldHideRepositionImage={
                                shouldHideRepositionImage
                            }
                            onClick={product.onClick}
                        />
                    </div>
                ))}
            </div>
            <div>
                {currentElement > 0 && (
                    <div
                        className={classnames(
                            css.buttonBaseControl,
                            css.leftSide,
                        )}
                        onClick={handleMovePrevious}
                        data-testid="prev-button"
                    >
                        <i className="material-icons">chevron_left</i>
                    </div>
                )}
                {currentElement < products.length - 1 && (
                    <div
                        className={classnames(
                            css.buttonBaseControl,
                            css.rightSide,
                        )}
                        onClick={handleMoveNext}
                        data-testid="next-button"
                    >
                        <i className="material-icons">chevron_right</i>
                    </div>
                )}
            </div>
        </div>
    )
}
