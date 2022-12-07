import _debounce from 'lodash/debounce'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import GorgiasApi from 'services/gorgiasApi'
import {
    BigCommerceCustomerAddress,
    Cart,
    Checkout,
    Customer,
    LineItem,
    Product,
    Variant,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/types'

const _api = new GorgiasApi()

export const onInit = async ({
    customer,
    integrationId,
    setIsLoading,
    setCart,
}: {
    customer: Customer
    integrationId: number
    setIsLoading: (state: boolean) => void
    setCart: (state: Cart) => void
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
    cart: Maybe<Cart>
    setCart: (cart: Maybe<Cart>) => void
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
        setShippingAddress,
    }: {
        setCart: (cart: Maybe<Cart>) => void
        setProducts: (products: Map<number, Product>) => void
        setComment: (value: string) => void
        setNote: (value: string) => void
        setShippingAddress: (address: Maybe<BigCommerceCustomerAddress>) => void
    }) => {
        setCart(null)
        setProducts(new Map())
        setComment('')
        setNote('')
        setShippingAddress(null)
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
    customer: Customer
}): Promise<Cart> => {
    const eventName = SegmentEvent.BigCommerceCreateOrderCreateCart
    logEvent(eventName)
    return await _api.createBigCommerceCart(integrationId, customer.id)
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
    await _api.deleteBigCommerceCart(integrationId, cartId)
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
    product: Product
    variant: Variant
    setIsLoading: (state: boolean) => void
    cart: Maybe<Cart>
    setCart: (cart: Cart) => void
    products: Map<number, Product>
    setProducts: (products: Map<number, Product>) => void
}) => {
    setIsLoading(true)
    const newProducts = new Map(products)
    const cartId = cart ? cart.id : null
    if (!cartId) {
        return
    }
    const newCart = await _api.addBigCommerceLineItem(
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
    cart: Maybe<Cart>
    setCart: (cart: Cart) => void
}) => {
    setIsLoading(true)
    if (!cart) {
        return
    }
    const lineItem: LineItem = cart.line_items.physical_items.concat(
        cart.line_items.digital_items
    )[index]
    const newCart = await _api.removeBigCommerceLineItem(
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
        cart: Maybe<Cart>
        setCart: (cart: Cart) => void
        setQuantity: (quantity: number) => void
    }) => {
        setIsLoading(true)
        if (!cart) {
            return
        }
        const lineItem: LineItem = cart.line_items.physical_items.concat(
            cart.line_items.digital_items
        )[index]
        try {
            const newCart = await _api.editBigCommerceLineItem(
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
    setCheckout,
}: {
    integrationId: Maybe<number>
    selectedAddress: Maybe<BigCommerceCustomerAddress>
    cart: Maybe<Cart>
    setCheckout: (cart: Maybe<Checkout>) => void
}) => {
    if (!cart) {
        return
    }

    if (integrationId && selectedAddress) {
        const cartId = cart.id
        if (cartId) {
            const checkout = await _api.addBigCommerceCheckoutBillingAddress(
                integrationId,
                cartId,
                selectedAddress
            )
            setCheckout(checkout)
        }
    }
}

export const exportedForTesting = {
    createCart,
}
