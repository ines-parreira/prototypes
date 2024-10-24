import React from 'react'

import {
    ProductItemRefundData,
    GiftWrappingItemRefundData,
} from 'models/integration/types'
import {
    calculateGiftWrappingPrice,
    calculateProductPrice,
    formatPrice,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/RefundOrderModal/utils'

import {GiftWrappingComponent} from './GiftWrappingComponent'
import bigcommerceTableCss from './OrderTable.less'
import {PriceComponent} from './PriceComponent'
import {ProductComponent} from './ProductComponent'
import {QuantityComponent} from './QuantityComponent'
import {TotalPriceComponent} from './TotalPriceComponent'

type Props = {
    productImage: Maybe<string>
    productData: ProductItemRefundData
    giftWrappingData: Maybe<GiftWrappingItemRefundData>
    storeHash: string
    currencyCode: Maybe<string>
}

export function OrderLineItemRow({
    productImage,
    productData,
    giftWrappingData,
    storeHash,
    currencyCode,
}: Props) {
    const product = productData.product_data

    const productInitialQuantity = productData.initial_quantity
    const productAvailableQuantity = productData.available_quantity
    const productRefundedQuantity = productData.refunded_quantity
    const productPrice = calculateProductPrice(product)
    const productIsDisabled = productAvailableQuantity <= 0 || productPrice <= 0

    const giftWrappingInitialQuantity = giftWrappingData?.initial_quantity
    const giftWrappingAvailableQuantity = giftWrappingData?.available_quantity
    const giftWrappingRefundedQuantity = giftWrappingData?.refunded_quantity
    const giftWrappingPrice = calculateGiftWrappingPrice(product)
    const giftWrappingIsDisabled = giftWrappingAvailableQuantity
        ? giftWrappingAvailableQuantity <= 0 || giftWrappingPrice <= 0
        : true

    return (
        <>
            <tr>
                <ProductComponent
                    product={product}
                    productImage={productImage}
                    storeHash={storeHash}
                    isDisabled={productIsDisabled}
                />
                <PriceComponent
                    fullPrice={formatPrice(product.base_price)}
                    discountedPrice={formatPrice(productPrice)}
                    isDisabled={productIsDisabled}
                    currencyCode={currencyCode}
                />
                <QuantityComponent
                    initialQuantity={productInitialQuantity}
                    availableQuantity={productAvailableQuantity}
                    refundedQuantity={productRefundedQuantity}
                    isDisabled={productIsDisabled}
                />
                <TotalPriceComponent
                    price={String(productPrice * productAvailableQuantity)}
                    isDisabled={productIsDisabled}
                    currencyCode={currencyCode}
                />
            </tr>
            {giftWrappingData &&
                giftWrappingInitialQuantity !== null &&
                giftWrappingInitialQuantity !== undefined &&
                giftWrappingAvailableQuantity !== null &&
                giftWrappingAvailableQuantity !== undefined &&
                giftWrappingRefundedQuantity !== null &&
                giftWrappingRefundedQuantity !== undefined && (
                    <tr className={bigcommerceTableCss.isGrouped}>
                        <GiftWrappingComponent
                            product={product}
                            isDisabled={giftWrappingIsDisabled}
                        />
                        <PriceComponent
                            fullPrice={giftWrappingPrice}
                            discountedPrice={giftWrappingPrice}
                            isDisabled={giftWrappingIsDisabled}
                            currencyCode={currencyCode}
                        />
                        <QuantityComponent
                            initialQuantity={giftWrappingInitialQuantity}
                            availableQuantity={giftWrappingAvailableQuantity}
                            refundedQuantity={giftWrappingRefundedQuantity}
                            isDisabled={giftWrappingIsDisabled}
                        />
                        <TotalPriceComponent
                            price={String(
                                giftWrappingPrice *
                                    giftWrappingAvailableQuantity
                            )}
                            isDisabled={giftWrappingIsDisabled}
                            currencyCode={currencyCode}
                        />
                    </tr>
                )}
        </>
    )
}
