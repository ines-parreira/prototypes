import React, {useCallback, useContext, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Button, ModalFooter} from 'reactstrap'
import {fromJS, List, Map} from 'immutable'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {useUpdateEffect, usePrevious} from 'react-use'

import {CustomerContext} from 'providers/infobar/CustomerContext'

import {WidgetContext} from 'providers/infobar/WidgetContext'
import {Product, Variant} from 'constants/integrations/types/shopify'
import {getCreateOrderState} from 'state/infobarActions/shopify/createOrder/selectors'
import {
    addCustomRow,
    addRow,
    onCancel,
    onCreateDraftOrder,
    onEmailInvoice,
    onInit,
    onLineItemChange,
    onReset,
} from 'state/infobarActions/shopify/createOrder/actions'
import shortcutManager from 'services/shortcutManager/shortcutManager'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {RootState} from 'state/types'
import {IntegrationType, IntegrationDataItem} from 'models/integration/types'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import ProductSearchInput from 'pages/common/forms/ProductSearchInput/ProductSearchInput'
import {DatetimeLabel} from 'pages/common/utils/labels'
import Loader from 'pages/common/components/Loader/Loader'
import DEPRECATED_Modal from 'pages/common/components/DEPRECATED_Modal'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {InfobarModalProps} from '../../../types'
import {ShopifyActionType} from '../../types'

import AddCustomItemPopover from './AddCustomItemPopover/AddCustomItemPopover'
import EmailInvoicePopover from './EmailInvoicePopover/EmailInvoicePopover'
import DraftOrderFooter from './OrderFooter/OrderFooter'
import DraftOrderTable from './DraftOrderTable/DraftOrderTable'
import css from './DraftOrderModal.less'

type OwnProps = {
    draftOrder?: Map<any, any>
    data?: {
        actionName: ShopifyActionType | null
        order?: Map<any, any> | null
        customer?: Map<any, any>
    }
    defaultCurrency?: string
}

export function DraftOrderModalContainer({
    addCustomRow,
    addRow,
    defaultCurrency = 'USD',
    draftOrder = fromJS({}),
    data = {actionName: null, order: null},
    header,
    integrations,
    isOpen,
    loading,
    loadingMessage,
    payload,
    products,
    onInit,
    onClose,
    onChange,
    onCancel,
    onLineItemChange,
    onEmailInvoice,
    onCreateDraftOrder,
    onBulkChange,
    onSubmit,
    onReset,
}: Omit<InfobarModalProps, 'data'> &
    OwnProps &
    ConnectedProps<typeof connector>) {
    const {customerId} = useContext(CustomerContext)
    const {integrationId} = useContext(IntegrationContext)
    const {widget_resource_ids} = useContext(WidgetContext)

    const currentIntegration = useMemo(
        () =>
            integrations.find(
                (integration: Map<any, any>) =>
                    integration.get('id') === integrationId
            ) as Map<any, any> | null,
        [integrations, integrationId]
    )
    const hasScope = useMemo(
        () =>
            !!(
                currentIntegration?.getIn(['meta', 'oauth', 'scope']) as string
            )?.includes('write_draft_orders'),
        [currentIntegration]
    )
    const currencyCode = useMemo(
        () =>
            (currentIntegration?.getIn(['meta', 'currency']) as string) ||
            defaultCurrency,
        [currentIntegration, defaultCurrency]
    )
    const previousIsOpen = usePrevious(isOpen)
    const lineItems = useMemo(
        () => (payload?.get('line_items') || fromJS([])) as List<Map<any, any>>,
        [payload]
    )
    const isEmpty = useMemo(() => lineItems.size === 0, [lineItems])

    const handleReset = useCallback(() => {
        onReset()
        shortcutManager.unpause()
    }, [onReset])

    const handleCancel = useCallback(
        (via: string) => () => {
            onCancel(data.actionName!, integrationId!, via)
            onClose()
            handleReset()
        },
        [data.actionName, handleReset, integrationId, onCancel, onClose]
    )

    const handleInvoiceSubmit = useCallback(
        (invoicePayload: Map<any, any>) => {
            if (customerId) {
                void onEmailInvoice(
                    integrationId!,
                    customerId,
                    data.order ? data.order.get('id') : null,
                    invoicePayload,
                    () => {
                        onClose()
                        handleReset()
                    }
                )
            }
        },
        [
            customerId,
            onEmailInvoice,
            integrationId,
            data.order,
            onClose,
            handleReset,
        ]
    )
    const handlePaymentSubmit = useCallback(
        (isPending = false) =>
            async () => {
                const result = await onCreateDraftOrder(
                    integrationId!,
                    data.order ? data.order.get('id') : null
                )
                onBulkChange(
                    [
                        {
                            name: 'draft_order_id',
                            value: result?.get('id') || '',
                        },
                        {name: 'payment_pending', value: isPending},
                    ],
                    () => {
                        onSubmit()
                        handleReset()
                    }
                )
            },
        [
            onCreateDraftOrder,
            integrationId,
            data.order,
            onBulkChange,
            onSubmit,
            handleReset,
        ]
    )

    const handleLineItemUpdate = useCallback(
        (newLineItem: Map<any, any>, index: number) => {
            void onLineItemChange(integrationId!, {newLineItem, index})
        },
        [integrationId, onLineItemChange]
    )

    const handleLineItemDelete = useCallback(
        (index: number) => {
            void onLineItemChange(integrationId!, {remove: true, index})
        },
        [integrationId, onLineItemChange]
    )

    useUpdateEffect(() => {
        if (!previousIsOpen && isOpen) {
            if (hasScope) {
                void onInit(
                    integrationId!,
                    data.order,
                    data.customer!,
                    currencyCode,
                    () => {
                        onClose()
                        handleReset()
                    }
                )
            }
            shortcutManager.pause()
            if (data.order) {
                onChange('order_id', data.order.get('id'))
            }
        }
    }, [
        isOpen,
        previousIsOpen,
        data,
        hasScope,
        integrationId,
        onClose,
        currencyCode,
        onChange,
        onInit,
        handleReset,
    ])

    if (!hasScope) {
        return (
            <DEPRECATED_Modal
                header={header}
                isOpen={isOpen}
                onClose={() => {
                    onClose()
                    handleReset()
                }}
            >
                <Alert type={AlertType.Error}>
                    Missing Shopify permissions. To use this new feature, please
                    go to the{' '}
                    <Link
                        to={`/app/settings/integrations/shopify/${integrationId!}`}
                    >
                        settings page of your Shopify integration
                    </Link>{' '}
                    and click on "Update app permissions".
                </Alert>
            </DEPRECATED_Modal>
        )
    }
    return (
        <DEPRECATED_Modal
            header={header}
            isOpen={isOpen}
            onClose={handleCancel('header')}
            keyboard={false}
            size="xl"
            bodyClassName="p-0"
            backdrop="static"
        >
            <div className={css.formHeader}>
                <ProductSearchInput
                    className={css.searchInput}
                    onVariantClicked={(
                        item: IntegrationDataItem<Product>,
                        variant: Variant
                    ) => {
                        void addRow(
                            data.actionName!,
                            integrationId!,
                            item.data,
                            variant
                        )
                    }}
                    searchOnFocus={!data.order && isEmpty}
                />
                <AddCustomItemPopover
                    id="add-custom-item"
                    actionName={data.actionName!}
                    className={css.headerButton}
                    currencyCode={currencyCode}
                    onSubmit={(lineItem) => {
                        void addCustomRow(integrationId!, lineItem)
                    }}
                />
            </div>
            {payload ? (
                <div>
                    <DraftOrderTable
                        shopName={currentIntegration!.getIn([
                            'meta',
                            'shop_name',
                        ])}
                        actionName={data.actionName!}
                        isShownInEditOrder={false}
                        currencyCode={currencyCode}
                        lineItems={lineItems}
                        products={products}
                        onLineItemUpdate={handleLineItemUpdate}
                        onLineItemDelete={handleLineItemDelete}
                    />
                    <DraftOrderFooter
                        editable
                        actionName={data.actionName!}
                        currencyCode={currencyCode}
                        widgetData={{
                            target_id: widget_resource_ids.target_id,
                            customer_id:
                                widget_resource_ids.customer_id ||
                                widget_resource_ids.target_id ||
                                customerId,
                        }}
                    />
                    {draftOrder.get('status') === 'invoice_sent' ? (
                        <div className={css.emailInvoiceContainer}>
                            <h4 className="mr-auto">Invoice sent</h4>
                            <span className="mr-4">
                                Sent on{' '}
                                <DatetimeLabel
                                    dateTime={draftOrder.get('invoice_sent_at')}
                                    labelFormat="L LT"
                                    hasTooltip={false}
                                />
                            </span>
                            <EmailInvoicePopover
                                id="email-invoice"
                                actionName={data.actionName!}
                                color="link"
                                customerEmail={payload.getIn([
                                    'customer',
                                    'email',
                                ])}
                                disabled={loading || isEmpty}
                                onSubmit={handleInvoiceSubmit}
                            >
                                Email new invoice
                            </EmailInvoicePopover>
                        </div>
                    ) : (
                        <div className={css.emailInvoiceContainer}>
                            <h4 className="mr-auto">Email invoice</h4>
                            <EmailInvoicePopover
                                id="email-invoice"
                                actionName={data.actionName!}
                                color="primary"
                                customerEmail={payload.getIn([
                                    'customer',
                                    'email',
                                ])}
                                disabled={loading || isEmpty}
                                onSubmit={handleInvoiceSubmit}
                            >
                                Email invoice
                            </EmailInvoicePopover>
                        </div>
                    )}
                </div>
            ) : (
                <Loader />
            )}
            <ModalFooter className={css.formFooter}>
                <Button
                    tabIndex={0}
                    className={css.focusable}
                    onClick={handleCancel('footer')}
                >
                    Cancel
                </Button>
                {loading && (
                    <div className="ml-3">
                        <Loader
                            className={css.spinner}
                            minHeight="20px"
                            size="20px"
                        />
                        <span className="ml-2">{loadingMessage}</span>
                    </div>
                )}
                <Button
                    color="primary"
                    disabled={loading || isEmpty}
                    tabIndex={0}
                    className={classnames(css.focusable, 'ml-auto')}
                    onClick={handlePaymentSubmit()}
                >
                    Create order as paid
                </Button>
                <Button
                    color="primary"
                    disabled={loading || isEmpty}
                    tabIndex={0}
                    className={css.focusable}
                    onClick={handlePaymentSubmit(true)}
                >
                    Create order as pending
                </Button>
            </ModalFooter>
        </DEPRECATED_Modal>
    )
}

const connector = connect(
    (state: RootState) => ({
        integrations: getIntegrationsByTypes([IntegrationType.Shopify])(state),
        loading: getCreateOrderState(state).get('loading'),
        loadingMessage: getCreateOrderState(state).get('loadingMessage'),
        payload: getCreateOrderState(state).get('payload') as Map<
            any,
            any
        > | null,
        products: getCreateOrderState(state).get('products'),
    }),
    {
        addCustomRow,
        addRow,
        onCancel,
        onEmailInvoice,
        onInit,
        onLineItemChange,
        onCreateDraftOrder,
        onReset,
    }
)

export default connector(DraftOrderModalContainer)
