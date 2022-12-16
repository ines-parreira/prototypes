import _debounce from 'lodash/debounce'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {
    addBigCommerceCheckoutBillingAddress,
    addBigCommerceLineItem,
    createBigCommerceCart,
    createBigCommerceCheckoutConsignment,
    deleteBigCommerceCart,
    editBigCommerceLineItem,
    removeBigCommerceLineItem,
    updateBigCommerceCheckoutConsignment,
} from 'models/integration/resources/bigcommerce'
import {
    BigCommerceCart,
    BigCommerceCartLineItem,
    BigCommerceCustomerAddress,
    BigCommerceCustomer,
    BigCommerceProduct,
    BigCommerceProductVariant,
    BigCommerceCheckout,
    BigCommerceIntegration,
    BigCommerceActionType,
    OrderStatusIDType,
    OrderPaymentMethodType,
} from 'models/integration/types'
import {StoreDispatch} from 'state/types'
import {executeAction} from 'state/infobar/actions'

export const onInit = async ({
    customer,
    integrationId,
    setIsLoading,
    setCart,
}: {
    customer: BigCommerceCustomer
    integrationId: number
    setIsLoading: (state: boolean) => void
    setCart: (state: BigCommerceCart) => void
}) => {
    const cart = await createCart({integrationId, customer})
    const eventName = SegmentEvent.BigCommerceCreateOrderOpen
    logEvent(eventName)
    setCart(cart)
    setIsLoading(false)
}

export const onCancel = ({
    integrationId,
    via,
    cart,
    setCart,
}: {
    integrationId: Maybe<number>
    via: string
    cart: Maybe<BigCommerceCart>
    setCart: (cart: Maybe<BigCommerceCart>) => void
}) => {
    if (!cart) {
        return
    }
    const cartId = cart.id
    void deleteCart({integrationId, cartId})
    const eventName = SegmentEvent.BigCommerceCreateOrderCancel
    logEvent(eventName, {via})
    setCart(null)
}

export const onReset = _debounce(
    ({
        setCart,
        setProducts,
        setComment,
        setNote,
    }: {
        setCart: (cart: Maybe<BigCommerceCart>) => void
        setProducts: (products: Map<number, BigCommerceProduct>) => void
        setComment: (value: string) => void
        setNote: (value: string) => void
    }) => {
        setCart(null)
        setProducts(new Map())
        setComment('')
        setNote('')
        const eventName = SegmentEvent.BigCommerceCreateOrderResetModal
        logEvent(eventName)
    },
    250
)

const createCart = async ({
    integrationId,
    customer,
}: {
    integrationId: number
    customer: BigCommerceCustomer
}): Promise<BigCommerceCart> => {
    const eventName = SegmentEvent.BigCommerceCreateOrderCreateCart
    logEvent(eventName)
    return await createBigCommerceCart(integrationId, customer.id)
}

const deleteCart = async ({
    integrationId,
    cartId,
}: {
    integrationId?: Maybe<number>
    cartId: Maybe<string>
}) => {
    const eventName = SegmentEvent.BigCommerceCreateOrderDeleteCart
    logEvent(eventName)
    if (!integrationId) {
        return
    }
    await deleteBigCommerceCart(integrationId, cartId)
}

export const addRow = async ({
    integrationId,
    product,
    variant,
    setIsLoading,
    cart,
    setCart,
    products,
    setProducts,
}: {
    integrationId: number
    product: BigCommerceProduct
    variant: BigCommerceProductVariant
    setIsLoading: (state: boolean) => void
    cart: Maybe<BigCommerceCart>
    setCart: (cart: BigCommerceCart) => void
    products: Map<number, BigCommerceProduct>
    setProducts: (products: Map<number, BigCommerceProduct>) => void
}) => {
    setIsLoading(true)
    const newProducts = new Map(products)
    const cartId = cart ? cart.id : null
    if (!cartId) {
        return
    }
    const newCart = await addBigCommerceLineItem(
        integrationId,
        cartId,
        product.id,
        variant.id
    )

    if (!newProducts.has(product.id)) {
        newProducts.set(product.id, product)
    }
    let eventName = SegmentEvent.BigCommerceCreateOrderSetProducts

    logEvent(eventName, {
        productId: product.id,
        variantId: variant.id,
    })
    setIsLoading(false)
    setProducts(newProducts)
    setCart(newCart)

    eventName = SegmentEvent.BigCommerceCreateOrderAddRow
    logEvent(eventName, {
        integrationId: integrationId,
        product: product,
        variant: variant,
        newCart: newCart,
    })
}

export const removeRow = async ({
    integrationId,
    index,
    setIsLoading,
    cart,
    setCart,
}: {
    integrationId: number
    index: number
    setIsLoading: (state: boolean) => void
    cart: Maybe<BigCommerceCart>
    setCart: (cart: BigCommerceCart) => void
}) => {
    setIsLoading(true)
    if (!cart) {
        return
    }
    const lineItem: BigCommerceCartLineItem =
        cart.line_items.physical_items.concat(cart.line_items.digital_items)[
            index
        ]
    const newCart = await removeBigCommerceLineItem(
        integrationId,
        cart.id,
        lineItem.id
    )
    setIsLoading(false)
    setCart(newCart)

    const eventName = SegmentEvent.BigCommerceCreateOrderRemoveRow
    logEvent(eventName, {
        integrationId: integrationId,
        index: index,
        newCart: newCart,
    })
}

export const updateRow = _debounce(
    async ({
        integrationId,
        index,
        newQuantity,
        setIsLoading,
        cart,
        setCart,
        setQuantity,
    }: {
        integrationId: number
        index: number
        newQuantity: number
        setIsLoading: (state: boolean) => void
        cart: Maybe<BigCommerceCart>
        setCart: (cart: BigCommerceCart) => void
        setQuantity: (quantity: number) => void
    }) => {
        setIsLoading(true)
        if (!cart) {
            return
        }
        const lineItem: BigCommerceCartLineItem =
            cart.line_items.physical_items.concat(
                cart.line_items.digital_items
            )[index]
        try {
            const newCart = await editBigCommerceLineItem(
                integrationId,
                cart.id,
                lineItem,
                newQuantity
            )

            setCart(newCart)

            const eventName = SegmentEvent.BigCommerceCreateOrderUpdateRow
            logEvent(eventName, {
                integrationId: integrationId,
                index: index,
                newQuantity: newQuantity,
                newCart: newCart,
            })
        } catch (error) {
            setQuantity(lineItem.quantity)
        } finally {
            setIsLoading(false)
        }
    },
    250
)

export const buildAddressComponent = ({
    addressObj,
    includeCountry = true,
}: {
    addressObj: Maybe<BigCommerceCustomerAddress>
    includeCountry: boolean
}): string => {
    let address = ''

    if (!addressObj) {
        return address
    }

    if (addressObj.postal_code) {
        address = `${addressObj.postal_code} ${addressObj.city}`
    } else {
        address = addressObj.city
    }
    if (addressObj.state_or_province) {
        address = `${address}, ${addressObj.state_or_province}`
    }
    if (includeCountry) {
        address = `${address}, ${addressObj.country_code}, ${addressObj.country}`
    }

    return address
}

export const getOneLineAddress = ({
    addressObj,
}: {
    addressObj: Maybe<BigCommerceCustomerAddress>
}): string => {
    let address = ''

    if (!addressObj) {
        return address
    }

    address = `${addressObj.first_name} ${addressObj.last_name}, ${addressObj.address1}`
    if (addressObj.address2) {
        address = `${address} ${addressObj.address2}`
    }
    if (addressObj.phone) {
        address = `${address}, ${addressObj.phone}`
    }
    address = `${address}, ${buildAddressComponent({
        addressObj,
        includeCountry: true,
    })}`

    return address
}

export const addCheckoutBillingAddress = async ({
    integrationId,
    selectedAddress,
    cart,
}: {
    integrationId: number
    selectedAddress: BigCommerceCustomerAddress
    cart: BigCommerceCart
}) => {
    return addBigCommerceCheckoutBillingAddress(
        integrationId,
        cart.id,
        selectedAddress
    )
}

export async function upsertCheckoutConsignment({
    integrationId,
    cart,
    shippingAddress,
    consignmentId,
}: {
    integrationId: number
    cart: BigCommerceCart
    shippingAddress: BigCommerceCustomerAddress
    consignmentId: Maybe<string>
}) {
    const lineItems = cart.line_items.physical_items.map(({id, quantity}) => ({
        item_id: id,
        quantity,
    }))

    if (!lineItems.length) {
        return null
    }

    if (!consignmentId) {
        return createBigCommerceCheckoutConsignment({
            cartId: cart.id,
            integrationId,
            payload: [
                {
                    address: shippingAddress,
                    line_items: lineItems,
                },
            ],
        })
    }

    return updateBigCommerceCheckoutConsignment({
        cartId: cart.id,
        integrationId,
        consignmentId,
        payload: {
            address: shippingAddress,
            line_items: lineItems,
        },
    })
}

export const updateCheckoutConsignmentShippingMethod = async ({
    integrationId,
    cart,
    shippingMethodId,
    consignmentId,
}: {
    integrationId: number
    cart: BigCommerceCart
    shippingMethodId: string
    consignmentId: string
}) => {
    return await updateBigCommerceCheckoutConsignment({
        cartId: cart.id,
        integrationId,
        consignmentId,
        payload: {
            shipping_option_id: shippingMethodId,
        },
    })
}

export function checkProductsValidity(
    products: Maybe<Map<number, BigCommerceProduct>>
) {
    if (!products) {
        return false
    }

    return !!products?.size
}

export function checkShippingAddressValidity(
    shippingAddress: Maybe<BigCommerceCustomerAddress>
) {
    return !!(shippingAddress?.email && shippingAddress?.country_code)
}

export function checkCheckoutValidity(checkout: Maybe<BigCommerceCheckout>) {
    if (
        !(
            checkout &&
            checkout.cart?.line_items &&
            checkout.billing_address?.email &&
            checkout.billing_address?.country_code
        )
    ) {
        return false
    }

    if (
        checkout.cart.line_items?.digital_items?.length &&
        !checkout.cart.line_items?.physical_items?.length
    ) {
        // Cart contains only digital products -> there are no consignments in checkout
        return true
    }

    return !!(
        (checkout.cart.line_items?.physical_items?.length ||
            checkout.cart.line_items?.digital_items?.length) &&
        checkout.consignments?.length &&
        checkout.consignments[0].line_item_ids?.length &&
        checkout.consignments[0].address?.email &&
        checkout.consignments[0].address?.country_code &&
        checkout.consignments[0].selected_shipping_option
    )
}

/**
 * Send a bigcommerceCreateAction that will result in creating an order in BigCommerce
 * Note: The BigCommerce cart ID and checkout ID are the same.
 * @url https://developer.bigcommerce.com/api-reference/07d6082e99052-get-a-checkout
 */
export function bigcommerceCreateOrder(
    dispatch: StoreDispatch,
    integration: BigCommerceIntegration,
    customerId: Maybe<string>,
    cart: Maybe<BigCommerceCart>,
    note: string,
    comment: string
) {
    dispatch(
        executeAction({
            actionName: BigCommerceActionType.CreateOrder,
            integrationId: integration.id,
            customerId: customerId?.toString(),
            payload: {
                bigcommerce_checkout_id: cart?.id,
                bigcommerce_order_payload: {
                    status_id: OrderStatusIDType.awaiting_fulfillment,
                    staff_notes: note,
                    customer_message: comment,
                    payment_method: OrderPaymentMethodType.manual,
                },
            },
        })
    )
}

export const exportedForTesting = {
    createCart,
}
