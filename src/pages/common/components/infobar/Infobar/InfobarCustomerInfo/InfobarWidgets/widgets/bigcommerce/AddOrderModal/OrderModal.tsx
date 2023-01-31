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
import shortcutManager from 'services/shortcutManager/shortcutManager'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'

import {InfobarModalProps} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'

import Label from 'pages/common/forms/Label/Label'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {
    BigCommerceActionType,
    BigCommerceCart,
    BigCommerceCartLineItem,
    BigCommerceCheckout,
    BigCommerceCreateOrderErrorType,
    BigCommerceCustomCartLineItem,
    BigCommerceCustomer,
    BigCommerceCustomerAddress,
    BigCommerceCustomProduct,
    BigCommerceIntegration,
    BigCommerceProduct,
    BigCommerceProductsListType,
    BigCommerceProductVariant,
    CreateOrderValidationResult,
    IntegrationType,
} from 'models/integration/types'
import {getIntegrationsByType} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import {getCustomerAddresses} from 'state/infobarActions/bigcommerce/createOrder/selectors'
import Tip from 'pages/common/components/tip/Tip'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import useAppDispatch from 'hooks/useAppDispatch'
import {CustomerContext} from 'providers/infobar/CustomerContext'
import {
    deleteBigCommerceCoupon,
    updateBigCommerceCheckoutDiscount,
    updateBigCommerceCoupon,
} from 'models/integration/resources/bigcommerce'
import Tooltip from 'pages/common/components/Tooltip'
import OrderTable from './components/order-table/OrderTable'
import OrderTotals from './OrderTotals'
import {
    addCheckoutBillingAddress,
    addRow,
    bigcommerceCreateOrder,
    checkCheckoutValidity,
    checkProductsValidity,
    checkShippingAddressValidity,
    onCancel,
    onInit,
    onReset,
    removeRow,
    setLineItemDiscount,
    updateCheckoutConsignmentShippingMethod,
    updateRow,
    upsertCheckoutConsignment,
    useCanViewBigCommerceV1Features,
} from './utils'
import {ShippingAddressesDropdown} from './ShippingAddressesDropdown'
import {CurrencyPickerDropdown} from './CurrencyPickerDropdown'

import css from './OrderModal.less'
import {ProductSearch} from './ProductSearch'
import {useModifiersPopover} from './components/modifiers-popover/hooks'

type Props = {
    integration: BigCommerceIntegration
    customerId?: Maybe<number>
    shippingAddresses: BigCommerceCustomerAddress[]
} & ConnectedProps

const useValidationStatus = ({
    products,
    shippingAddress,
    checkout,
    cart,
}: {
    products: Maybe<BigCommerceProductsListType>
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
                shippingAddress: checkShippingAddressValidity(shippingAddress),
                checkout: checkCheckoutValidity({checkout, cart}),
            }

            setValidationStatus(validationResult)

            return validationResult
        },
        [cart, checkout, onSubmitValidationDone, products, shippingAddress]
    )

    // performValidations will change identity every time `checkout`, `product` or `shippingAddress` is updated
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

export const useCheckout = ({integrationId}: {integrationId: number}) => {
    const [shippingAddress, setShippingAddress] =
        useState<Maybe<BigCommerceCustomerAddress>>(null)
    const [cart, setCart] = useState<Maybe<BigCommerceCart>>(null)
    const [checkout, setCheckout] = useState<Maybe<BigCommerceCheckout>>(null)
    const [isTotalPriceLoading, setIsTotalPriceLoading] = useState(false)
    const consignment = checkout?.consignments[0] ?? null

    const updateConsignment = async ({
        cart,
        address,
    }: {
        cart: BigCommerceCart
        address: BigCommerceCustomerAddress
    }) => {
        try {
            setIsTotalPriceLoading(true)
            const checkout = await upsertCheckoutConsignment({
                integrationId,
                cart,
                shippingAddress: address,
                consignmentId: consignment?.id,
            })

            if (!checkout) {
                return
            }

            setCheckout(checkout)
        } catch (error) {
            console.error(error)
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
            void updateConsignment({cart: newCart, address: shippingAddress})
        }
    }

    const onSelectAddress = async (
        newSelectedAddress: BigCommerceCustomerAddress
    ) => {
        setShippingAddress(newSelectedAddress)

        if (cart) {
            setIsTotalPriceLoading(true)
            const checkout = await addCheckoutBillingAddress({
                integrationId,
                selectedAddress: newSelectedAddress,
                cart,
            })

            void updateConsignment({
                cart: checkout.cart,
                address: newSelectedAddress,
            })

            setCheckout(checkout)
            setIsTotalPriceLoading(false)
        }
    }

    const onUpdateConsignmentShippingMethod = async (
        selectedShippingMethodId: Maybe<string>
    ) => {
        if (!cart || !consignment || !selectedShippingMethodId) {
            return
        }

        try {
            setIsTotalPriceLoading(true)
            const checkout = await updateCheckoutConsignmentShippingMethod({
                cart,
                shippingMethodId: selectedShippingMethodId,
                consignmentId: consignment.id,
                integrationId,
            })

            setCheckout(checkout)
        } catch (error) {
            console.error(error)
        } finally {
            setIsTotalPriceLoading(false)
        }
    }

    const onUpdateDiscountAmount = async (discountAmount: number) => {
        if (!cart) {
            return
        }

        try {
            setIsTotalPriceLoading(true)
            const checkout = await updateBigCommerceCheckoutDiscount({
                integrationId,
                checkoutId: cart.id,
                discountAmount,
            })

            setCheckout(checkout)
        } catch (error) {
            console.error(error)
        } finally {
            setIsTotalPriceLoading(false)
        }
    }

    const onUpdateCoupon = async (couponCode: string) => {
        if (!cart) {
            return
        }

        try {
            setIsTotalPriceLoading(true)

            const checkout = await updateBigCommerceCoupon({
                integrationId,
                checkoutId: cart.id,
                couponCode: couponCode,
            })

            setCheckout(checkout)
        } catch (error) {
            console.error(error)
            // rethrowing it for callback consumer
            throw error
        } finally {
            setIsTotalPriceLoading(false)
        }
    }

    const onRemoveCoupon = async () => {
        if (!checkout || !checkout.coupons[0]) {
            return
        }

        try {
            setIsTotalPriceLoading(true)

            const newCheckout = await deleteBigCommerceCoupon({
                integrationId,
                checkoutId: checkout.id,
                couponCode: checkout.coupons[0].code,
            })

            setCheckout(newCheckout)
        } catch (error) {
            console.error(error)
            // rethrowing it for callback consumer
            throw error
        } finally {
            setIsTotalPriceLoading(false)
        }
    }

    const totals = useMemo(
        () => getTotals({checkout, cart: checkout?.cart ?? cart}),
        [cart, checkout]
    )

    return {
        cart: checkout ? checkout.cart : cart,
        checkout,
        consignment,
        totals,
        shippingAddress,
        isTotalPriceLoading,
        setCart: setCartExposed,
        onSelectAddress,
        onUpdateConsignmentShippingMethod,
        onUpdateDiscountAmount,
        onUpdateCoupon,
        onRemoveCoupon,
    }
}

export function OrderModal({
    integration,
    customerId,
    shippingAddresses,
    data = {actionName: null, customer: null},
    onClose,
}: Props) {
    const dispatch = useAppDispatch()

    const canViewBigCommerceV1Features = useCanViewBigCommerceV1Features()

    const storeHasMultipleCurrencies = integration.meta.available_currencies
        ? integration.meta.available_currencies.length > 1
        : false
    const [currency, setCurrency] = useState(
        storeHasMultipleCurrencies && canViewBigCommerceV1Features
            ? ''
            : integration.meta.currency
    )
    const [isLoading, setIsLoading] = useState(false)
    const [lineItemWithError, setLineItemWithError] =
        useState<BigCommerceCreateOrderErrorType>({
            id: '',
            message: '',
            type: 'error',
        })

    const [products, setProducts] = useState<BigCommerceProductsListType>(
        new Map()
    )

    const {
        cart,
        checkout,
        consignment,
        totals,
        shippingAddress,
        isTotalPriceLoading,
        setCart,
        onSelectAddress,
        onUpdateConsignmentShippingMethod,
        onUpdateDiscountAmount,
        onUpdateCoupon,
        onRemoveCoupon,
    } = useCheckout({
        integrationId: integration.id,
    })

    const {validationStatus, performValidations} = useValidationStatus({
        products,
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

        bigcommerceCreateOrder(
            dispatch,
            integration,
            customerId?.toString(),
            cart,
            note,
            comment
        )

        handleCancel('create-order', false)
    }

    useEffect(() => {
        if (data.customer && currency) {
            void onInit({
                customer: data.customer,
                integrationId: integration.id,
                currency,
                setIsLoading,
                setCart,
            })
        }
        shortcutManager.pause()

        return () => {
            handleReset()
            shortcutManager.unpause()
        }
        // Single run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currency])

    const handleAddRow = (
        props:
            | {
                  product: BigCommerceProduct
                  variant: BigCommerceProductVariant
                  optionSelections?: {option_id: number; option_value: number}[]
              }
            | {
                  customProduct: BigCommerceCustomProduct
              }
    ) => {
        if ('customProduct' in props) {
            return void addRow({
                integrationId: integration.id,
                customProduct: props.customProduct,
                products,
                cart,
                setIsLoading,
                setCart,
                setProducts,
                setLineItemWithError,
            })
        }

        const {product, variant, optionSelections} = props

        return void addRow({
            integrationId: integration.id,
            lineProduct: product,
            variant,
            optionSelections,
            products,
            cart,
            setIsLoading,
            setCart,
            setProducts,
            setLineItemWithError,
        })
    }

    const {
        getReferenceProps,
        setReference,
        modifiersPopover,
        maybeOpenModifierPopover,
    } = useModifiersPopover(
        integration.meta.store_hash,
        ({product, variant, modifierValues}) => {
            const optionSelections = Object.entries(modifierValues)
                .filter(([, option_value]) => Boolean(option_value))
                .map(([option_id, option_value]) => ({
                    option_id: parseInt(option_id),
                    option_value: option_value!,
                }))

            handleAddRow({product, variant, optionSelections})
        }
    )

    return (
        <Modal
            isOpen
            isScrollable
            isClosable={false}
            onClose={() => handleCancel('header')}
            size="medium"
        >
            <ModalHeader title="Create order" forceCloseButton />
            <div
                className={css.scrollable}
                ref={setReference}
                {...getReferenceProps()}
            >
                <div className={css.formBody}>
                    <div className={css.alerts}>
                        <Tip
                            actionLabel="✕"
                            icon={true}
                            storageKey="infobar-bigcommerce-create-order-tip"
                            className={css.tip}
                        >
                            <span>
                                Create an order with status{' '}
                                <strong>Paid</strong> and{' '}
                                <strong>Awaiting Fulfillment</strong>.
                            </span>
                        </Tip>
                        {!!lineItemWithError.message && (
                            <Alert
                                type={
                                    lineItemWithError.type === 'warning'
                                        ? AlertType.Warning
                                        : AlertType.Error
                                }
                                icon={true}
                            >
                                {lineItemWithError.message}
                            </Alert>
                        )}
                    </div>
                    <div className={css.currencyDropdown}>
                        {canViewBigCommerceV1Features &&
                            storeHasMultipleCurrencies && (
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
                        {canViewBigCommerceV1Features && !currency && (
                            <Tooltip target="product-search-input-tooltip">
                                Set currency to select products.
                            </Tooltip>
                        )}
                        <ProductSearch
                            currency={currency}
                            validationStatus={validationStatus}
                            onAddCustomProduct={(customItem) =>
                                handleAddRow({customProduct: customItem})
                            }
                            onVariantClicked={(item, variant) => {
                                if (
                                    maybeOpenModifierPopover({
                                        product: item.data,
                                        variant,
                                    })
                                ) {
                                    // If modifier popover opened - do not proceed further
                                    return
                                }

                                handleAddRow({product: item.data, variant})
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
                                lineItemWithError={lineItemWithError}
                                onLineItemDiscount={(index, listPrice) =>
                                    setLineItemDiscount({
                                        integrationId: integration.id,
                                        index,
                                        setIsLoading,
                                        cart,
                                        setCart,
                                        setLineItemWithError,
                                        listPrice,
                                    })
                                }
                                onLineItemUpdate={(
                                    index,
                                    newQuantity,
                                    setQuantity
                                ) => {
                                    void updateRow({
                                        integrationId: integration.id,
                                        index,
                                        newQuantity,
                                        setIsLoading,
                                        cart,
                                        setCart,
                                        setQuantity,
                                        lineItemWithError,
                                        setLineItemWithError,
                                    })
                                }}
                                onLineItemDelete={(index) => {
                                    void removeRow({
                                        integrationId: integration.id,
                                        index,
                                        setIsLoading,
                                        cart,
                                        setCart,
                                        setLineItemWithError,
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
                    <ShippingAddressesDropdown
                        shippingAddress={shippingAddress}
                        shippingAddresses={shippingAddresses}
                        onSelectAddress={onSelectAddress}
                        hasError={!validationStatus.shippingAddress}
                        isDisabled={!currency && canViewBigCommerceV1Features}
                    />
                    <p className="heading-section-semibold">Comments & Notes</p>
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
                        intent="primary"
                        tabIndex={0}
                        onClick={handleAddOrder}
                        isDisabled={
                            isTotalPriceLoading ||
                            (canViewBigCommerceV1Features && !currency)
                        }
                    >
                        Create order
                    </Button>
                    <Button
                        tabIndex={0}
                        intent="secondary"
                        onClick={() => handleCancel('footer')}
                    >
                        Cancel
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
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

    const shippingAddresses: BigCommerceCustomerAddress[] = useAppSelector(
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
            shippingAddresses={shippingAddresses}
        />
    )
}
