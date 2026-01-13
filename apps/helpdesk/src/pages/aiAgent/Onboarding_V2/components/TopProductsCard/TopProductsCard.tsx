import cn from 'classnames'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/Onboarding_V2/components/Card'
import type { Product } from 'pages/aiAgent/Onboarding_V2/components/TopProductsCard/types'

import TopProductItem, { TopProductItemSkeleton } from './TopProductItem'

import css from './TopProductsCard.less'

type Props = {
    className?: string
    title: string
    isLoading: boolean
    products: Product[]
}

const TopProductsCard = ({ className, title, isLoading, products }: Props) => {
    return (
        <Card className={cn(css.topProductsContainer, className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className={css.content}>
                {!isLoading &&
                    products.map((product) => (
                        <TopProductItem product={product} key={product.id} />
                    ))}
                {isLoading && (
                    <>
                        <TopProductItemSkeleton />
                        <TopProductItemSkeleton />
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default TopProductsCard
