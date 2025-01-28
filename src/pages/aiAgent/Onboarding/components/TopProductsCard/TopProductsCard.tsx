import cn from 'classnames'
import React from 'react'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/Onboarding/components/Card'

import TopProductItem from './TopProductItem'
import css from './TopProductsCard.less'
import {Product} from './types'

type Props = {
    className?: string
    title: string
    products: Product[]
}

const TopProductsCard = ({className, title, products}: Props) => {
    return (
        <Card className={cn(css.topProductsContainer, className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className={css.content}>
                {products.map((product: Product) => (
                    <TopProductItem product={product} key={product.id} />
                ))}
            </CardContent>
        </Card>
    )
}

export default TopProductsCard
