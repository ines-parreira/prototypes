import classnames from 'classnames'

import type { IntegrationType } from 'models/integration/constants'
import { ProductStockQuantity } from 'pages/common/components/StockQuantity'
import { getImageSrc } from 'utils/shopify'

import css from './Result.less'

export type Props = {
    image: { src?: string; alt?: string; type?: IntegrationType } | null
    title: string
    subtitle: string | null
    stock: {
        isAvailable?: boolean
        tracked: boolean
        quantity: number | null
        totalVariants?: number
    }
    disabled?: boolean
    disabledReason?: string
    ignoreStockAvailability?: boolean
}

export default function Result({
    image,
    title,
    subtitle,
    stock,
    disabled,
    ignoreStockAvailability,
}: Props) {
    const imageSrc = getImageSrc(image)
    const imageAlt = !!image ? image.alt : 'Product'

    return (
        <div
            className={classnames(css.container, {
                [css.isOutOfStock]:
                    !ignoreStockAvailability && stock.isAvailable === false,
            })}
        >
            <div className={css.imgContainer}>
                <img className={css.img} src={imageSrc} alt={imageAlt} />
            </div>
            <div className={css.legend}>
                <div className={css.title}>{title}</div>
                {subtitle && <div className={css.subtitle}>{subtitle}</div>}
            </div>
            {stock.tracked ? (
                <div
                    className={classnames(css.stock, {
                        [css.disabled]: disabled,
                    })}
                >
                    <ProductStockQuantity
                        value={stock.quantity!}
                        disabled={disabled}
                    />{' '}
                    in stock{' '}
                    {stock.totalVariants && stock.totalVariants > 1
                        ? `for ${stock.totalVariants} variants`
                        : null}
                </div>
            ) : (
                <div className={classnames(css.stock, css.grey)}>
                    Inventory not tracked
                </div>
            )}
        </div>
    )
}
