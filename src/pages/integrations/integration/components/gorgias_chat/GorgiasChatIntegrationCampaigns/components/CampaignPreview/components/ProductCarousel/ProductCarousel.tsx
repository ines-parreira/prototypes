import React, {useCallback, useEffect, useState} from 'react'
import classnames from 'classnames'

import {DEFAULT_CAROUSEL_CONFIGURATION} from '../../../../constants/visuals'

import {useIsHeadlessShopifyStore} from '../../../../hooks/useIsHeadlessShopifyStore'

import {CampaignProduct} from '../../../../types/CampaignProduct'

import {ProductCard} from '../ProductCard'

import css from './ProductCarousel.less'

type Props = {
    products: CampaignProduct[]
    configuration?: {
        frameGutter: number
        frameWidth: number
        carouselMaxWidth: number
        carouselNavigationPadding: number
    }
}

export const ProductCarousel = ({
    products,
    configuration = DEFAULT_CAROUSEL_CONFIGURATION,
}: Props) => {
    const [currentElement, setCurrentElement] = useState<number>(0)
    const [translate, setTranslate] = useState(
        configuration.carouselNavigationPadding
    )
    const isHeadlessStore = useIsHeadlessShopifyStore()

    const calculateNextTranslate = useCallback(
        (element: number, products: CampaignProduct[]): number => {
            if (element === 0) {
                return configuration.carouselNavigationPadding
            }

            let nextTranslate =
                element * configuration.frameWidth -
                configuration.carouselNavigationPadding

            if (element === products.length - 1 || element === 0) {
                nextTranslate += configuration.frameGutter / 2
            }

            return nextTranslate * -1
        },
        [configuration]
    )

    const updateCurrentElement = (nextElement: number) => {
        if (nextElement >= products.length || nextElement < 0) return

        setCurrentElement(nextElement)
        setTranslate(calculateNextTranslate(nextElement, products))
    }

    const handleMoveNext = () => {
        updateCurrentElement(currentElement + 1)
    }

    const handleMovePrevious = () => {
        updateCurrentElement(currentElement - 1)
    }

    useEffect(() => {
        setTranslate(calculateNextTranslate(currentElement, products))
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
            style={{maxWidth: configuration.carouselMaxWidth}}
        >
            <div className={css.track}>
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
                            style={{
                                width: configuration.frameWidth,
                            }}
                        >
                            <ProductCard
                                currency={product.currency}
                                image={product.featured_image}
                                price={product.price}
                                title={product.title}
                                isHeadlessStore={isHeadlessStore}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div>
                {currentElement > 0 && (
                    <div
                        className={classnames(
                            css.buttonBaseControl,
                            css.leftSide
                        )}
                        onClick={handleMovePrevious}
                    >
                        <i className="material-icons">chevron_left</i>
                    </div>
                )}
                {currentElement < products.length - 1 && (
                    <div
                        className={classnames(
                            css.buttonBaseControl,
                            css.rightSide
                        )}
                    >
                        <i className="material-icons" onClick={handleMoveNext}>
                            chevron_right
                        </i>
                    </div>
                )}
            </div>
        </div>
    )
}
