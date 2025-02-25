import React, { useMemo } from 'react'

import cn from 'classnames'

import GorgiasButton from 'gorgias-design-system/Buttons/Button'
import { getContrastColor } from 'gorgias-design-system/utils'
import Button from 'pages/common/components/button/Button'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import { useIsProductCardDiscountedPriceEnabled } from 'pages/convert/common/hooks/useIsProductCardDiscountedPriceEnabled'

import { AttachmentPosition } from '../../../../types/CampaignAttachment'
import { BaseProductCard } from '../BaseProductCard'
import { FeaturedImage, ImagePosition } from '../ImagePosition'

import css from './ProductCardView.less'

type Props = {
    isHighlighted: boolean
    bgColor: string
    currency?: string
    image?: FeaturedImage
    price: number
    compareAtPrice?: number
    title: string
    hasOptions?: boolean
    isHeadlessStore?: boolean
    position?: AttachmentPosition
    shouldHideRepositionImage: boolean
    onClickEdit: () => void
}

export const ProductCardView = ({
    isHighlighted,
    bgColor,
    currency = 'USD',
    image,
    price,
    compareAtPrice,
    title,
    hasOptions = false,
    isHeadlessStore = false,
    position,
    shouldHideRepositionImage,
    onClickEdit,
}: Props) => {
    const isConvertSubscriber = useIsConvertSubscriber()
    const buttonStyle = useMemo(
        () => ({
            backgroundColor: bgColor,
            color: getContrastColor(bgColor),
        }),
        [bgColor],
    )

    const { formattedPrice, formattedCompareAtPrice } = useMemo(() => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            currencyDisplay: 'symbol',
            maximumFractionDigits: 2,
        })
        return {
            formattedPrice: price > 0 ? formatter.format(price) : '',
            formattedCompareAtPrice:
                compareAtPrice && compareAtPrice > 0
                    ? formatter.format(compareAtPrice)
                    : '',
        }
    }, [currency, price, compareAtPrice])

    const buttonText = useMemo(() => {
        if (isHeadlessStore || !isConvertSubscriber) {
            return 'Show details'
        } else if (hasOptions) {
            return 'Select Options'
        }
        return 'Add to cart'
    }, [isHeadlessStore, isConvertSubscriber, hasOptions])

    const renderFeaturedImage = (shouldRenderImageRepositionBtn: boolean) => {
        return (
            <>
                {shouldRenderImageRepositionBtn && (
                    <div className={css.repositionWrapper}>
                        {isConvertSubscriber && (
                            <Button
                                intent="secondary"
                                size="small"
                                onClick={onClickEdit}
                            >
                                Reposition image
                            </Button>
                        )}
                    </div>
                )}
                {image && (
                    <ImagePosition
                        readonly
                        x={position?.x ?? 0}
                        y={position?.y ?? 0}
                        size={position?.size ?? 0}
                        image={image}
                    />
                )}
            </>
        )
    }

    const isDiscountedPriceEnabled = useIsProductCardDiscountedPriceEnabled()

    return (
        <BaseProductCard
            renderFeaturedImage={() =>
                renderFeaturedImage(isHighlighted && !shouldHideRepositionImage)
            }
        >
            <div className={css.details}>
                <span className={css.title}>{title}</span>
                <div className={css.productPrice}>
                    {formattedPrice && (
                        <span className={css.cost}>{formattedPrice}</span>
                    )}
                    {isDiscountedPriceEnabled && formattedCompareAtPrice && (
                        <span className={cn(css.cost, css.compareAtPrice)}>
                            {formattedCompareAtPrice}
                        </span>
                    )}
                </div>
            </div>
            <GorgiasButton
                isStretched
                variant="primary"
                size="small"
                style={buttonStyle}
            >
                {buttonText}
            </GorgiasButton>
        </BaseProductCard>
    )
}
