import {
    Box,
    Card,
    CardHeader,
    Heading,
    Icon,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { ProductSelect } from 'AIJourney/components/ProductSelect/ProductSelect'
import type { Product } from 'constants/integrations/types/shopify'

import css from './TestingProductCard.less'

type TestingProductCardProps = {
    selectedProduct?: Product
    onProductChange?: (product: Product) => void
    isV3Architecture?: boolean
}

export const TestingProductCard = ({
    selectedProduct,
    onProductChange,
    isV3Architecture,
}: TestingProductCardProps) => {
    if (isV3Architecture) {
        return (
            <Box flexDirection="column" gap="xs">
                <Box flexDirection="row" alignItems="center" gap="xxs">
                    <Heading size="sm">Testing product</Heading>
                    <span>
                        <Tooltip
                            delay={0}
                            trigger={
                                <Icon
                                    name="info"
                                    alt="Testing product information"
                                />
                            }
                        >
                            <TooltipContent title="Select a product to be used in testing messages." />
                        </Tooltip>
                    </span>
                </Box>
                <ProductSelect
                    selectedProduct={selectedProduct}
                    setSelectedProduct={(product: Product) =>
                        onProductChange?.(product)
                    }
                />
            </Box>
        )
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
                    setSelectedProduct={(product: Product) =>
                        onProductChange?.(product)
                    }
                />
            </Box>
        </Card>
    )
}
