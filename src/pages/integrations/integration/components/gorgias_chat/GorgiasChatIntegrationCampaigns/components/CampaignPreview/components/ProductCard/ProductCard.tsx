import React, {useMemo} from 'react'
import {getLuminance, lighten, darken} from 'color2k'

import css from './ProductCard.less'

const COLOR_VARIANT = 0.1
const COLOR_LUMINANCE_THRESHOLD = 0.5
const DEFAULT_COLOR = '#0097ff'

function getBackgroundColorVariant(mainColor: string): string {
    if (getLuminance(mainColor) > COLOR_LUMINANCE_THRESHOLD) {
        return darken(mainColor, COLOR_VARIANT)
    }
    return lighten(mainColor, COLOR_VARIANT)
}

type Props = {
    color?: string
    currency: string
    image?: string
    price: number
    title: string
}

export const ProductCard = ({
    color = DEFAULT_COLOR,
    currency,
    image,
    price,
    title,
}: Props) => {
    const productStyle = useMemo(() => {
        return image
            ? {
                  backgroundImage: `url("${image}")`,
              }
            : {}
    }, [image])
    const buttonStyle = useMemo(
        () => ({
            backgroundColor: getBackgroundColorVariant(color),
        }),
        [color]
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

    return (
        <div className={css.wrapper}>
            <div className={css.featured} style={productStyle} />
            <div className={css.container}>
                <div className={css.content}>
                    <div className={css.details}>
                        <span className={css.title}>{title}</span>
                        {formattedAmount && (
                            <span className={css.cost}>{formattedAmount}</span>
                        )}
                    </div>
                    <button className={css.addToCart} style={buttonStyle}>
                        Add to cart
                    </button>
                </div>
            </div>
        </div>
    )
}
