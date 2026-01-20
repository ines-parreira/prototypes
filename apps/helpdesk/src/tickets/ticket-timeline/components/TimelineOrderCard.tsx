import {
    TicketTimelineHeader as TicketHeader,
    TimelineCard,
} from '@repo/tickets'

import { Box, Color, Tag, Text, TextVariant } from '@gorgias/axiom'
import type { Color as ColorType } from '@gorgias/axiom'

import defaultImage from 'assets/img/presentationals/shopify-product-default-image.png'
import type {
    FinancialStatus,
    FulfillmentStatus,
    Order,
    OrderLineItem,
    Product,
} from 'constants/integrations/types/shopify'
import { getMoneySymbol } from 'utils/getMoneySymbol'
import { getSizedImageUrl } from 'utils/shopify'

import css from './TimelineOrderCard.less'

type Props = {
    order: Order
    displayedDate: string
    productsMap: Map<number, Product>
}

function getFinancialStatusInfo(status: FinancialStatus): {
    label: string
    color: Extract<ColorType, 'grey' | 'green' | 'orange' | 'red'>
} {
    switch (status) {
        case 'paid':
            return { label: 'Paid', color: Color.Green }
        case 'pending':
            return { label: 'Pending', color: Color.Orange }
        case 'partially_paid':
            return { label: 'Partially paid', color: Color.Orange }
        case 'refunded':
            return { label: 'Refunded', color: Color.Grey }
        case 'voided':
            return { label: 'Voided', color: Color.Grey }
        case 'partially_refunded':
            return { label: 'Partially refunded', color: Color.Orange }
        default:
            return { label: 'Unknown', color: Color.Red }
    }
}

function getFulfillmentStatusInfo(status: FulfillmentStatus | null): {
    label: string
    color: Extract<ColorType, 'grey' | 'green' | 'orange'>
} {
    if (!status) {
        return { label: 'Unfulfilled', color: Color.Grey }
    }

    switch (status) {
        case 'fulfilled':
            return { label: 'Fulfilled', color: Color.Green }
        case 'partial':
            return { label: 'Partially fulfilled', color: Color.Orange }
        case 'restocked':
            return { label: 'Restocked', color: Color.Grey }
        default:
            return { label: 'Unknown', color: Color.Grey }
    }
}

/**
 * Get the image source for a line item.
 * Tries to find a variant-specific image first, then falls back to the main product image.
 */
function getLineItemImageSrc(
    lineItem: OrderLineItem,
    product: Product | undefined,
): string {
    if (!product) {
        return defaultImage as string
    }

    const variantId = lineItem.variant_id

    // Try to find variant-specific image
    if (variantId && product.images) {
        const variantImage = product.images.find((image) =>
            image.variant_ids.includes(variantId),
        )

        if (variantImage?.src) {
            const sizedUrl = getSizedImageUrl(variantImage.src, 'small')
            return sizedUrl || variantImage.src
        }
    }

    // Fall back to main product image
    if (product.image?.src) {
        const sizedUrl = getSizedImageUrl(product.image.src, 'small')
        return sizedUrl || product.image.src
    }

    // Final fallback to placeholder
    return defaultImage as string
}

export function TimelineOrderCard({
    order,
    displayedDate,
    productsMap,
}: Props) {
    const moneySymbol = getMoneySymbol(order.currency, true)

    // Get up to 3 line items to display
    const displayedLineItems = order.line_items.slice(0, 3)
    const hasMoreItems = order.line_items.length > 3
    const fourthLineItem = hasMoreItems ? order.line_items[3] : null
    const fourthProduct = fourthLineItem?.product_id
        ? productsMap.get(fourthLineItem.product_id)
        : undefined

    const { label: financialLabel, color: financialColor } =
        getFinancialStatusInfo(order.financial_status)

    const { label: fulfillmentLabel, color: fulfillmentColor } =
        getFulfillmentStatusInfo(order.fulfillment_status)

    return (
        <TimelineCard>
            <Box flexDirection="column" gap="xs">
                <TicketHeader
                    subject={order.name}
                    time={displayedDate}
                    iconName="vendor-shopify-colored"
                />
                <Box flexDirection="row" alignItems="center" gap="xs">
                    {/* Product Images */}
                    {displayedLineItems.length > 0 && (
                        <Box gap="xxxxs">
                            {displayedLineItems.map((lineItem, index) => {
                                const product = lineItem.product_id
                                    ? productsMap.get(lineItem.product_id)
                                    : undefined

                                return (
                                    <div
                                        key={index}
                                        className={css.productImageWrapper}
                                    >
                                        <img
                                            src={getLineItemImageSrc(
                                                lineItem,
                                                product,
                                            )}
                                            alt={lineItem.title}
                                            className={css.productImage}
                                        />
                                    </div>
                                )
                            })}
                            {hasMoreItems && fourthLineItem && (
                                <div className={css.productImageWrapper}>
                                    <img
                                        src={getLineItemImageSrc(
                                            fourthLineItem,
                                            fourthProduct,
                                        )}
                                        alt={fourthLineItem.title}
                                        className={css.productImage}
                                    />
                                    <Text
                                        className={css.moreItemsIndicator}
                                        variant={TextVariant.Medium}
                                        size="md"
                                    >
                                        +{order.line_items.length - 3}
                                    </Text>
                                </div>
                            )}
                        </Box>
                    )}
                    <Box>
                        <Text
                            size="sm"
                            variant="regular"
                        >{`${order.line_items.length} items`}</Text>
                    </Box>

                    <Box>
                        <Text size="sm" variant="regular">
                            {moneySymbol}
                            {order.total_price}
                        </Text>
                    </Box>
                </Box>
                <Box flexDirection="row" gap="xs">
                    <Tag color={financialColor}>{financialLabel}</Tag>
                    <Tag color={fulfillmentColor}>{fulfillmentLabel}</Tag>
                </Box>
            </Box>
        </TimelineCard>
    )
}
