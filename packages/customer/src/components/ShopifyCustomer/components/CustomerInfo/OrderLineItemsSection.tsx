import type {
    OrderCardProduct,
    OrderLineItem,
} from '@repo/ecommerce/shopify/types'
import { getLineItemImageSrc } from '@repo/ecommerce/shopify/utils'

import { Box, Tag, Text } from '@gorgias/axiom'

import css from './OrderSidePanelPreview.less'

type Props = {
    lineItems: OrderLineItem[]
    productsMap?: Map<number, OrderCardProduct>
    moneySymbol: string
    subtotalPrice?: string
    totalShippingPrice?: string
    totalTax?: string
    totalPrice?: string
}

export function OrderLineItemsSection({
    lineItems,
    productsMap,
    moneySymbol,
    subtotalPrice,
    totalShippingPrice,
    totalTax,
    totalPrice,
}: Props) {
    if (lineItems.length === 0) return null

    return (
        <Box mt="sm" className={css.section} display="block" padding="sm">
            <Box pb="md" flexDirection="row" alignItems="center" gap="xs">
                <Text size="md" variant="bold">
                    Line items
                </Text>
                <Tag color="grey" className={css.lineItemsCount}>
                    {lineItems.length}
                </Tag>
            </Box>
            <Box flexDirection="column">
                {lineItems.map((lineItem, index) => {
                    const product =
                        lineItem.product_id && productsMap
                            ? productsMap.get(lineItem.product_id)
                            : undefined
                    return (
                        <Box
                            key={lineItem.id ?? index}
                            flexDirection="row"
                            alignItems="flex-start"
                            gap="xs"
                            pb="md"
                        >
                            <img
                                src={getLineItemImageSrc(lineItem, product)}
                                alt={lineItem.title}
                                className={css.lineItemImage}
                            />
                            <Box flex={1} flexDirection="column">
                                <Text size="md">{lineItem.title}</Text>
                                {lineItem.sku && (
                                    <Text size="md" className={css.label}>
                                        SKU: {lineItem.sku}
                                    </Text>
                                )}
                            </Box>

                            <Box>
                                <Text size="md" className={css.label}>
                                    Qty: {lineItem.quantity}
                                </Text>
                            </Box>
                            <Box flexDirection="column" alignItems="flex-end">
                                <Text size="md">
                                    {moneySymbol}
                                    {lineItem.price}
                                </Text>
                            </Box>
                        </Box>
                    )
                })}
                <Box className={css.totals} flexDirection="column">
                    <Box flexDirection="column" gap="xs" pt="md" pb="md">
                        {subtotalPrice && (
                            <Box
                                flexDirection="row"
                                justifyContent="space-between"
                            >
                                <Text size="md" className={css.label}>
                                    Subtotal
                                </Text>
                                <Text size="md">
                                    {moneySymbol}
                                    {subtotalPrice}
                                </Text>
                            </Box>
                        )}
                        {totalShippingPrice && (
                            <Box
                                flexDirection="row"
                                justifyContent="space-between"
                            >
                                <Text size="md" className={css.label}>
                                    Shipping
                                </Text>
                                <Text size="md">
                                    {moneySymbol}
                                    {totalShippingPrice}
                                </Text>
                            </Box>
                        )}
                        {totalTax && (
                            <Box
                                flexDirection="row"
                                justifyContent="space-between"
                            >
                                <Text size="md" className={css.label}>
                                    Tax
                                </Text>
                                <Text size="md">
                                    {moneySymbol}
                                    {totalTax}
                                </Text>
                            </Box>
                        )}
                    </Box>
                    {totalPrice && (
                        <Box
                            flexDirection="row"
                            justifyContent="space-between"
                            className={css.totalRow}
                        >
                            <Text size="sm" variant="bold">
                                Total
                            </Text>
                            <Text size="sm" variant="bold">
                                {moneySymbol}
                                {totalPrice}
                            </Text>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    )
}
