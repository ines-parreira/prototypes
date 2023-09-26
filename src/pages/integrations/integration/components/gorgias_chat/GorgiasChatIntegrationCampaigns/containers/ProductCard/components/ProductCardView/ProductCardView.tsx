import React, {useMemo} from 'react'

import Button from 'pages/common/components/button/Button'

import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import {getContrastColor} from 'gorgias-design-system/utils'
import {AttachmentPosition} from '../../../../types/CampaignAttachment'

import {BaseProductCard} from '../BaseProductCard'
import {ImagePosition} from '../ImagePosition'

import css from './ProductCardView.less'

type Props = {
    bgColor: string
    currency?: string
    image?: string
    price: number
    title: string
    isHeadlessStore?: boolean
    position?: AttachmentPosition
    onClickEdit: () => void
}

export const ProductCardView = ({
    bgColor,
    currency = 'USD',
    image,
    price,
    title,
    isHeadlessStore = false,
    position,
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

    const renderFeaturedImage = () => {
        return (
            <>
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
        <BaseProductCard renderFeaturedImage={renderFeaturedImage}>
            <div className={css.details}>
                <span className={css.title}>{title}</span>
                {formattedAmount && (
                    <span className={css.cost}>{formattedAmount}</span>
                )}
            </div>
            <button className={css.addToCart} style={buttonStyle}>
                {isHeadlessStore ? 'Show details' : 'Add to cart'}
            </button>
        </BaseProductCard>
    )
}
