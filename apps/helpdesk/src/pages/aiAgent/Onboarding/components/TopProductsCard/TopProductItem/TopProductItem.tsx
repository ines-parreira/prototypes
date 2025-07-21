import { useMemo } from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { formatCurrency } from 'domains/reporting/pages/common/utils'
import { Product } from 'pages/aiAgent/Onboarding/components/TopProductsCard/types'

import css from './TopProductItem.less'

type Props = {
    product: Product
}

const TopProductItem = ({ product }: Props) => {
    const formattedPrice = useMemo(() => {
        return formatCurrency(product.price ?? 0, product.currency ?? 'USD')
    }, [product.currency, product.price])

    return (
        <div className={css.itemContainer}>
            <div className={css.infoContainer}>
                <img src={product.featuredImage} alt={product.title} />
                <div>
                    <div className={css.title}>{product.title}</div>
                    <div className={css.subtitle}>{product.description}</div>
                </div>
            </div>
            <div className={css.subtitle}>{formattedPrice}</div>
        </div>
    )
}

const TopProductItemSkeleton = () => {
    return (
        <div className={css.itemContainer}>
            <div className={css.infoContainer}>
                <div className={css.marginRight}>
                    <Skeleton width={80} height={80} />
                </div>
                <div>
                    <div className={css.title}>
                        <Skeleton width={180} height={15} />
                    </div>
                    <div className={css.subtitle}>
                        <Skeleton width={140} height={15} />
                    </div>
                </div>
            </div>
            <div className={css.subtitle}>
                <Skeleton width={25} height={15} />
            </div>
        </div>
    )
}

export default TopProductItem
export { TopProductItemSkeleton }
