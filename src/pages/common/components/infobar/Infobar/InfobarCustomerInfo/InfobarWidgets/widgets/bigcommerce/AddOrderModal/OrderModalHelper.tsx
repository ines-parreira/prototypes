import {useCallback, useEffect, useMemo, useReducer, useState} from 'react'
import produce from 'immer'
import {
    BigCommerceActionType,
    BigCommerceCart,
    BigCommerceCheckout,
    BigCommerceCustomer,
    BigCommerceCustomerAddress,
    BigCommerceErrorList,
    BigCommerceGeneralError,
    BigCommerceGeneralErrorMessage,
    BigCommerceIntegration,
    BigCommerceLineItemError,
    BigCommerceLineItemErrorMessage,
    BigCommerceProductsListType,
    CreateOrderValidationResult,
} from 'models/integration/types'
import {
    deleteBigCommerceCoupon,
    updateBigCommerceCoupon,
} from 'models/integration/resources/bigcommerce'
import {
    addCheckoutBillingAddress,
    checkAddressValidity,
    checkCheckoutValidity,
    checkDigitalOrder,
    checkProductsValidity,
    computeLineItemErrorKey,
    computeLineItemErrorMessage,
    computeLineItemName,
    isSameAddress,
    loadCartProducts,
    onInit,
    onInitDuplicateView,
    updateCheckoutConsignmentShippingMethod,
    updateCheckoutDiscount,
    upsertCheckoutConsignment,
} from './utils'

export const useValidationStatus = ({
    products,
    billingAddress,
    shippingAddress,
    checkout,
    cart,
}: {
    products: Maybe<BigCommerceProductsListType>
    billingAddress: Maybe<BigCommerceCustomerAddress>
    shippingAddress: Maybe<BigCommerceCustomerAddress>
    checkout: Maybe<BigCommerceCheckout>
    cart: Maybe<BigCommerceCart>
}) => {
    const [onSubmitValidationDone, setOnSubmitValidationDone] = useReducer(
        () => true,
        false
    )

    const [validationStatus, setValidationStatus] =
        useState<CreateOrderValidationResult>({
            products: true,
            billingAddress: true,
            shippingAddress: true,
            checkout: true,
        })

    /**
     * @param forceValidation used to force validation, even if `onSubmitValidationDone` is false, to be used
     * in `onSubmit` handler
     */
    const performValidations = useCallback(
        (forceValidation = false) => {
            // If we are not forcing validation, and `onSubmitValidationDone` is not true yet - bail out of validation
            // This is similar to `onSubmit` `mode` of `react-hook-form` - https://react-hook-form.com/api/useform
            if (!forceValidation && !onSubmitValidationDone) {
                return
            }

            if (forceValidation) {
                setOnSubmitValidationDone()
            }

            const validationResult = {
                products: checkProductsValidity(products),
                billingAddress: checkAddressValidity(billingAddress),
                shippingAddress: checkAddressValidity(shippingAddress),
                checkout: checkCheckoutValidity({checkout, cart}),
            }

            setValidationStatus(validationResult)

            return validationResult
        },
        [
            cart,
            checkout,
            onSubmitValidationDone,
            products,
            billingAddress,
            shippingAddress,
        ]
    )

    // performValidations will change identity every time `checkout`, `product`, `billingAddress` or `shippingAddress` is updated
    useEffect(() => {
        performValidations()
    }, [performValidations])

    return {validationStatus, performValidations}
}

const getTotals = ({
    checkout,
    cart,
    shippingAddress,
}: {
    checkout: Maybe<BigCommerceCheckout>
    cart: Maybe<BigCommerceCart>
    shippingAddress: Maybe<BigCommerceCustomerAddress>
}) => {
    if (cart) {
        const cartAmountWithTax =
            cart.cart_amount ?? cart.cart_amount_inc_tax ?? 0

        const subTotal = cart.base_amount ?? 0
        const discount = cart.discount_amount
        const couponDiscount = cart.coupons.reduce(
            (accum, coupon) => accum + coupon.discounted_amount,
            0
        )
        const shipping =
            shippingAddress &&
            checkout?.consignments?.length &&
            checkout.consignments[0].selected_shipping_option &&
            checkout?.consignments[0].available_shipping_options.find(
                ({id}) =>
                    id === checkout.consignments[0].selected_shipping_option?.id
            )
                ? checkout?.shipping_cost_total_ex_tax ?? 0
                : 0
        const total =
            cartAmountWithTax + (checkout?.shipping_cost_total_inc_tax ?? 0)

        const taxes =
            cartAmountWithTax +
            ((checkout?.shipping_cost_total_inc_tax ?? 0) -
                (checkout?.shipping_cost_total_ex_tax ?? 0)) -
            (subTotal - discount - couponDiscount)

        return {
            subTotal,
            shipping,
            taxes: Math.abs(taxes), // thanks to our friend JS taxes _might_ become a negative zero, need to absolute it
            total,
        }
    }

    return {
        subTotal: 0,
        shipping: 0,
        taxes: 0,
        total: 0,
    }
}

export const useCheckout = ({
    integrationId,
    availableAddresses,
    customAddresses,
    setCustomAddresses,
}: {
    integrationId: number
    availableAddresses: Array<BigCommerceCustomerAddress>
    customAddresses: Array<BigCommerceCustomerAddress>
    setCustomAddresses: (addresses: Array<BigCommerceCustomerAddress>) => void
}) => {
    const [billingAddress, setBillingAddress] =
        useState<Maybe<BigCommerceCustomerAddress>>(null)
    const [shippingAddress, setShippingAddress] =
        useState<Maybe<BigCommerceCustomerAddress>>(null)
    const [cart, setCart] = useState<Maybe<BigCommerceCart>>(null)
    const [checkout, setCheckout] = useState<Maybe<BigCommerceCheckout>>(null)
    const [isTotalPriceLoading, setIsTotalPriceLoading] = useState(false)
    const consignment = checkout?.consignments[0] ?? null
    const [hasDifferentShippingAddress, setHasDifferentShippingAddress] =
        useState(false)
    // Errors
    const [errors, setErrors] = useState<BigCommerceErrorList>({
        global: null, // Global Error => display a generic error message in a separate popup & close the modal
        modal: new Map(), // Modal Errors => display the errors at the top of the modal
        lineItem: new Map(), // Line Item Errors => display the errors at the Line Item level
        component: new Map(), // Component Errors => display the errors at the component level
    })

    const updateConsignment = async ({
        cart,
        address,
    }: {
        cart: BigCommerceCart
        address: BigCommerceCustomerAddress
    }) => {
        try {
            setIsTotalPriceLoading(true)

            const newCheckout = await upsertCheckoutConsignment({
                integrationId,
                cart,
                shippingAddress: address,
                consignmentId: consignment?.id,
            })

            if (!newCheckout) {
                return
            }

            setCheckout(newCheckout)
        } catch (error) {
            // Error Handling
            setModalErrors(
                'global',
                error instanceof BigCommerceGeneralError
                    ? error.message
                    : BigCommerceGeneralErrorMessage.defaultError
            )
            // Rethrow the error for callback consumer
            throw error
        } finally {
            setIsTotalPriceLoading(false)
        }
    }

    const setCartExposed = (newCart: Maybe<BigCommerceCart>) => {
        setCart(newCart)

        setCheckout((checkout) => {
            if (!newCart) {
                return checkout
            }

            return produce(checkout, (draft) => {
                if (!draft) {
                    return draft
                }

                draft.cart = newCart
            })
        })

        if (newCart && shippingAddress) {
            void updateConsignment({
                cart: newCart,
                address: shippingAddress,
            })
        }
    }

    const onSelectAddress = async (
        newSelectedAddress: BigCommerceCustomerAddress,
        addressType: 'billing' | 'shipping',
        customerEmail: Maybe<string>
    ) => {
        if (!cart) {
            return
        }

        const allAddresses = Array<BigCommerceCustomerAddress>(
            ...customAddresses,
            ...availableAddresses
        )
        setIsTotalPriceLoading(true)
        if (
            !allAddresses.find((address) =>
                isSameAddress(address, newSelectedAddress)
            )
        ) {
            if (!newSelectedAddress.email.length && customerEmail?.length) {
                // Custom Address - if email is missing from payload for a guest customer (external order),
                // the bigcommerceCreateOrderFromCheckoutCart fails
                newSelectedAddress.email = customerEmail
            }
            customAddresses.push(newSelectedAddress)
            setCustomAddresses(customAddresses)
        }

        try {
            if (addressType === 'billing') {
                const newCheckout = await addCheckoutBillingAddress({
                    integrationId,
                    selectedAddress: newSelectedAddress,
                    cart,
                })

                setBillingAddress(newSelectedAddress)
                setCheckout(newCheckout)

                if (!hasDifferentShippingAddress) {
                    // Billing address === Shipping address
                    await updateConsignment({
                        cart: newCheckout.cart,
                        address: newSelectedAddress,
                    })

                    setShippingAddress(newSelectedAddress)
                }
            } else {
                await updateConsignment({
                    cart: cart,
                    address: newSelectedAddress,
                })

                setShippingAddress(newSelectedAddress)
            }

            // Error Handling
            setModalErrors(
                'component',
                null,
                addressType === 'billing'
                    ? 'onSelectBillingAddress'
                    : 'onSelectShippingAddress'
            )
        } catch (error) {
            // Error Handling
            if (
                error instanceof BigCommerceGeneralError &&
                error.message ===
                    BigCommerceGeneralErrorMessage.rateLimitingError
            ) {
                setModalErrors('global', error.message)
            } else {
                setModalErrors(
                    'component',
                    BigCommerceGeneralErrorMessage.defaultError,
                    addressType === 'billing'
                        ? 'onSelectBillingAddress'
                        : 'onSelectShippingAddress'
                )
            }
        } finally {
            setIsTotalPriceLoading(false)
        }
    }

    const onUpdateConsignmentShippingMethod = async (
        selectedShippingMethodId: Maybe<string>
    ) => {
        if (!cart || !consignment || !selectedShippingMethodId) {
            return
        }

        setIsTotalPriceLoading(true)

        try {
            const newCheckout = await updateCheckoutConsignmentShippingMethod({
                cart,
                shippingMethodId: selectedShippingMethodId,
                consignmentId: consignment.id,
                integrationId,
            })

            setCheckout(newCheckout)
        } catch (error) {
            // Error Handling
            setModalErrors(
                'global',
                error instanceof BigCommerceGeneralError
                    ? error.message
                    : BigCommerceGeneralErrorMessage.defaultError
            )
            // Rethrow the error for callback consumer
            throw error
        } finally {
            setIsTotalPriceLoading(false)
        }
    }

    const onUpdateDiscountAmount = async (
        actionName: BigCommerceActionType,
        discountAmount: number
    ) => {
        if (!cart) {
            return
        }

        setIsTotalPriceLoading(true)

        try {
            const newCheckout = await updateCheckoutDiscount({
                actionName,
                integrationId,
                cart: checkout?.cart || cart,
                discountAmount,
            })

            setCheckout(newCheckout)

            // Error Handling
            setModalErrors('component', null, 'onUpdateDiscountAmount')
        } catch (error) {
            // Error Handling
            if (
                error instanceof BigCommerceGeneralError &&
                error.message ===
                    BigCommerceGeneralErrorMessage.rateLimitingError
            ) {
                setModalErrors('global', error.message)
            } else {
                setModalErrors(
                    'component',
                    BigCommerceGeneralErrorMessage.defaultError,
                    'onUpdateDiscountAmount'
                )
            }
            // Rethrow the error for callback consumer
            throw error
        } finally {
            setIsTotalPriceLoading(false)
        }
    }

    const onUpdateCoupon = async (couponCode: string) => {
        if (!cart) {
            return
        }

        setIsTotalPriceLoading(true)

        try {
            const newCheckout = await updateBigCommerceCoupon({
                integrationId,
                checkoutId: cart.id,
                couponCode: couponCode,
            })

            setCheckout(newCheckout)
        } catch (error) {
            // Error Handling
            if (
                error instanceof BigCommerceGeneralError &&
                error.message ===
                    BigCommerceGeneralErrorMessage.rateLimitingError
            ) {
                setModalErrors('global', error.message)
            }
            // Rethrow the error for callback consumer
            throw error
        } finally {
            setIsTotalPriceLoading(false)
        }
    }

    const onRemoveCoupon = async () => {
        if (!checkout || !checkout.coupons[0]) {
            return
        }

        setIsTotalPriceLoading(true)

        try {
            const newCheckout = await deleteBigCommerceCoupon({
                integrationId,
                checkoutId: checkout.id,
                couponCode: checkout.coupons[0].code,
            })

            setCheckout(newCheckout)
        } catch (error) {
            // Error Handling
            if (
                error instanceof BigCommerceGeneralError &&
                error.message ===
                    BigCommerceGeneralErrorMessage.rateLimitingError
            ) {
                setModalErrors('global', error.message)
            }
            // Rethrow the error for callback consumer
            throw error
        } finally {
            setIsTotalPriceLoading(false)
        }
    }

    const totals = useMemo(
        () =>
            getTotals({
                checkout,
                cart: checkout?.cart ?? cart,
                shippingAddress: shippingAddress,
            }),
        [cart, checkout, shippingAddress]
    )

    function setModalErrors(
        errorLevel:
            | 'global' // Global Error => display a generic error message in a separate popup & close the modal
            | 'modal' // Modal Errors => display the errors at the top of the modal
            | 'lineItem' // Line Item Errors => display the errors at the Line Item level
            | 'component', // Component Errors => display the errors at the component level
        errorMessage: string | null,
        errorKey?: string
    ) {
        const copyErrors = Object.assign({}, errors)

        if (errorLevel === 'global') {
            copyErrors.global = errorMessage
        } else {
            if (copyErrors[errorLevel] === undefined) {
                copyErrors[errorLevel] = new Map()
            }
            if (errorKey != null) {
                copyErrors[errorLevel]?.set(errorKey, errorMessage)
            }
        }

        setErrors(copyErrors)
    }

    return {
        cart: checkout ? checkout.cart : cart,
        setCart: setCartExposed,
        checkout,
        setCheckout,
        consignment,
        onUpdateConsignmentShippingMethod,
        billingAddress,
        setBillingAddress,
        shippingAddress,
        setShippingAddress,
        onSelectAddress,
        hasDifferentShippingAddress,
        setHasDifferentShippingAddress,
        totals,
        isTotalPriceLoading,
        onUpdateDiscountAmount,
        onUpdateCoupon,
        onRemoveCoupon,
        errors,
        setModalErrors,
    }
}

export const initializeCart = async ({
    actionName,
    customer,
    order,
    currency,
    integration,
    customerId,
    cart,
    setCart,
    setCheckout,
    setCurrency,
    setProducts,
    setBillingAddress,
    setShippingAddress,
    setHasDifferentShippingAddress,
    setComment,
    setNote,
    setIsLoading,
    setModalErrors,
}: {
    actionName: BigCommerceActionType | null
    customer: BigCommerceCustomer | null
    order: Map<string, any> | null
    currency: string
    integration: BigCommerceIntegration
    customerId: Maybe<number>
    cart: Maybe<BigCommerceCart>
    setCart: (cart: Maybe<BigCommerceCart>) => void
    setCheckout: (checkout: Maybe<BigCommerceCheckout>) => void
    setCurrency: (currency: string) => void
    setProducts: (products: BigCommerceProductsListType) => void
    setBillingAddress: (address: Maybe<BigCommerceCustomerAddress>) => void
    setShippingAddress: (address: Maybe<BigCommerceCustomerAddress>) => void
    setHasDifferentShippingAddress: (
        hasDifferentShippingAddress: boolean
    ) => void
    setComment: (comment: string) => void
    setNote: (note: string) => void
    setIsLoading: (state: boolean) => void
    setModalErrors: (
        errorLevel: 'global' | 'modal' | 'lineItem' | 'component',
        errorMessage: string | null,
        errorKey?: string | undefined
    ) => void
}) => {
    if (actionName === BigCommerceActionType.CreateOrder) {
        if (customer && currency) {
            await onInit({
                actionName,
                customer,
                integrationId: integration.id,
                currency,
                setCart,
            })
        }
    }

    if (actionName === BigCommerceActionType.DuplicateOrder) {
        if (order && customerId && !cart) {
            const {cart, checkout, missingLineItems} =
                await onInitDuplicateView({
                    customerId,
                    integrationId: integration.id,
                    order,
                    setIsLoading,
                })

            if (cart?.currency) {
                setCart(cart)
                setCurrency(cart.currency.code)

                if (checkout?.cart) {
                    setCheckout(checkout)

                    setBillingAddress(
                        checkout.billing_address as unknown as BigCommerceCustomerAddress
                    )
                    if (checkDigitalOrder(checkout.cart)) {
                        setHasDifferentShippingAddress(false)
                        setShippingAddress(
                            checkout.billing_address as unknown as BigCommerceCustomerAddress
                        )
                    } else {
                        setHasDifferentShippingAddress(
                            !isSameAddress(
                                checkout.billing_address as unknown as BigCommerceCustomerAddress,
                                checkout.consignments[0]
                                    ?.address as unknown as BigCommerceCustomerAddress
                            )
                        )
                        setShippingAddress(
                            checkout.consignments[0]
                                ?.address as unknown as BigCommerceCustomerAddress
                        )
                    }
                }

                const products = await loadCartProducts({
                    integrationId: integration.id,
                    cart,
                })
                setProducts(products)
            } else {
                // We couldn't add any line item to the new cart => create a new cart
                if (customer && order && order.get('currency_code')) {
                    await onInit({
                        actionName,
                        customer,
                        integrationId: integration.id,
                        currency: order.get('currency_code'),
                        setCart,
                    })
                    setCurrency(order.get('currency_code'))
                }
            }

            missingLineItems?.forEach((errorItem) => {
                setModalErrors(
                    'modal',
                    computeLineItemErrorMessage(
                        Object.values(
                            BigCommerceLineItemErrorMessage
                        )?.includes(
                            errorItem.error as BigCommerceLineItemErrorMessage
                        )
                            ? new BigCommerceLineItemError(errorItem.error)
                            : new BigCommerceLineItemError(
                                  BigCommerceLineItemErrorMessage.defaultAddLineItemError
                              ),
                        computeLineItemName(errorItem.line_item),
                        BigCommerceLineItemErrorMessage.defaultAddLineItemError,
                        true
                    ),
                    computeLineItemErrorKey({
                        lineItem: errorItem.line_item,
                    })
                )
            })

            setComment('')
            setNote(`Order duplicated from #${order.get('id') as number}`)
        }
    }
}
