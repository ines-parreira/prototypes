import React, {
    ChangeEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react'

import classnames from 'classnames'

import produce from 'immer'
import {Row} from 'reactstrap'
import shortcutManager from 'services/shortcutManager/shortcutManager'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'

import {InfobarModalProps} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import Label from 'pages/common/forms/Label/Label'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {
    AddressType,
    BigCommerceErrorList,
    BigCommerceActionType,
    BigCommerceCart,
    BigCommerceCartLineItem,
    BigCommerceCheckout,
    BigCommerceCustomCartLineItem,
    BigCommerceCustomer,
    BigCommerceCustomerAddress,
    BigCommerceCustomProduct,
    BigCommerceGeneralError,
    BigCommerceGeneralErrorMessage,
    BigCommerceIntegration,
    BigCommerceProduct,
    BigCommerceProductsListType,
    BigCommerceProductVariant,
    CreateOrderValidationResult,
    IntegrationType,
    ProductModifiersChangedError,
} from 'models/integration/types'
import {getIntegrationsByType} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import {getCustomerAddresses} from 'state/infobarActions/bigcommerce/createOrder/selectors'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import useAppDispatch from 'hooks/useAppDispatch'
import {CustomerContext} from 'providers/infobar/CustomerContext'
import {
    deleteBigCommerceCoupon,
    OptionSelection,
    updateBigCommerceCheckoutDiscount,
    updateBigCommerceCoupon,
} from 'models/integration/resources/bigcommerce'
import Tooltip from 'pages/common/components/Tooltip'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import CheckBox from 'pages/common/forms/CheckBox'
import OrderTable from './components/order-table/OrderTable'
import OrderTotals from './OrderTotals'
import {
    addCheckoutBillingAddress,
    addCustomLineItem,
    addLineItem,
    bigcommerceCreateOrder,
    checkCheckoutValidity,
    checkProductsValidity,
    checkAddressValidity,
    onCancel,
    onInit,
    onReset,
    removeRow,
    setLineItemDiscount,
    updateCheckoutConsignmentShippingMethod,
    updateLineItemModifiers,
    updateRow,
    upsertCheckoutConsignment,
} from './utils'
import {AddressesDropdown} from './AddressesDropdown'
import {CurrencyPickerDropdown} from './CurrencyPickerDropdown'

import css from './OrderModal.less'
import {ProductSearch} from './ProductSearch'
import {useAddModifiersPopover} from './components/modifiers-popover/hooks'
import {modifierValuesToOptionSelections} from './components/modifiers-popover/utils'
import GeneralErrorPopupModal from './GeneralErrorPopupModal'

type Props = {
    integration: BigCommerceIntegration
    customerId?: Maybe<number>
    availableAddresses: BigCommerceCustomerAddress[]
} & ConnectedProps

const useValidationStatus = ({
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
}: {
    checkout: Maybe<BigCommerceCheckout>
    cart: Maybe<BigCommerceCart>
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
        const shipping = checkout?.shipping_cost_total_ex_tax ?? 0
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
        addressType: 'billing' | 'shipping'
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
            !allAddresses.find((address) => {
                return (
                    address.first_name === newSelectedAddress.first_name &&
                    address.last_name === newSelectedAddress.last_name &&
                    address.company === newSelectedAddress.company &&
                    address.city === newSelectedAddress.city &&
                    address.state_or_province ===
                        newSelectedAddress.state_or_province &&
                    address.postal_code === newSelectedAddress.postal_code &&
                    address.country_code === newSelectedAddress.country_code &&
                    address.address1 === newSelectedAddress.address1 &&
                    address.address2 === newSelectedAddress.address2
                )
            })
        ) {
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

    const onUpdateDiscountAmount = async (discountAmount: number) => {
        if (!cart) {
            return
        }

        setIsTotalPriceLoading(true)

        try {
            const newCheckout = await updateBigCommerceCheckoutDiscount({
                integrationId,
                checkoutId: cart.id,
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
        () => getTotals({checkout, cart: checkout?.cart ?? cart}),
        [cart, checkout]
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
        checkout,
        consignment,
        totals,
        billingAddress,
        shippingAddress,
        setShippingAddress,
        onSelectAddress,
        hasDifferentShippingAddress,
        setHasDifferentShippingAddress,
        isTotalPriceLoading,
        setCart: setCartExposed,
        onUpdateConsignmentShippingMethod,
        onUpdateDiscountAmount,
        onUpdateCoupon,
        onRemoveCoupon,
        errors,
        setModalErrors,
    }
}

export function OrderModal({
    integration,
    customerId,
    availableAddresses,
    data = {actionName: null, customer: null},
    onClose,
}: Props) {
    const dispatch = useAppDispatch()

    const storeHasMultipleCurrencies = integration.meta.available_currencies
        ? integration.meta.available_currencies.length > 1
        : false
    const [currency, setCurrency] = useState(
        storeHasMultipleCurrencies ? '' : integration.meta.currency
    )
    const [isLoading, setIsLoading] = useState(false)
    const [isDraftOrder, setIsDraftOrder] = useState(true)

    const [products, setProducts] = useState<BigCommerceProductsListType>(
        new Map()
    )
    const [customAddresses, setCustomAddresses] = useState<
        Array<BigCommerceCustomerAddress>
    >([])

    const {
        cart,
        checkout,
        consignment,
        totals,
        billingAddress,
        shippingAddress,
        setShippingAddress,
        onSelectAddress,
        hasDifferentShippingAddress,
        setHasDifferentShippingAddress,
        isTotalPriceLoading,
        setCart,
        onUpdateConsignmentShippingMethod,
        onUpdateDiscountAmount,
        onUpdateCoupon,
        onRemoveCoupon,
        errors,
        setModalErrors,
    } = useCheckout({
        integrationId: integration.id,
        availableAddresses: availableAddresses,
        customAddresses,
        setCustomAddresses,
    })

    const {validationStatus, performValidations} = useValidationStatus({
        products,
        billingAddress,
        shippingAddress,
        checkout,
        cart,
    })

    const [note, setNote] = useState('')
    const [comment, setComment] = useState('')

    const onUpdateNote = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setNote(event.currentTarget.value)
    }

    const onUpdateComment = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setComment(event.currentTarget.value)
    }

    const lineItems: Array<
        BigCommerceCartLineItem | BigCommerceCustomCartLineItem
    > = cart
        ? [
              ...cart.line_items.physical_items,
              ...cart.line_items.digital_items,
              ...cart.line_items.custom_items,
          ]
        : []

    const hasItemsInCart = Boolean(lineItems.length)

    const handleReset = useCallback(() => {
        onReset({setCart, setProducts, setComment, setNote})
    }, [setCart])

    const handleCancel = (via: string, deleteCart = true) => {
        onClose()
        if (deleteCart) {
            onCancel({integrationId: integration.id, via, cart, setCart})
        }
        handleReset()
    }

    const handleAddOrder = () => {
        const validationResult = performValidations(true)
        const orderIsValid = validationResult
            ? Object.values(validationResult).every(Boolean)
            : false

        if (!orderIsValid) {
            return
        }

        void bigcommerceCreateOrder(
            dispatch,
            integration,
            customerId?.toString(),
            cart,
            note,
            comment,
            isDraftOrder
        )

        handleCancel('create-order', false)
    }

    useEffect(() => {
        async function createCart() {
            if (data.customer && currency) {
                try {
                    await onInit({
                        customer: data.customer,
                        integrationId: integration.id,
                        currency,
                        setIsLoading,
                        setCart,
                    })
                } catch (error) {
                    // Error Handling
                    setModalErrors(
                        'global',
                        error instanceof BigCommerceGeneralError
                            ? error.message
                            : BigCommerceGeneralErrorMessage.defaultError
                    )
                } finally {
                    setIsLoading(false)
                }
            }
        }

        createCart().catch(console.error)

        shortcutManager.pause()

        return () => {
            handleReset()
            shortcutManager.unpause()
        }
        // Single run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currency])

    useEffect(
        () => {
            if (hasDifferentShippingAddress) {
                // Billing address !== Shipping address
                setShippingAddress(null)
            }
            if (billingAddress && !hasDifferentShippingAddress) {
                // Billing address === Shipping address
                void onSelectAddress(billingAddress, 'billing')
            }
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [hasDifferentShippingAddress]
    )

    const handleAddCustomProduct = (customProduct: BigCommerceCustomProduct) =>
        void addCustomLineItem({
            integrationId: integration.id,
            customProduct,
            products,
            cart,
            setIsLoading,
            setCart,
            setProducts,
            setModalErrors,
        })

    const handleAddRow = async (props: {
        product: BigCommerceProduct
        variant: BigCommerceProductVariant
        optionSelections?: OptionSelection[]
    }) => {
        const {product, variant, optionSelections} = props

        return addLineItem({
            integrationId: integration.id,
            product: product,
            variant,
            optionSelections,
            products,
            cart,
            setIsLoading,
            setCart,
            setProducts,
            setModalErrors,
        })
    }

    const {
        getReferenceProps,
        setReference,
        modifiersPopover,
        maybeOpenModifierPopover,
    } = useAddModifiersPopover(
        integration.meta.store_hash,
        async ({product, variant, modifierValues}) => {
            const optionSelections =
                modifierValuesToOptionSelections(modifierValues)

            try {
                await handleAddRow({product, variant, optionSelections})
            } catch (error) {
                if (error instanceof ProductModifiersChangedError) {
                    maybeOpenModifierPopover({
                        product: error.product,
                        variant,
                        modifierValues,
                    })
                }
            }
        }
    )

    const containerElement = document.getElementById('App') as Element

    return (
        <>
            <Modal
                isOpen
                isScrollable
                isClosable={false}
                onClose={() => handleCancel('header')}
                size="medium"
                container={containerElement}
            >
                <ModalHeader title="Create order" forceCloseButton />
                <div
                    className={css.scrollable}
                    ref={setReference}
                    {...getReferenceProps()}
                >
                    <div className={css.formBody}>
                        <div className={css.alerts}>
                            <div>
                                <Row className="mb-3">
                                    <PreviewRadioButton
                                        className={
                                            css.previewRadioButtonsWrapper
                                        }
                                        value={AddressType.Personal}
                                        isSelected={isDraftOrder}
                                        label="Draft order"
                                        caption="Generate unique cart URL valid for up to 30 days."
                                        onClick={() => setIsDraftOrder(true)}
                                    />
                                </Row>
                                <Row className="mb-3">
                                    <PreviewRadioButton
                                        className={
                                            css.previewRadioButtonsWrapper
                                        }
                                        value={AddressType.Company}
                                        isSelected={!isDraftOrder}
                                        label="Paid order"
                                        onClick={() => setIsDraftOrder(false)}
                                        caption="Create paid order with Awaiting Fulfillment status."
                                    />
                                </Row>
                            </div>
                            {/*Modal errors*/}
                            {errors.modal.keys() &&
                                Array.from(errors.modal.keys()).map((key) => {
                                    return (
                                        errors.modal.get(key) && (
                                            <Alert
                                                key={key}
                                                className="mt-1"
                                                type={AlertType.Error}
                                                icon={true}
                                                onClose={() => {
                                                    setModalErrors(
                                                        'modal',
                                                        null,
                                                        key
                                                    )
                                                }}
                                            >
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            errors.modal.get(
                                                                key
                                                            ) || '',
                                                    }}
                                                />
                                            </Alert>
                                        )
                                    )
                                })}
                        </div>
                        <div className={css.currencyDropdown}>
                            {storeHasMultipleCurrencies && (
                                <CurrencyPickerDropdown
                                    availableCurrencies={
                                        integration.meta.available_currencies
                                    }
                                    currency={currency}
                                    setCurrency={setCurrency}
                                />
                            )}
                        </div>
                        <div>
                            <p className="heading-section-semibold">Products</p>
                        </div>
                        <div
                            className={css.relative}
                            id="product-search-input-tooltip"
                        >
                            {!currency && (
                                <Tooltip target="product-search-input-tooltip">
                                    Set currency to select products.
                                </Tooltip>
                            )}
                            <ProductSearch
                                // Evict the search result after new product is added
                                key={Array.from(products.values()).pop()?.id}
                                currency={currency}
                                validationStatus={validationStatus}
                                onAddCustomProduct={handleAddCustomProduct}
                                onVariantClicked={async (item, variant) => {
                                    if (
                                        maybeOpenModifierPopover({
                                            product: item.data,
                                            variant,
                                        })
                                    ) {
                                        // If modifier popover opened - do not proceed further
                                        return
                                    }

                                    try {
                                        await handleAddRow({
                                            product: item.data,
                                            variant,
                                        })
                                    } catch (error) {
                                        if (
                                            error instanceof
                                            ProductModifiersChangedError
                                        ) {
                                            maybeOpenModifierPopover({
                                                product: error.product,
                                                variant,
                                            })
                                        }
                                    }
                                }}
                            />
                            {validationStatus?.products === false && (
                                <p
                                    className={classnames(
                                        css.caption,
                                        css.hasError
                                    )}
                                >
                                    Select at least one product.
                                </p>
                            )}
                            {!hasItemsInCart && (
                                <p className={css.searchbarInfo}>
                                    This order is currently empty. Add products
                                    using the search above.
                                </p>
                            )}
                            {integration.meta && hasItemsInCart && (
                                <OrderTable
                                    storeHash={integration.meta.store_hash}
                                    currencyCode={currency}
                                    lineItems={lineItems}
                                    products={products}
                                    lineItemsWithErrors={errors.lineItem}
                                    onLineItemDiscount={async (
                                        index,
                                        listPrice,
                                        action: 'add' | 'remove'
                                    ) =>
                                        await setLineItemDiscount({
                                            integrationId: integration.id,
                                            index,
                                            setIsLoading,
                                            cart,
                                            setCart,
                                            listPrice,
                                            action,
                                            setModalErrors,
                                        })
                                    }
                                    onLineItemUpdate={async (index, quantity) =>
                                        await updateRow({
                                            integrationId: integration.id,
                                            index,
                                            quantity,
                                            setIsLoading,
                                            cart,
                                            setCart,
                                            setModalErrors,
                                        })
                                    }
                                    onLineItemModifiersUpdate={async ({
                                        index,
                                        quantity,
                                        optionSelections,
                                    }) =>
                                        await updateLineItemModifiers({
                                            integrationId: integration.id,
                                            index,
                                            quantity,
                                            optionSelections,
                                            setIsLoading,
                                            cart,
                                            setCart,
                                            setModalErrors,
                                        })
                                    }
                                    onLineItemDelete={(index) => {
                                        void removeRow({
                                            integrationId: integration.id,
                                            index,
                                            setIsLoading,
                                            cart,
                                            setCart,
                                            setModalErrors,
                                        })
                                    }}
                                />
                            )}
                            {isLoading && (
                                <div className={css.loader}>
                                    <Loader minHeight={'50px'} />
                                </div>
                            )}
                        </div>
                        {hasItemsInCart && currency && (
                            <OrderTotals
                                checkout={checkout}
                                cart={cart}
                                consignment={consignment}
                                totals={totals}
                                hasShippingAddress={Boolean(shippingAddress)}
                                onUpdateConsignmentShippingMethod={
                                    onUpdateConsignmentShippingMethod
                                }
                                onUpdateDiscountAmount={onUpdateDiscountAmount}
                                onUpdateCoupon={onUpdateCoupon}
                                onRemoveCoupon={onRemoveCoupon}
                                hasError={!validationStatus.checkout}
                                isTotalPriceLoading={isTotalPriceLoading}
                                currencyCode={currency}
                            />
                        )}
                        <div>
                            <p className={css.modalSection}>Address</p>
                            <AddressesDropdown
                                selectedAddress={billingAddress}
                                availableAddresses={
                                    new Array<BigCommerceCustomerAddress>(
                                        ...availableAddresses,
                                        ...customAddresses
                                    )
                                }
                                onSelectAddress={onSelectAddress}
                                addressType="billing"
                                currencyCode={currency}
                                hasError={
                                    !validationStatus.billingAddress ||
                                    !!errors.component.get(
                                        'onSelectBillingAddress'
                                    )
                                }
                                errorMessage={
                                    errors.component.get(
                                        'onSelectBillingAddress'
                                    ) || ''
                                }
                                isDisabled={!currency}
                                integrationId={integration.id}
                                customerId={data?.customer?.id}
                            />
                            <CheckBox
                                isChecked={!hasDifferentShippingAddress}
                                className="mt-3 mb-3"
                                onChange={() => {
                                    if (!isTotalPriceLoading) {
                                        setHasDifferentShippingAddress(
                                            !hasDifferentShippingAddress
                                        )
                                    }
                                }}
                            >
                                Shipping address is same as billing address
                            </CheckBox>
                            {hasDifferentShippingAddress && (
                                <AddressesDropdown
                                    selectedAddress={shippingAddress}
                                    availableAddresses={
                                        new Array<BigCommerceCustomerAddress>(
                                            ...availableAddresses,
                                            ...customAddresses
                                        )
                                    }
                                    onSelectAddress={onSelectAddress}
                                    addressType="shipping"
                                    currencyCode={currency}
                                    hasError={
                                        !validationStatus.shippingAddress ||
                                        !!errors.component.get(
                                            'onSelectShippingAddress'
                                        )
                                    }
                                    errorMessage={
                                        errors.component.get(
                                            'onSelectShippingAddress'
                                        ) || ''
                                    }
                                    isDisabled={!currency}
                                    integrationId={integration.id}
                                    customerId={data?.customer?.id}
                                />
                            )}
                        </div>
                        <p className={css.modalSection}>Comments & Notes</p>
                        <div>
                            <Label className={css.label} htmlFor="comment">
                                Comment
                            </Label>
                            <textarea
                                rows={1}
                                className="form-control"
                                placeholder="Add comment..."
                                value={comment}
                                onChange={onUpdateComment}
                                id="comment"
                                aria-describedby="comment-desc"
                            />
                            <p className={css.caption} id="comment-desc">
                                Visible to customer
                            </p>
                        </div>
                        <div>
                            <Label className={css.label} htmlFor="note">
                                Staff note
                            </Label>
                            <textarea
                                rows={1}
                                className={classnames('form-control')}
                                placeholder="Add note..."
                                value={note}
                                onChange={onUpdateNote}
                                id="note"
                                aria-describedby="note-desc"
                            />
                            <p className={css.caption} id="note-desc">
                                Not visible to customer
                            </p>
                        </div>
                    </div>
                    {modifiersPopover}
                </div>
                <ModalFooter className={css.wrapper}>
                    <div className={css.actions}>
                        <Button
                            tabIndex={0}
                            intent="secondary"
                            onClick={() => handleCancel('footer')}
                        >
                            Cancel
                        </Button>
                        <Button
                            intent="primary"
                            tabIndex={0}
                            onClick={() => void handleAddOrder()}
                            isDisabled={isTotalPriceLoading || !currency}
                        >
                            {isDraftOrder
                                ? 'Create Draft Order'
                                : 'Create Paid Order'}
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
            {errors.global && (
                <GeneralErrorPopupModal
                    isOpen={true}
                    errorMessage={errors.global}
                    onClose={() => {
                        setModalErrors('global', null)
                        handleCancel('error')
                    }}
                />
            )}
        </>
    )
}

type ConnectedProps = {
    data?: {
        actionName: BigCommerceActionType | null
        customer: BigCommerceCustomer | null
    }
} & Pick<InfobarModalProps, 'isOpen' | 'onClose'>

export default function OrderModalRenderWrapper(props: ConnectedProps) {
    const {integrationId} = useContext(IntegrationContext)
    const {customerId} = useContext(CustomerContext)

    const integrations = useAppSelector(
        getIntegrationsByType(IntegrationType.BigCommerce)
    )

    const integration = useMemo(
        () =>
            integrations.find(
                (integration) => integration.id === integrationId
            ),
        [integrations, integrationId]
    )

    const availableAddresses: BigCommerceCustomerAddress[] = useAppSelector(
        getCustomerAddresses(integrationId)
    )

    if (!integration || !props.isOpen) {
        return null
    }

    return (
        <OrderModal
            {...props}
            integration={integration as BigCommerceIntegration}
            customerId={customerId}
            availableAddresses={availableAddresses}
        />
    )
}
