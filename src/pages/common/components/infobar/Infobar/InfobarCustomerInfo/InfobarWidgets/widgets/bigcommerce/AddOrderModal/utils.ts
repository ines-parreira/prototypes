import _debounce from 'lodash/debounce'
import axios from 'axios'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {
    addBigCommerceCheckoutBillingAddress,
    addBigCommerceLineItem,
    createBigCommerceCart,
    createBigCommerceCheckoutConsignment,
    deleteBigCommerceCart,
    editBigCommerceLineItem,
    getBigCommerceCheckout,
    removeBigCommerceLineItem,
    updateBigCommerceCheckoutConsignment,
} from 'models/integration/resources/bigcommerce'
import {
    BigCommerceCart,
    BigCommerceCartLineItem,
    BigCommerceCustomCartLineItem,
    BigCommerceCustomerAddress,
    BigCommerceCustomer,
    BigCommerceProduct,
    BigCommerceProductVariant,
    BigCommerceCheckout,
    BigCommerceIntegration,
    BigCommerceActionType,
    OrderStatusIDType,
    OrderPaymentMethodType,
    BigCommerceTaxCheckout,
    BigCommerceCustomProduct,
    BigCommerceErrorMessage,
    BigCommerceCreateOrderErrorType,
    BigCommerceProductsListType,
} from 'models/integration/types'
import {StoreDispatch} from 'state/types'
import {executeAction} from 'state/infobar/actions'
import {FeatureFlagKey} from 'config/featureFlags'

export const isBigCommerceCartLineItem = (
    lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem
): lineItem is BigCommerceCartLineItem => 'product_id' in lineItem

export const isBigCommerceProduct = (
    product: BigCommerceProduct | BigCommerceCustomProduct
): product is BigCommerceProduct => 'variants' in product

export const onInit = async ({
    customer,
    integrationId,
    currency,
    setIsLoading,
    setCart,
}: {
    customer: BigCommerceCustomer
    integrationId: number
    currency: string
    setIsLoading: (state: boolean) => void
    setCart: (state: BigCommerceCart) => void
}) => {
    const cart = await createCart({integrationId, customer, currency})
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
        setProducts: (products: BigCommerceProductsListType) => void
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
    currency,
}: {
    integrationId: number
    customer: BigCommerceCustomer
    currency: string
}): Promise<BigCommerceCart> => {
    const eventName = SegmentEvent.BigCommerceCreateOrderCreateCart
    logEvent(eventName)
    return await createBigCommerceCart(integrationId, customer.id, currency)
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
    lineProduct,
    customProduct,
    products,
    variant,
    optionSelections,
    cart,
    setIsLoading,
    setCart,
    setProducts,
    setLineItemWithError,
}: {
    integrationId: number
    lineProduct?: BigCommerceProduct
    customProduct?: BigCommerceCustomProduct
    products: BigCommerceProductsListType
    optionSelections?: {option_id: number; option_value: number}[]
    variant?: BigCommerceProductVariant
    cart: Maybe<BigCommerceCart>
    setIsLoading: (state: boolean) => void
    setCart: (cart: BigCommerceCart) => void
    setProducts: (products: BigCommerceProductsListType) => void
    setLineItemWithError: (value: BigCommerceCreateOrderErrorType) => void
}) => {
    setIsLoading(true)
    const newProducts = new Map(products)
    const cartId = cart ? cart.id : null
    if (!cartId || !cart) {
        return
    }

    let newCart

    try {
        if (customProduct) {
            newCart = await addBigCommerceLineItem({
                integrationId: integrationId,
                cartId: cartId,
                customProduct: customProduct,
            })

            const newCustomProduct: Maybe<BigCommerceCustomCartLineItem> =
                newCart.line_items.custom_items.find(
                    (item: BigCommerceCustomProduct) =>
                        item.name === customProduct.name &&
                        item.list_price === customProduct.list_price
                )

            if (!newCustomProduct) {
                return
            }

            // Custom Items are identified by their ID, computed after adding them to the cart, in the Products list
            if (newCustomProduct.id && !newProducts.has(newCustomProduct.id)) {
                newProducts.set(newCustomProduct.id, newCustomProduct)
            }
            let eventName = SegmentEvent.BigCommerceCreateOrderSetProducts

            logEvent(eventName, {
                productId: newCustomProduct.id,
            })
            setIsLoading(false)
            setProducts(newProducts)
            setCart(newCart)

            eventName = SegmentEvent.BigCommerceCreateOrderAddRow
            logEvent(eventName, {
                integrationId: integrationId,
                product: newCustomProduct,
                newCart: newCart,
            })
        } else if (lineProduct && variant) {
            newCart = await addBigCommerceLineItem({
                integrationId: integrationId,
                cartId: cartId,
                productId: lineProduct.id,
                variantId: variant.id,
                optionSelections,
            })

            // Line Items are identified by their ID in the Products list
            if (!newProducts.has(lineProduct.id)) {
                newProducts.set(lineProduct.id, lineProduct)
            }
            let eventName = SegmentEvent.BigCommerceCreateOrderSetProducts

            logEvent(eventName, {
                productId: lineProduct.id,
                variantId: variant.id,
            })
            setIsLoading(false)
            setProducts(newProducts)
            setCart(newCart)

            eventName = SegmentEvent.BigCommerceCreateOrderAddRow
            logEvent(eventName, {
                integrationId: integrationId,
                product: lineProduct,
                variant: variant,
                newCart: newCart,
            })
        } else {
            return
        }

        setLineItemWithError({id: null, message: ''})
    } catch (error) {
        if (lineProduct && variant) {
            // Line Item
            const lineItems = cart.line_items.physical_items.concat(
                cart.line_items.digital_items
            )
            const lineItem = lineItems.find(
                (l) =>
                    l.product_id === lineProduct.id &&
                    l.variant_id === variant.id
            )
            setLineItemWithError({
                id: lineItem ? lineItem.id : null,
                message: BigCommerceErrorMessage.defaultError,
            })
        } else {
            // Custom Line Item
            setLineItemWithError({
                id: null,
                message: BigCommerceErrorMessage.defaultError,
            })
        }
    } finally {
        setIsLoading(false)
    }
}

export const removeRow = async ({
    integrationId,
    index,
    setIsLoading,
    cart,
    setCart,
    setLineItemWithError,
}: {
    integrationId: number
    index: number
    setIsLoading: (state: boolean) => void
    cart: Maybe<BigCommerceCart>
    setCart: (cart: BigCommerceCart) => void
    setLineItemWithError: (value: BigCommerceCreateOrderErrorType) => void
}) => {
    setIsLoading(true)
    if (!cart) {
        return
    }
    const lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem = [
        ...cart.line_items.physical_items,
        ...cart.line_items.digital_items,
        ...cart.line_items.custom_items,
    ][index]

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
    setLineItemWithError({id: null, message: ''})
}

export const updateRow = _debounce(
    async ({
        integrationId,
        index,
        newQuantity,
        setQuantity,
        setIsLoading,
        cart,
        setCart,
        lineItemWithError,
        setLineItemWithError,
    }: {
        integrationId: number
        index: number
        newQuantity: number
        setQuantity: (value: number) => void
        setIsLoading: (state: boolean) => void
        cart: Maybe<BigCommerceCart>
        setCart: (cart: BigCommerceCart) => void
        lineItemWithError?: BigCommerceCreateOrderErrorType
        setLineItemWithError: (value: BigCommerceCreateOrderErrorType) => void
    }) => {
        setIsLoading(true)
        if (!cart) {
            return
        }
        const lineItem:
            | BigCommerceCartLineItem
            | BigCommerceCustomCartLineItem = [
            ...cart.line_items.physical_items,
            ...cart.line_items.digital_items,
            ...cart.line_items.custom_items,
        ][index]

        try {
            if (!isBigCommerceCartLineItem(lineItem)) {
                // Custom Line Item - cannot be updated via API
                if (
                    lineItem.quantity === newQuantity &&
                    lineItemWithError &&
                    lineItemWithError.message
                ) {
                    setLineItemWithError({id: null, message: ''})
                    return
                }

                setLineItemWithError({
                    id: lineItem.id,
                    message:
                        BigCommerceErrorMessage.customLineItemCannotBeUpdatedError,
                    type: 'warning',
                })
                return
            }

            const newCart = await editBigCommerceLineItem({
                integrationId: integrationId,
                cartId: cart.id,
                lineItem: lineItem,
                quantity: newQuantity,
            })

            setCart(newCart)

            const eventName = SegmentEvent.BigCommerceCreateOrderUpdateRow
            logEvent(eventName, {
                integrationId: integrationId,
                index: index,
                newQuantity: newQuantity,
                newCart: newCart,
            })
            setLineItemWithError({id: null, message: ''})
        } catch (error) {
            setQuantity(lineItem.quantity)
            setLineItemWithError({
                id: lineItem.id,
                message: BigCommerceErrorMessage.defaultError,
            })
        } finally {
            setIsLoading(false)
        }
    },
    250
)

export const setLineItemDiscount = async ({
    integrationId,
    index,
    setIsLoading,
    cart,
    setCart,
    setLineItemWithError,
    listPrice,
}: {
    integrationId: number
    index: number
    setIsLoading: (state: boolean) => void
    cart: Maybe<BigCommerceCart>
    setCart: (cart: BigCommerceCart) => void
    setLineItemWithError: (value: BigCommerceCreateOrderErrorType) => void
    listPrice: number
}) => {
    setIsLoading(true)

    if (!cart) {
        return
    }

    const lineItem = [
        ...cart.line_items.physical_items,
        ...cart.line_items.digital_items,
    ][index]

    try {
        const newCart = await editBigCommerceLineItem({
            integrationId,
            cartId: cart.id,
            lineItem,
            quantity: lineItem.quantity,
            listPrice: listPrice,
        })

        setCart(newCart)

        logEvent(SegmentEvent.BigCommerceCreateOrderAddLineItemDiscount, {
            integrationId,
            index,
            listPrice,
            newCart,
        })

        setLineItemWithError({id: null, message: ''})
    } catch (error) {
        setLineItemWithError({
            id: lineItem.id,
            message: BigCommerceErrorMessage.defaultError,
        })
    } finally {
        setIsLoading(false)
    }
}

export const buildTaxExtraInfo = ({
    taxes,
}: {
    taxes: Maybe<BigCommerceTaxCheckout[]>
}): string => {
    if (!taxes) {
        return ''
    }

    return taxes
        .filter(({amount}) => amount > 0)
        .map(({name}) => name)
        .join(', ')
}

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
    address = `${address}, ${buildAddressComponent({
        addressObj,
        includeCountry: true,
    })}`
    if (addressObj.phone) {
        address = `${address}, ${addressObj.phone}`
    }

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
    const lineItems = [
        ...cart.line_items.physical_items,
        ...cart.line_items.digital_items,
        ...cart.line_items.custom_items,
    ].map(({id, quantity}) => ({
        item_id: id,
        quantity,
    }))

    if (!lineItems.length) {
        return null
    }

    const singleConsignmentPayload = {
        address: shippingAddress,
        line_items: lineItems,
    }

    if (!consignmentId) {
        return createBigCommerceCheckoutConsignment({
            cartId: cart.id,
            integrationId,
            payload: [singleConsignmentPayload],
        })
    }

    /**
     * try...catch here to intercept 404 during consignment update.
     *
     * There are some corner cases, when consignment gets deleted on BC side without us knowing about that.
     * In that case we will get 404 when trying to update that consignment. We "catch" this case and request
     * an up-to-date `checkout` object from BC
     */
    try {
        return await updateBigCommerceCheckoutConsignment({
            cartId: cart.id,
            integrationId,
            consignmentId,
            payload: singleConsignmentPayload,
        })
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return await getBigCommerceCheckout({
                integrationId,
                checkoutId: cart.id,
            })
        }

        throw error
    }
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
    products: BigCommerceProductsListType | undefined | null
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

export function checkCheckoutValidity({
    checkout,
    cart,
}: {
    checkout: Maybe<BigCommerceCheckout>
    cart: Maybe<BigCommerceCart>
}) {
    if (
        cart &&
        cart.line_items?.digital_items?.length &&
        !cart.line_items?.physical_items?.length &&
        !cart.line_items?.custom_items?.length
    ) {
        // Cart contains only digital products -> there are no consignments in checkout
        return true
    }

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

    return !!(
        (checkout.cart.line_items?.physical_items?.length ||
            checkout.cart.line_items?.digital_items?.length ||
            checkout.cart.line_items?.custom_items?.length) &&
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

export const useCanViewBigCommerceV1Features = () =>
    Boolean(useFlags()[FeatureFlagKey.BigCommerceCreateOrderV1])

export const useCanViewBigCommerceCreateOrderModifiers = () =>
    Boolean(useFlags()[FeatureFlagKey.BigcommerceCreateOrderModifiers])
