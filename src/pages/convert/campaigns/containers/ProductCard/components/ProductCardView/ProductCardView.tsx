import React, {useMemo} from 'react'

import Button from 'pages/common/components/button/Button'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import {getContrastColor} from 'gorgias-design-system/utils'
import GorgiasButton from 'gorgias-design-system/Buttons/Button'
import {AttachmentPosition} from '../../../../types/CampaignAttachment'

import {BaseProductCard} from '../BaseProductCard'
import {FeaturedImage, ImagePosition} from '../ImagePosition'

import css from './ProductCardView.less'

type Props = {
    isHighlighted: boolean
    bgColor: string
    currency?: string
    image?: FeaturedImage
    price: number
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
        [bgColor]
    )

    const formattedAmount = useMemo(() => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            currencyDisplay: 'symbol',
            maximumFractionDigits: 2,
        })
        return price > 0 ? formatter.format(price) : ''
    }, [currency, price])

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

    return (
        <BaseProductCard
            renderFeaturedImage={() =>
                renderFeaturedImage(isHighlighted && !shouldHideRepositionImage)
            }
        >
            <div className={css.details}>
                <span className={css.title}>{title}</span>
                {formattedAmount && (
                    <span className={css.cost}>{formattedAmount}</span>
                )}
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
