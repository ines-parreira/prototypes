import React, {
    ChangeEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import classnames from 'classnames'

import shortcutManager from 'services/shortcutManager/shortcutManager'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'

import {InfobarModalProps} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'

import {
    BigCommerceActionType,
    BigCommerceCustomerAddress,
    Cart,
    Checkout,
    Customer,
    Product,
    Variant,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ProductSearchInput from 'pages/common/forms/ProductSearchInput/ProductSearchInput'
import {bigcommerceDataMappers} from 'pages/common/forms/ProductSearchInput/Mappings'
import {
    BigCommerceIntegration,
    IntegrationDataItem,
    IntegrationType,
} from 'models/integration/types'
import {getIntegrationsByType} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import {getCustomerAddresses} from 'state/infobarActions/bigcommerce/createOrder/selectors'
import Tip from 'pages/common/components/tip/Tip'
import OrderTable from './OrderTable'
import OrderTotals from './OrderTotals'
import {addRow, onCancel, onInit, onReset, removeRow, updateRow} from './utils'

import css from './OrderModal.less'
import {ShippingAddressesDropdown} from './ShippingAddressesDropdown'

type Props = {
    integrationId: number
} & ConnectedProps

export function OrderModal({
    integrationId,
    data = {actionName: null, customer: null},
    onClose,
}: Props) {
    const shippingAddresses: BigCommerceCustomerAddress[] = useAppSelector(
        getCustomerAddresses(integrationId)
    )

    const integrations = useAppSelector(
        getIntegrationsByType(IntegrationType.BigCommerce)
    )

    const [isLoading, setIsLoading] = useState(false)

    const [cart, setCart] = useState<Maybe<Cart>>(null)
    const [, setCheckout] = useState<Maybe<Checkout>>(null)
    const [products, setProducts] = useState<Map<number, Product>>(new Map())
    const [shippingAddress, setShippingAddress] =
        useState<Maybe<BigCommerceCustomerAddress>>(null)
    const [note, setNote] = useState('')
    const [comment, setComment] = useState('')

    const onUpdateNote = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setNote(event.currentTarget.value)
    }

    const onUpdateComment = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setComment(event.currentTarget.value)
    }

    const currentIntegration = useMemo(
        () =>
            integrations.find(
                (integration) => integration.id === integrationId
            ) as BigCommerceIntegration,
        [integrations, integrationId]
    )

    const lineItems = cart
        ? cart.line_items.physical_items.concat(cart.line_items.digital_items)
        : []

    const handleReset = useCallback(() => {
        onReset({setCart, setProducts, setComment, setNote, setShippingAddress})
    }, [])

    const handleCancel = useCallback(
        (via: string) => () => {
            onClose()
            onCancel({integrationId, via, cart, setCart})
            handleReset()
        },
        [cart, handleReset, integrationId, onClose]
    )

    useEffect(() => {
        if (data.customer) {
            void onInit({
                customer: data.customer,
                integrationId,
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
            isScrollable={true}
            isClosable={false}
            onClose={handleCancel('header')}
            size="medium"
        >
            <ModalHeader title="Add order" />
            <div className={css.scrollable}>
                <div className={css.formBody}>
                    <Tip
                        actionLabel="X"
                        icon={true}
                        storageKey="infobar-bigcommerce-create-order-tip"
                    >
                        <span>
                            Add an order with status <strong>Paid</strong> and{' '}
                            <strong>Awaiting Fulfillment</strong>.
                        </span>
                    </Tip>
                    <div>
                        <p
                            className={classnames(
                                css.paddedVertical,
                                css.subsection,
                                css.inline
                            )}
                        >
                            Products
                        </p>
                    </div>
                    <div className={css.relative}>
                        <ProductSearchInput
                            className={css.searchInput}
                            dataMappers={bigcommerceDataMappers}
                            onVariantClicked={(
                                item: IntegrationDataItem<Product>,
                                variant: Variant
                            ) => {
                                if (integrationId) {
                                    void addRow({
                                        integrationId,
                                        product: item.data,
                                        variant,
                                        setIsLoading,
                                        cart,
                                        setCart,
                                        products,
                                        setProducts,
                                    })
                                }
                            }}
                        />
                        {!lineItems.length && (
                            <p className={css.searchbarInfo}>
                                This order is currently empty. Add products
                                using the search above.
                            </p>
                        )}
                        {currentIntegration &&
                            currentIntegration.meta &&
                            !!lineItems.length && (
                                <OrderTable
                                    storeHash={
                                        currentIntegration.meta.store_hash
                                    }
                                    currencyCode={
                                        currentIntegration.meta.currency
                                    }
                                    lineItems={lineItems}
                                    products={products}
                                    onLineItemUpdate={(
                                        index: number,
                                        newQuantity: number,
                                        setQuantity: (quantity: number) => void
                                    ) => {
                                        if (integrationId) {
                                            void updateRow({
                                                integrationId,
                                                index,
                                                newQuantity,
                                                setIsLoading,
                                                cart,
                                                setCart,
                                                setQuantity,
                                            })
                                        }
                                    }}
                                    onLineItemDelete={(index: number) => {
                                        if (integrationId) {
                                            void removeRow({
                                                integrationId,
                                                index,
                                                setIsLoading,
                                                cart,
                                                setCart,
                                            })
                                        }
                                    }}
                                />
                            )}
                        {isLoading && (
                            <div className={css.loader}>
                                <Loader minHeight={'50px'} />
                            </div>
                        )}
                    </div>
                    {!!lineItems.length && (
                        <OrderTotals
                            integration={currentIntegration}
                            cart={cart}
                            shippingAddress={shippingAddress}
                        />
                    )}
                    <ShippingAddressesDropdown
                        shippingAddress={shippingAddress}
                        setShippingAddress={setShippingAddress}
                        shippingAddresses={shippingAddresses}
                        cart={cart}
                        setCheckout={setCheckout}
                    />
                    <p className={css.subsection}>Comments & Notes</p>
                    <div>
                        <h5 className={css.subsectionSmall}>Comment</h5>
                        <textarea
                            rows={1}
                            className="form-control"
                            placeholder="Add comment..."
                            value={comment}
                            onChange={onUpdateComment}
                        />
                        <p className={css.infoText}>Visible to customer</p>
                    </div>
                    <div>
                        <h5 className={css.subsectionSmall}>Staff note</h5>
                        <textarea
                            rows={1}
                            className={classnames('form-control')}
                            placeholder="Add note..."
                            value={note}
                            onChange={onUpdateNote}
                        />
                        <p className={css.infoText}>Not visible to customer</p>
                    </div>
                </div>
            </div>
            <ModalFooter className={css.wrapper}>
                <div className={css.actions}>
                    <Button intent="primary" tabIndex={0}>
                        Add order
                    </Button>
                    <Button
                        tabIndex={0}
                        intent="secondary"
                        onClick={handleCancel('footer')}
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
        customer: Customer | null
    }
} & Pick<InfobarModalProps, 'isOpen' | 'onClose'>

export default function OrderModalConnected(props: ConnectedProps) {
    const {integrationId} = useContext(IntegrationContext)

    if (!integrationId || !props.isOpen) {
        return null
    }

    return <OrderModal integrationId={integrationId} {...props} />
}
