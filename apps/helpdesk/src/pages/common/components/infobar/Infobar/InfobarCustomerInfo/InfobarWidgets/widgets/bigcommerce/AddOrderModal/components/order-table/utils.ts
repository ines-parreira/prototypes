import type {
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
    BigCommerceCustomProduct,
    BigCommerceProduct,
    BigCommerceProductsListType,
} from 'models/integration/types'
import { isBigCommerceCartLineItem } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/utils'

export function getOrderLineItemInfo(
    lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem,
    products: BigCommerceProductsListType,
): { uid: string; product: BigCommerceProduct | BigCommerceCustomProduct } {
    if (!isBigCommerceCartLineItem(lineItem)) {
        return { uid: lineItem.id, product: products.get(lineItem.id)! }
    }

    let uid: string
    const productId = lineItem.product_id
    const variantId = lineItem.variant_id
    const options = lineItem.options
    uid = `${productId}${variantId ? `_${variantId}` : ''}`
    options.forEach((option) => {
        const valueId = 'valueId' in option ? option.valueId : option.value_id
        uid = `${uid}_${valueId}`
    })
    const product = products.get(lineItem.product_id)!

    return { uid, product }
}
