import React, {
    ChangeEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

import { shortcutManager } from '@repo/utils'
import classnames from 'classnames'
import { Row } from 'reactstrap'

import { LegacyButton as Button, Label, Tooltip } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { OptionSelection } from 'models/integration/resources/bigcommerce'
import {
    AddressType,
    BigCommerceActionType,
    BigCommerceCartLineItem,
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
    IntegrationType,
    ProductModifiersChangedError,
} from 'models/integration/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { InfobarModalProps } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import Loader from 'pages/common/components/Loader/Loader'
import Modal from 'pages/common/components/modal/Modal'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'
import CheckBox from 'pages/common/forms/CheckBox'
import { CustomerContext } from 'providers/infobar/CustomerContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getCustomerAddresses } from 'state/infobarActions/bigcommerce/createOrder/selectors'
import { getIntegrationsByType } from 'state/integrations/selectors'

import { AddressesDropdown } from './AddressesDropdown'
import useAddModifiersPopover from './components/modifiers-popover/useAddModifiersPopover'
import { modifierValuesToOptionSelections } from './components/modifiers-popover/utils'
import OrderTable from './components/order-table/OrderTable'
import { CurrencyPickerDropdown } from './CurrencyPickerDropdown'
import GeneralErrorPopupModal from './GeneralErrorPopupModal'
import {
    initializeCart,
    useCheckout,
    useValidationStatus,
} from './OrderModalHelper'
import OrderTotals from './OrderTotals'
import { ProductSearch } from './ProductSearch'
import {
    addCustomLineItem,
    addLineItem,
    bigcommerceCreateOrderFromCheckoutCart,
    getAvailableLineItems,
    onCancel,
    onReset,
    processAvailableAddresses,
    removeRow,
    setLineItemDiscount,
    updateLineItemModifiers,
    updateRow,
} from './utils'

import css from './OrderModal.less'

type Props = {
    integration: BigCommerceIntegration
    customerId?: Maybe<number>
    availableAddresses: BigCommerceCustomerAddress[]
} & ConnectedProps

export function OrderModal({
    integration,
    customerId,
    availableAddresses,
    data = { actionName: null, customer: null, order: null },
    onClose,
}: Props) {
    const dispatch = useAppDispatch()

    const storeHasMultipleCurrencies = integration.meta.available_currencies
        ? integration.meta.available_currencies.length > 1
        : false
    const [currency, setCurrency] = useState(
        storeHasMultipleCurrencies ? '' : integration.meta.currency,
    )
    const [isLoading, setIsLoading] = useState(false)
    const [isDraftOrder, setIsDraftOrder] = useState(true)

    const [products, setProducts] = useState<BigCommerceProductsListType>(
        new Map(),
    )
    const [customAddresses, setCustomAddresses] = useState<
        Array<BigCommerceCustomerAddress>
    >([])

    const {
        cart,
        setCart,
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
    } = useCheckout({
        integrationId: integration.id,
        availableAddresses: availableAddresses,
        customAddresses,
        setCustomAddresses,
    })

    processAvailableAddresses(
        availableAddresses,
        customAddresses,
        billingAddress,
        shippingAddress,
    )

    const isEditionDisabled =
        data.actionName === BigCommerceActionType.DuplicateOrder ? !cart : false

    const actionName = data.actionName || BigCommerceActionType.CreateOrder

    const { validationStatus, performValidations } = useValidationStatus({
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
        ? getAvailableLineItems([
              ...cart.line_items.physical_items,
              ...cart.line_items.digital_items,
              ...cart.line_items.custom_items,
          ])
        : []

    const hasItemsInCart = Boolean(lineItems.length)

    const handleReset = useCallback(() => {
        onReset({
            actionName,
            setCart,
            setProducts,
            setComment,
            setNote,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setCart])

    const handleCancel = (via: string, deleteCart = true) => {
        onClose()
        if (deleteCart) {
            onCancel({
                actionName,
                integrationId: integration.id,
                via,
                cart,
                setCart,
            })
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

        if (data.actionName) {
            const eventName =
                data.actionName === BigCommerceActionType.CreateOrder
                    ? SegmentEvent.BigCommerceCreateOrderSubmitCreate
                    : SegmentEvent.BigCommerceDuplicateOrderSubmitDuplicate
            logEvent(eventName, {
                cartTotal: checkout?.cart.base_amount,
                isFullDiscount:
                    checkout?.cart.base_amount !== 0 &&
                    checkout?.grand_total === 0,
            })
            void bigcommerceCreateOrderFromCheckoutCart(
                data.actionName,
                dispatch,
                integration,
                customerId?.toString(),
                cart,
                note,
                comment,
                isDraftOrder,
            )
        }

        handleCancel('create-order', false)
    }

    useEffect(() => {
        async function createCart() {
            try {
                await initializeCart({
                    actionName,
                    customer: data.customer,
                    order: data.order,
                    currency,
                    integration,
                    customerId,
                    setCart,
                    cart,
                    setIsLoading,
                    setCurrency,
                    setCheckout,
                    setBillingAddress,
                    setShippingAddress,
                    setComment,
                    setNote,
                    setProducts,
                    setModalErrors,
                    setHasDifferentShippingAddress,
                })
            } catch (error) {
                // Error Handling
                setModalErrors(
                    'global',
                    error instanceof BigCommerceGeneralError
                        ? error.message
                        : BigCommerceGeneralErrorMessage.defaultError,
                )
            } finally {
                setIsLoading(false)
            }
        }

        createCart().catch(console.error)

        shortcutManager.pause()

        return () => {
            if (data.actionName === BigCommerceActionType.CreateOrder) {
                // We already initialized products, addresses, notes for DuplicateOrder
                handleReset()
            }
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
                void onSelectAddress(
                    billingAddress,
                    'billing',
                    data?.customer?.email,
                )
            }
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [hasDifferentShippingAddress],
    )

    const handleAddCustomProduct = (customProduct: BigCommerceCustomProduct) =>
        void addCustomLineItem({
            actionName,
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
        const { product, variant, optionSelections } = props

        return addLineItem({
            actionName,
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
        async ({ product, variant, modifierValues }) => {
            const optionSelections =
                modifierValuesToOptionSelections(modifierValues)

            try {
                await handleAddRow({ product, variant, optionSelections })
            } catch (error) {
                if (error instanceof ProductModifiersChangedError) {
                    maybeOpenModifierPopover({
                        product: error.product,
                        variant,
                        modifierValues,
                    })
                }
            }
        },
    )

    const [discounts, setDiscounts] = useState<Map<string, number>>(new Map())

    return (
        <>
            <Modal
                isOpen
                isScrollable
                isClosable={false}
                onClose={() => handleCancel('header')}
                size="medium"
            >
                <ModalHeader
                    title={
                        data.actionName === BigCommerceActionType.CreateOrder
                            ? 'Create order'
                            : 'Duplicate order'
                    }
                    forceCloseButton
                />
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
                                        caption="Generate one-time cart URL valid for up to 30 days."
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
                                                        key,
                                                    )
                                                }}
                                            >
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            errors.modal.get(
                                                                key,
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
                                    isDisabled={isEditionDisabled}
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
                                        css.hasError,
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
                                        action: 'add' | 'remove',
                                    ) =>
                                        await setLineItemDiscount({
                                            actionName,
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
                                            actionName,
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
                                        discounts: discounts,
                                        setDiscounts: setDiscounts,
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
                                            discounts,
                                            setDiscounts,
                                        })
                                    }
                                    onLineItemDelete={(index) => {
                                        void removeRow({
                                            actionName,
                                            integrationId: integration.id,
                                            index,
                                            setIsLoading,
                                            cart,
                                            setCart,
                                            setModalErrors,
                                        })
                                    }}
                                    discounts={discounts}
                                    setDiscounts={setDiscounts}
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
                                actionName={actionName}
                            />
                        )}
                        <div>
                            <p className={css.modalSection}>Address</p>
                            <AddressesDropdown
                                selectedAddress={billingAddress}
                                availableAddresses={
                                    new Array<BigCommerceCustomerAddress>(
                                        ...availableAddresses,
                                        ...customAddresses,
                                    )
                                }
                                onSelectAddress={onSelectAddress}
                                addressType="billing"
                                currencyCode={currency}
                                customerEmail={data?.customer?.email}
                                hasError={
                                    !validationStatus.billingAddress ||
                                    !!errors.component.get(
                                        'onSelectBillingAddress',
                                    )
                                }
                                errorMessage={
                                    errors.component.get(
                                        'onSelectBillingAddress',
                                    ) || ''
                                }
                                isDisabled={!currency || isEditionDisabled}
                                integrationId={integration.id}
                                customerId={data?.customer?.id}
                            />
                            <CheckBox
                                isChecked={!hasDifferentShippingAddress}
                                className="mt-3 mb-3"
                                onChange={() => {
                                    if (!isTotalPriceLoading) {
                                        setHasDifferentShippingAddress(
                                            !hasDifferentShippingAddress,
                                        )
                                    }
                                }}
                                isDisabled={isEditionDisabled}
                            >
                                Shipping address is same as billing address
                            </CheckBox>
                            {hasDifferentShippingAddress && (
                                <AddressesDropdown
                                    selectedAddress={shippingAddress}
                                    availableAddresses={
                                        new Array<BigCommerceCustomerAddress>(
                                            ...availableAddresses,
                                            ...customAddresses,
                                        )
                                    }
                                    onSelectAddress={onSelectAddress}
                                    addressType="shipping"
                                    currencyCode={currency}
                                    customerEmail={data?.customer?.email}
                                    hasError={
                                        !validationStatus.shippingAddress ||
                                        !!errors.component.get(
                                            'onSelectShippingAddress',
                                        )
                                    }
                                    errorMessage={
                                        errors.component.get(
                                            'onSelectShippingAddress',
                                        ) || ''
                                    }
                                    isDisabled={!currency || isEditionDisabled}
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
                                readOnly={isEditionDisabled}
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
                                readOnly={isEditionDisabled}
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
        order: Map<string, any> | null
    }
} & Pick<InfobarModalProps, 'isOpen' | 'onClose'>

export default function OrderModalRenderWrapper(props: ConnectedProps) {
    const { integrationId } = useContext(IntegrationContext)
    const { customerId } = useContext(CustomerContext)

    const integrations = useAppSelector(
        getIntegrationsByType(IntegrationType.BigCommerce),
    )

    const integration = useMemo(
        () =>
            integrations.find(
                (integration) => integration.id === integrationId,
            ),
        [integrations, integrationId],
    )

    const availableAddresses: BigCommerceCustomerAddress[] = useAppSelector(
        getCustomerAddresses(integrationId),
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
