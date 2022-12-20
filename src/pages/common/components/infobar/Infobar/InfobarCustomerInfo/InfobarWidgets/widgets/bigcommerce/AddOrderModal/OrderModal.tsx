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
import ProductSearchInput from 'pages/common/forms/ProductSearchInput/ProductSearchInput'
import {bigcommerceDataMappers} from 'pages/common/forms/ProductSearchInput/Mappings'
import {
    BigCommerceIntegration,
    BigCommerceCart,
    IntegrationDataItem,
    IntegrationType,
    BigCommerceCustomerAddress,
    BigCommerceProductVariant,
    BigCommerceProduct,
    BigCommerceCheckout,
    BigCommerceCustomer,
    BigCommerceActionType,
    CreateOrderValidationResult,
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
import OrderTable from './OrderTable'
import OrderTotals from './OrderTotals'
import {
    checkShippingAddressValidity,
    checkCheckoutValidity,
    addCheckoutBillingAddress,
    addRow,
    onCancel,
    onInit,
    onReset,
    removeRow,
    updateCheckoutConsignmentShippingMethod,
    updateRow,
    upsertCheckoutConsignment,
    bigcommerceCreateOrder,
    checkProductsValidity,
} from './utils'

import css from './OrderModal.less'
import {ShippingAddressesDropdown} from './ShippingAddressesDropdown'

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
    products: Maybe<Map<number, BigCommerceProduct>>
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

export const useCheckout = ({integrationId}: {integrationId: number}) => {
    const [shippingAddress, setShippingAddress] =
        useState<Maybe<BigCommerceCustomerAddress>>(null)
    const [cart, setCart] = useState<Maybe<BigCommerceCart>>(null)
    const [checkout, setCheckout] = useState<Maybe<BigCommerceCheckout>>(null)
    const consignment = checkout?.consignments[0] ?? null

    const updateConsignment = async ({
        cart,
        address,
    }: {
        cart: BigCommerceCart
        address: BigCommerceCustomerAddress
    }) => {
        try {
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
        }
    }

    const onUpdateConsignmentShippingMethod = async (
        selectedShippingMethodId: Maybe<string>
    ) => {
        if (!cart || !consignment || !selectedShippingMethodId) {
            return
        }

        try {
            const checkout = await updateCheckoutConsignmentShippingMethod({
                cart,
                shippingMethodId: selectedShippingMethodId,
                consignmentId: consignment.id,
                integrationId,
            })

            setCheckout(checkout)
        } catch (error) {
            console.error(error)
        }
    }

    const totals = useMemo(() => {
        if (checkout) {
            return {
                subTotal: checkout.subtotal_ex_tax ?? 0,
                shipping: checkout.shipping_cost_total_ex_tax ?? 0,
                taxes: checkout.tax_total ?? 0,
                total: checkout.grand_total,
            }
        }

        if (cart) {
            const subTotal = cart.base_amount ?? 0
            const total = cart.cart_amount ?? 0

            const taxes = total - subTotal

            return {
                subTotal,
                shipping: 0,
                taxes,
                total,
            }
        }

        return {
            subTotal: 0,
            shipping: 0,
            taxes: 0,
            total: 0,
        }
    }, [cart, checkout])

    return {
        cart: checkout ? checkout.cart : cart,
        checkout,
        consignment,
        totals,
        shippingAddress,
        setCart: setCartExposed,
        onSelectAddress,
        onUpdateConsignmentShippingMethod,
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

    const [isLoading, setIsLoading] = useState(false)
    const [lineItemWithErrorId, setLineItemWithErrorId] = useState('')

    const [products, setProducts] = useState<Map<number, BigCommerceProduct>>(
        new Map()
    )

    const {
        cart,
        checkout,
        consignment,
        totals,
        shippingAddress,
        setCart,
        onSelectAddress,
        onUpdateConsignmentShippingMethod,
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

    const lineItems = cart
        ? cart.line_items.physical_items.concat(cart.line_items.digital_items)
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
        if (data.customer) {
            void onInit({
                customer: data.customer,
                integrationId: integration.id,
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
    }, [])

    return (
        <Modal
            isOpen
            isScrollable
            isClosable
            onClose={() => handleCancel('header')}
            size="medium"
        >
            <ModalHeader title="Add order" />
            <div className={css.scrollable}>
                <div className={css.formBody}>
                    <div className={css.alerts}>
                        <Tip
                            actionLabel="X"
                            icon={true}
                            storageKey="infobar-bigcommerce-create-order-tip"
                            className={css.tip}
                        >
                            <span>
                                Add an order with status <strong>Paid</strong>{' '}
                                and <strong>Awaiting Fulfillment</strong>.
                            </span>
                        </Tip>
                        {!!lineItemWithErrorId && (
                            <Alert type={AlertType.Error} icon={true}>
                                Insufficient inventory. Please adjust product
                                quantity.
                            </Alert>
                        )}
                    </div>
                    <div>
                        <p className="heading-section-semibold">Products</p>
                    </div>
                    <div className={css.relative}>
                        <ProductSearchInput
                            className={css.searchInput}
                            hasError={!validationStatus.products}
                            dataMappers={bigcommerceDataMappers}
                            onVariantClicked={(
                                item: IntegrationDataItem<BigCommerceProduct>,
                                variant: BigCommerceProductVariant
                            ) => {
                                void addRow({
                                    integrationId: integration.id,
                                    product: item.data,
                                    variant,
                                    setIsLoading,
                                    cart,
                                    setCart,
                                    products,
                                    setProducts,
                                    setLineItemWithErrorId,
                                })
                            }}
                        />
                        {!hasItemsInCart && (
                            <p
                                className={classnames(css.searchbarInfo, {
                                    [css.hasError]: !validationStatus.products,
                                })}
                            >
                                This order is currently empty. Add products
                                using the search above.
                            </p>
                        )}
                        {integration.meta && hasItemsInCart && (
                            <OrderTable
                                storeHash={integration.meta.store_hash}
                                currencyCode={integration.meta.currency}
                                lineItems={lineItems}
                                products={products}
                                lineItemWithErrorId={lineItemWithErrorId}
                                onLineItemUpdate={(
                                    index: number,
                                    newQuantity: number,
                                    setQuantity: (quantity: number) => void
                                ) => {
                                    void updateRow({
                                        integrationId: integration.id,
                                        index,
                                        newQuantity,
                                        setIsLoading,
                                        cart,
                                        setCart,
                                        setQuantity,
                                        setLineItemWithErrorId,
                                    })
                                }}
                                onLineItemDelete={(index: number) => {
                                    void removeRow({
                                        integrationId: integration.id,
                                        index,
                                        setIsLoading,
                                        cart,
                                        setCart,
                                        setLineItemWithErrorId,
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
                    {hasItemsInCart && (
                        <OrderTotals
                            integration={integration}
                            cart={cart}
                            consignment={consignment}
                            totals={totals}
                            hasShippingAddress={Boolean(shippingAddress)}
                            onUpdateConsignmentShippingMethod={
                                onUpdateConsignmentShippingMethod
                            }
                            hasError={!validationStatus.checkout}
                        />
                    )}
                    <ShippingAddressesDropdown
                        shippingAddress={shippingAddress}
                        shippingAddresses={shippingAddresses}
                        onSelectAddress={onSelectAddress}
                        hasError={!validationStatus.shippingAddress}
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
            </div>
            <ModalFooter className={css.wrapper}>
                <div className={css.actions}>
                    <Button
                        intent="primary"
                        tabIndex={0}
                        onClick={handleAddOrder}
                    >
                        Add order
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
