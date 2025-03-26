import cn from 'classnames'

import { ShopifyIntegration } from 'models/integration/types'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/Onboarding/components/Card'

import useTopProducts from './hooks'
import TopProductItem, { TopProductItemSkeleton } from './TopProductItem'

import css from './TopProductsCard.less'

type Props = {
    className?: string
    title: string
    integration: ShopifyIntegration
}

const TopProductsCard = ({ className, title, integration }: Props) => {
    const { data: products, isLoading } = useTopProducts({
        shopIntegrationId: integration?.id,
        currency: integration?.meta?.currency,
    })

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
