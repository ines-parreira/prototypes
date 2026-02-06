import pluralize from 'pluralize'

import { Box, CardContent, Text, TextVariant } from '@gorgias/axiom'

import type { OrderCardLineItem, OrderCardProduct } from '../../types'
import { getLineItemImageSrc } from '../../utils'

import css from './OrderCard.less'

type OrderCardProductsProps = {
    lineItems: OrderCardLineItem[]
    productsMap?: Map<number, OrderCardProduct>
    moneySymbol: string
    totalPrice: string
}

export function OrderCardProducts({
    lineItems,
    productsMap,
    moneySymbol,
    totalPrice,
}: OrderCardProductsProps) {
    const displayedLineItems = lineItems.slice(0, 3)
    const hasMoreItems = lineItems.length > 3
    const fourthLineItem = hasMoreItems ? lineItems[3] : null
    const fourthProduct =
        fourthLineItem?.product_id && productsMap
            ? productsMap.get(fourthLineItem.product_id)
            : undefined

    return (
        <CardContent>
            <Box
                flexDirection="row"
                alignItems="center"
                gap="xs"
                paddingBottom="xxxxs"
                paddingTop="xxxxs"
            >
                {displayedLineItems.length > 0 && (
                    <Box gap="xxxxs">
                        {displayedLineItems.map((lineItem, index) => {
                            const product =
                                lineItem.product_id && productsMap
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
                                    +{lineItems.length - 3}
                                </Text>
                            </div>
                        )}
                    </Box>
                )}
                <Box>
                    <Text
                        size="sm"
                        variant="regular"
                    >{`${lineItems.length} ${pluralize('item', lineItems.length)}`}</Text>
                </Box>

                <Box>
                    <Text size="sm" variant="regular">
                        {moneySymbol}
                        {totalPrice}
                    </Text>
                </Box>
            </Box>
        </CardContent>
    )
}
