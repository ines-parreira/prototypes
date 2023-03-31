import _debounce from 'lodash/debounce'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {
    addBigCommerceCheckoutBillingAddress,
    addBigCommerceCustomAddressToCustomerAddressBook,
    addBigCommerceLineItem,
    createBigCommerceCart,
    createBigCommerceCheckoutConsignment,
    deleteBigCommerceCart,
    editBigCommerceLineItem,
    editBigCommerceLineItemModifiers,
    getBigCommerceCheckout,
    getBigCommerceDraftOrderUrl,
    OptionSelection,
    removeBigCommerceLineItem,
    updateBigCommerceCheckoutConsignment,
} from 'models/integration/resources/bigcommerce'
import {
    BigCommerceActionType,
    BigCommerceCart,
    BigCommerceCartLineItem,
    BigCommerceCheckout,
    BigCommerceCustomAddress,
    BigCommerceCustomCartLineItem,
    BigCommerceCustomer,
    BigCommerceCustomerAddress,
    BigCommerceCustomProduct,
    BigCommerceGeneralError,
    BigCommerceGeneralErrorMessage,
    BigCommerceIntegration,
    BigCommerceLineItemError,
    BigCommerceLineItemErrorMessage,
    BigCommerceProduct,
    BigCommerceProductsListType,
    BigCommerceProductVariant,
    BigCommerceTaxCheckout,
    OrderPaymentMethodType,
    OrderStatusIDType,
    ProductModifiersChangedError,
} from 'models/integration/types'
import {StoreDispatch} from 'state/types'
import {executeAction} from 'state/infobar/actions'
import {FeatureFlagKey} from 'config/featureFlags'
import {ActionDataPayload} from 'state/infobar/utils'

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

const logAddProduct = ({
    integrationId,
    cart,
    product,
    variant,
}: {
    integrationId: number
    cart: BigCommerceCart
    product: BigCommerceProduct | BigCommerceCustomProduct
    variant?: BigCommerceProductVariant
}) => {
    logEvent(SegmentEvent.BigCommerceCreateOrderSetProducts, {
        productId: product.id,
        variantId: variant?.id,
    })
    logEvent(SegmentEvent.BigCommerceCreateOrderAddRow, {
        integrationId,
        product,
        newCart: cart,
        variant,
    })
}

export const addCustomLineItem = async ({
    integrationId,
    customProduct,
    products,
    cart,
    setIsLoading,
    setCart,
    setProducts,
    setModalErrors,
}: {
    integrationId: number
    customProduct: BigCommerceCustomProduct
    products: BigCommerceProductsListType
    cart: Maybe<BigCommerceCart>
    setIsLoading: (state: boolean) => void
    setCart: (cart: BigCommerceCart) => void
    setProducts: (products: BigCommerceProductsListType) => void
    setModalErrors: (
        errorLevel: 'global' | 'modal' | 'lineItem' | 'component',
        errorMessage: string | null,
        errorKey?: string | undefined
    ) => void
}) => {
    if (!cart?.id) {
        return
    }

    setIsLoading(true)

    try {
        const newCart = await addBigCommerceLineItem({
            integrationId: integrationId,
            cartId: cart.id,
            customProduct: customProduct,
        })

        const newCustomProduct = newCart.line_items.custom_items.find(
            (item) =>
                // Custom Line Items are identified by unique (name, list_price)
                item.name === customProduct.name &&
                item.list_price === customProduct.list_price
        )

        if (!newCustomProduct) {
            return
        }

        const newProducts = new Map(products)
        // Custom Items are identified by their ID, computed after adding them to the cart, in the Products list
        if (newCustomProduct.id && !newProducts.has(newCustomProduct.id)) {
            newProducts.set(newCustomProduct.id, newCustomProduct)
        }

        setProducts(newProducts)
        setCart(newCart)

        logAddProduct({integrationId, cart: newCart, product: newCustomProduct})

        // Error Handling
        setModalErrors(
            'modal',
            null,
            computeLineItemErrorKey({product: customProduct})
        )
        setModalErrors(
            'lineItem',
            null,
            computeLineItemErrorKey({product: customProduct})
        )
    } catch (error) {
        // Error Handling
        if (
            error instanceof BigCommerceGeneralError &&
            error.message === BigCommerceGeneralErrorMessage.rateLimitingError
        ) {
            setModalErrors('global', error.message)
        } else {
            setModalErrors(
                'modal',
                computeLineItemErrorMessage(
                    error,
                    computeLineItemName(customProduct),
                    BigCommerceLineItemErrorMessage.defaultAddLineItemError,
                    true
                ),
                computeLineItemErrorKey({product: customProduct})
            )
        }
    } finally {
        setIsLoading(false)
    }
}

export const addLineItem = async ({
    integrationId,
    product,
    products,
    variant,
    optionSelections,
    cart,
    setIsLoading,
    setCart,
    setProducts,
    setModalErrors,
}: {
    integrationId: number
    product: BigCommerceProduct
    products: BigCommerceProductsListType
    variant: BigCommerceProductVariant
    optionSelections?: OptionSelection[]
    cart: Maybe<BigCommerceCart>
    setIsLoading: (state: boolean) => void
    setCart: (cart: BigCommerceCart) => void
    setProducts: (products: BigCommerceProductsListType) => void
    setModalErrors: (
        errorLevel: 'global' | 'modal' | 'lineItem' | 'component',
        errorMessage: string | null,
        errorKey?: string | undefined
    ) => void
}) => {
    if (!cart?.id) {
        return
    }

    setIsLoading(true)

    try {
        const newCart = await addBigCommerceLineItem({
            integrationId: integrationId,
            cartId: cart.id,
            productId: product.id,
            variantId: variant.id,
            optionSelections,
        })

        const newProducts = new Map(products)
        // Line Items are identified by their ID in the Products list
        if (!newProducts.has(product.id)) {
            newProducts.set(product.id, product)
        }

        setProducts(newProducts)
        setCart(newCart)

        logAddProduct({integrationId, cart: newCart, product, variant})

        // Error Handling
        setModalErrors(
            'modal',
            null,
            computeLineItemErrorKey({product: product, variant: variant})
        )
        setModalErrors(
            'lineItem',
            null,
            computeLineItemErrorKey({product: product, variant: variant})
        )
    } catch (error) {
        // Bubble up `ProductModifiersChangedError`
        if (error instanceof ProductModifiersChangedError) {
            throw error
        }
        // Error Handling
        if (
            error instanceof BigCommerceGeneralError &&
            error.message === BigCommerceGeneralErrorMessage.rateLimitingError
        ) {
            setModalErrors('global', error.message)
        } else {
            setModalErrors(
                'modal',
                computeLineItemErrorMessage(
                    error,
                    computeLineItemName(product),
                    BigCommerceLineItemErrorMessage.defaultAddLineItemError,
                    true
                ),
                computeLineItemErrorKey({product: product, variant: variant})
            )
        }
    } finally {
        setIsLoading(false)
    }
}

function computeLineItemCustomErrorMessage(
    errorMessage: string,
    productName: string,
    addStyling = false
): string {
    const product = addStyling ? `<b>${productName}</b>` : productName

    if (
        errorMessage.includes(
            BigCommerceLineItemErrorMessage.defaultAddLineItemError
        )
    ) {
        return `${product} could not be added to cart.`
    } else if (
        errorMessage.includes(
            BigCommerceLineItemErrorMessage.defaultUpdateLineItemError
        )
    ) {
        return `${product} could not be updated.`
    } else if (
        errorMessage.includes(
            BigCommerceLineItemErrorMessage.defaultAddDiscountLineItemError
        )
    ) {
        return `Discount could not be applied for ${product}.`
    } else if (
        errorMessage.includes(
            BigCommerceLineItemErrorMessage.defaultRemoveDiscountLineItemError
        )
    ) {
        return `Discount could not be removed for ${product}.`
    } else if (
        errorMessage.includes(
            BigCommerceLineItemErrorMessage.defaultRemoveLineItemError
        )
    ) {
        return `${product} could not be removed from cart.`
    } else if (
        errorMessage.includes(
            BigCommerceLineItemErrorMessage.onlyOfflineAvailabilityError
        )
    ) {
        return `${product} cannot be purchased in the online store.`
    } else if (
        errorMessage.includes(
            BigCommerceLineItemErrorMessage.insufficientInventoryError
        )
    ) {
        return `Insufficient inventory for ${product}. Please adjust product quantity.`
    } else if (
        errorMessage.includes(
            BigCommerceLineItemErrorMessage.invalidQuantityError
        )
    ) {
        return `Invalid quantity selected for ${product}. Please adjust product quantity.`
    }

    return errorMessage
}

function computeLineItemName(
    lineItem:
        | BigCommerceCartLineItem
        | BigCommerceCustomCartLineItem
        | BigCommerceProduct
        | BigCommerceCustomProduct
) {
    return lineItem.name
}

function computeLineItemErrorMessage(
    error: Maybe<
        | BigCommerceGeneralErrorMessage
        | ProductModifiersChangedError
        | BigCommerceLineItemError
        | any
    >,
    productName: string,
    defaultError: string,
    addStyling = false
): string {
    return error instanceof BigCommerceLineItemError
        ? computeLineItemCustomErrorMessage(
              error.message,
              productName,
              addStyling
          )
        : defaultError.startsWith('Product')
        ? defaultError.substring(defaultError.indexOf(' ') + 1)
        : defaultError
}

export const computeLineItemErrorKey = ({
    lineItem,
    product,
    variant,
}: {
    lineItem?: BigCommerceCartLineItem | BigCommerceCustomCartLineItem
    product?: BigCommerceProduct | BigCommerceCustomProduct
    variant?: BigCommerceProductVariant
}): string => {
    if (lineItem) {
        return isBigCommerceCartLineItem(lineItem)
            ? `${lineItem.product_id}_${lineItem.variant_id}` // Line Item
            : `${lineItem.name}_${lineItem.list_price}` // Custom Line Item
    }
    if (product && variant && isBigCommerceProduct(product)) {
        // Product
        return `${product.id}_${variant?.id}`
    }
    if (product && !variant && !isBigCommerceProduct(product)) {
        // Custom Product
        return `${product.name}_${product?.list_price}`
    }

    return ''
}

export const removeRow = async ({
    integrationId,
    index,
    setIsLoading,
    cart,
    setCart,
    setModalErrors,
}: {
    integrationId: number
    index: number
    setIsLoading: (state: boolean) => void
    cart: Maybe<BigCommerceCart>
    setCart: (cart: BigCommerceCart) => void
    setModalErrors: (
        errorLevel: 'global' | 'modal' | 'lineItem' | 'component',
        errorMessage: string | null,
        errorKey?: string | undefined
    ) => void
}) => {
    if (!cart) {
        return
    }

    setIsLoading(true)

    const lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem = [
        ...cart.line_items.physical_items,
        ...cart.line_items.digital_items,
        ...cart.line_items.custom_items,
    ][index]

    try {
        const newCart = await removeBigCommerceLineItem(
            integrationId,
            cart.id,
            lineItem.id
        )

        setCart(newCart)

        logEvent(SegmentEvent.BigCommerceCreateOrderRemoveRow, {
            integrationId: integrationId,
            index: index,
            newCart: newCart,
        })

        // Error Handling
        setModalErrors(
            'modal',
            null,
            computeLineItemErrorKey({lineItem: lineItem})
        )
        setModalErrors(
            'lineItem',
            null,
            computeLineItemErrorKey({lineItem: lineItem})
        )
    } catch (error) {
        // Error Handling
        if (
            error instanceof BigCommerceGeneralError &&
            error.message === BigCommerceGeneralErrorMessage.rateLimitingError
        ) {
            setModalErrors('global', error.message)
        } else {
            setModalErrors(
                'lineItem',
                computeLineItemErrorMessage(
                    error,
                    computeLineItemName(lineItem),
                    BigCommerceLineItemErrorMessage.defaultRemoveLineItemError
                ),
                computeLineItemErrorKey({lineItem: lineItem})
            )
        }
    } finally {
        setIsLoading(false)
    }
}

export const updateRow = async ({
    integrationId,
    index,
    quantity,
    setIsLoading,
    cart,
    setCart,
    setModalErrors,
}: {
    integrationId: number
    index: number
    quantity: number
    setIsLoading: (state: boolean) => void
    cart: Maybe<BigCommerceCart>
    setCart: (cart: BigCommerceCart) => void
    setModalErrors: (
        errorLevel: 'global' | 'modal' | 'lineItem' | 'component',
        errorMessage: string | null,
        errorKey?: string | undefined
    ) => void
}) => {
    if (!cart) {
        return
    }

    setIsLoading(true)

    const lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem = [
        ...cart.line_items.physical_items,
        ...cart.line_items.digital_items,
        ...cart.line_items.custom_items,
    ][index]

    try {
        if (!isBigCommerceCartLineItem(lineItem)) {
            // Custom Line Item - cannot be updated via API
            return
        }

        const newCart = await editBigCommerceLineItem({
            integrationId,
            cartId: cart.id,
            lineItem,
            quantity,
        })

        setCart(newCart)

        logEvent(SegmentEvent.BigCommerceCreateOrderUpdateRow, {
            integrationId,
            index,
            quantity,
            newCart,
        })

        // Error Handling
        setModalErrors(
            'modal',
            null,
            computeLineItemErrorKey({lineItem: lineItem})
        )
        setModalErrors(
            'lineItem',
            null,
            computeLineItemErrorKey({lineItem: lineItem})
        )
    } catch (error) {
        // Error Handling
        if (
            error instanceof BigCommerceGeneralError &&
            error.message === BigCommerceGeneralErrorMessage.rateLimitingError
        ) {
            setModalErrors('global', error.message)
        } else {
            setModalErrors(
                'lineItem',
                error instanceof BigCommerceLineItemError
                    ? error.message
                    : BigCommerceLineItemErrorMessage.defaultUpdateLineItemError,
                computeLineItemErrorKey({lineItem: lineItem})
            )
        }
        // Rethrow the error for callback consumer
        throw error
    } finally {
        setIsLoading(false)
    }
}

export const updateLineItemModifiers = async ({
    integrationId,
    index,
    quantity,
    optionSelections,
    setIsLoading,
    cart,
    setCart,
    setModalErrors,
}: {
    integrationId: number
    index: number
    quantity: number
    optionSelections: OptionSelection[]
    setIsLoading: (state: boolean) => void
    cart: Maybe<BigCommerceCart>
    setCart: (cart: BigCommerceCart) => void
    setModalErrors: (
        errorLevel: 'global' | 'modal' | 'lineItem' | 'component',
        errorMessage: string | null,
        errorKey?: string | undefined
    ) => void
}) => {
    if (!cart) {
        return
    }

    setIsLoading(true)

    const lineItem: BigCommerceCartLineItem | BigCommerceCustomCartLineItem = [
        ...cart.line_items.physical_items,
        ...cart.line_items.digital_items,
        ...cart.line_items.custom_items,
    ][index]

    try {
        if (!isBigCommerceCartLineItem(lineItem)) {
            // Custom Line Item - cannot be updated via API
            return
        }

        const newCart = await editBigCommerceLineItemModifiers({
            integrationId,
            cartId: cart.id,
            lineItem,
            optionSelections,
            quantity,
        })

        setCart(newCart)

        // Error Handling
        setModalErrors(
            'modal',
            null,
            computeLineItemErrorKey({lineItem: lineItem})
        )
        setModalErrors(
            'lineItem',
            null,
            computeLineItemErrorKey({lineItem: lineItem})
        )
    } catch (error) {
        // Error Handling
        if (
            error instanceof BigCommerceGeneralError &&
            error.message === BigCommerceGeneralErrorMessage.rateLimitingError
        ) {
            setModalErrors('global', error.message)
        } else {
            setModalErrors(
                'lineItem',
                error instanceof BigCommerceLineItemError
                    ? error.message
                    : BigCommerceLineItemErrorMessage.defaultUpdateLineItemError,
                computeLineItemErrorKey({lineItem: lineItem})
            )
        }
        // Rethrow the error for callback consumer
        throw error
    } finally {
        setIsLoading(false)
    }
}

export const setLineItemDiscount = async ({
    integrationId,
    index,
    setIsLoading,
    cart,
    setCart,
    listPrice,
    action = 'add',
    setModalErrors,
}: {
    integrationId: number
    index: number
    setIsLoading: (state: boolean) => void
    cart: Maybe<BigCommerceCart>
    setCart: (cart: BigCommerceCart) => void
    listPrice: number
    action: 'add' | 'remove'
    setModalErrors: (
        errorLevel: 'global' | 'modal' | 'lineItem' | 'component',
        errorMessage: string | null,
        errorKey?: string | undefined
    ) => void
}) => {
    if (!cart) {
        return
    }

    setIsLoading(true)

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
            defaultError:
                action === 'add'
                    ? BigCommerceLineItemErrorMessage.defaultAddDiscountLineItemError
                    : BigCommerceLineItemErrorMessage.defaultRemoveDiscountLineItemError,
        })

        setCart(newCart)

        logEvent(SegmentEvent.BigCommerceCreateOrderAddLineItemDiscount, {
            integrationId,
            index,
            listPrice,
            newCart,
        })

        // Error Handling
        setModalErrors(
            'lineItem',
            null,
            computeLineItemErrorKey({lineItem: lineItem})
        )
    } catch (error) {
        // Error Handling
        if (
            error instanceof BigCommerceGeneralError &&
            error.message === BigCommerceGeneralErrorMessage.rateLimitingError
        ) {
            setModalErrors('global', error.message)
        } else {
            setModalErrors(
                'lineItem',
                computeLineItemErrorMessage(
                    error,
                    computeLineItemName(lineItem),
                    action === 'add'
                        ? BigCommerceLineItemErrorMessage.defaultAddDiscountLineItemError
                        : BigCommerceLineItemErrorMessage.defaultRemoveDiscountLineItemError
                ),
                computeLineItemErrorKey({lineItem: lineItem})
            )
        }
        // Rethrow the error for callback consumer
        throw error
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
        if (error instanceof BigCommerceGeneralError && error.status === 404) {
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

export const createCustomAddress = async ({
    integrationId,
    address,
}: {
    integrationId: number
    address: BigCommerceCustomAddress
}) => {
    return await addBigCommerceCustomAddressToCustomerAddressBook({
        integrationId,
        address,
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

export function checkAddressValidity(
    address: Maybe<BigCommerceCustomerAddress>
) {
    return !!(
        address?.customer_id &&
        address?.first_name &&
        address?.last_name &&
        address?.city &&
        address?.state_or_province &&
        address?.postal_code &&
        address?.country_code &&
        address?.address1
    )
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
            checkout.billing_address?.first_name &&
            checkout.billing_address?.last_name &&
            checkout.billing_address?.city &&
            checkout.billing_address?.state_or_province &&
            checkout.billing_address?.postal_code &&
            checkout.billing_address?.country_code &&
            checkout.billing_address?.address1
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
        checkout.consignments[0].address?.country_code &&
        checkout.consignments[0].address?.first_name &&
        checkout.consignments[0].address?.last_name &&
        checkout.consignments[0].address?.city &&
        checkout.consignments[0].address?.state_or_province &&
        checkout.consignments[0].address?.postal_code &&
        checkout.consignments[0].address?.country_code &&
        checkout.consignments[0].address?.address1 &&
        checkout.consignments[0].selected_shipping_option &&
        checkout.consignments[0].available_shipping_options.find(
            ({id}) =>
                id === checkout.consignments[0].selected_shipping_option?.id
        )
    )
}

/**
 * Send a bigcommerceCreateAction that will result in creating an order in BigCommerce
 * Note: The BigCommerce cart ID and checkout ID are the same.
 * @url https://developer.bigcommerce.com/api-reference/07d6082e99052-get-a-checkout
 */
export async function bigcommerceCreateOrder(
    dispatch: StoreDispatch,
    integration: BigCommerceIntegration,
    customerId: Maybe<string>,
    cart: Maybe<BigCommerceCart>,
    note: string,
    comment: string,
    isDraftOrder: boolean
) {
    if (!cart || !cart.id) {
        return
    }

    const payload: ActionDataPayload = {
        bigcommerce_checkout_id: cart?.id,
        bigcommerce_order_payload: {
            status_id: isDraftOrder
                ? OrderStatusIDType.incomplete
                : OrderStatusIDType.awaiting_fulfillment,
            staff_notes: note,
            customer_message: comment,
            payment_method: isDraftOrder
                ? OrderPaymentMethodType.credit_card
                : OrderPaymentMethodType.manual,
        },
    }
    if (isDraftOrder) {
        payload.bigcommerce_draft_order_url = await getBigCommerceDraftOrderUrl(
            {
                integrationId: integration.id,
                cartId: cart.id,
            }
        )
    }

    dispatch(
        executeAction({
            actionName: BigCommerceActionType.CreateOrder,
            integrationId: integration.id,
            customerId: customerId?.toString(),
            payload: payload,
        })
    )
}

export const exportedForTesting = {
    createCart,
}

export const useCanViewBigCommerceCreateOrderModifiers = () =>
    Boolean(useFlags()[FeatureFlagKey.BigcommerceCreateOrderModifiers])
