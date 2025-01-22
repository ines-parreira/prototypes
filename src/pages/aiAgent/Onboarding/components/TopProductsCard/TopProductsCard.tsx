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
    title: string
    products: Product[]
}

const TopProductsCard = ({title, products}: Props) => {
    return (
        <Card className={css.topProductsContainer}>
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
