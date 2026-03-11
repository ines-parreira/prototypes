import { useState } from 'react'

import { Box, Card, CardHeader, Text } from '@gorgias/axiom'

import { ProductSelect } from 'AIJourney/components/ProductSelect/ProductSelect'
import type { Product } from 'constants/integrations/types/shopify'

import css from './TestingProductCard.less'

type TestingProductCardProps = {
    onProductChange?: (product: Product) => void
}

export const TestingProductCard = ({
    onProductChange,
}: TestingProductCardProps) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
        undefined,
    )

    const handleSelect = (product: Product) => {
        setSelectedProduct(product)
        onProductChange?.(product)
    }

    return (
        <Card minWidth={680}>
            <Box flexDirection="column" gap="xxs">
                <CardHeader title="Testing product" />
                <Text className={css.caption}>
                    Select the product that will be used in testing messages.
                </Text>
                <ProductSelect
                    selectedProduct={selectedProduct}
                    setSelectedProduct={handleSelect}
                />
            </Box>
        </Card>
    )
}
