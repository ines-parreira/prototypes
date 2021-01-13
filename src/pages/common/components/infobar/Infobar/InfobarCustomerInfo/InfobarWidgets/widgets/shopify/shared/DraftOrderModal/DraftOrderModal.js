// @flow

import React from 'react'
import {connect} from 'react-redux'
import {Alert, Button, ModalFooter} from 'reactstrap'
import {fromJS, type List, type Map, type Record} from 'immutable'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Link} from 'react-router'

import {getCreateOrderState} from '../../../../../../../../../../../state/infobarActions/shopify/createOrder/selectors.ts'
import {
    addCustomRow,
    addRow,
    onCancel,
    onCreateDraftOrder,
    onEmailInvoice,
    onInit,
    onPayloadChange,
    onReset,
} from '../../../../../../../../../../../state/infobarActions/shopify/createOrder/actions.ts'
import shortcutManager from '../../../../../../../../../../../services/shortcutManager/shortcutManager.ts'
import {getIntegrationsByTypes} from '../../../../../../../../../../../state/integrations/selectors.ts'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../../../../../../constants/integration.ts'
import type {IntegrationDataItem} from '../../../../../../../../../../../models/integration'
import type {
    DraftOrder,
    Product,
    Customer,
    Order,
    LineItem,
    Variant,
    DraftOrderInvoice,
} from '../../../../../../../../../../../constants/integrations/types/shopify'
import ProductSearchInput from '../../../../../../../../../forms/ProductSearchInput'
import {DatetimeLabel} from '../../../../../../../../../utils/labels'
import Loader from '../../../../../../../../Loader/Loader'
import type {InfobarModalProps} from '../../../types'
import Modal from '../../../../../../../../Modal'
import type {ShopifyActionType} from '../../types'

import AddCustomItemPopover from './AddCustomItemPopover'
import EmailInvoicePopover from './EmailInvoicePopover'
import DraftOrderFooter from './OrderFooter'
import DraftOrderTable from './DraftOrderTable'
import css from './DraftOrderModal.less'

type Props = InfobarModalProps & {
    integrations: List<*>,
    loading: boolean,
    loadingMessage: ?string,
    draftOrder: Record<$Shape<DraftOrder>>,
    payload: Record<$Shape<DraftOrder>>,
    products: window.Map<number, Record<Product>>,
    data: {
        actionName: ?ShopifyActionType,
        order?: Record<Order>,
        customer: Record<$Shape<Customer>>,
    },
    addCustomRow: (
        integrationId: number,
        lineItem: Record<$Shape<LineItem>>
    ) => void,
    addRow: (
        actionName: string,
        integrationId: number,
        product: Product,
        variant: Variant
    ) => void,
    onCancel: (actionName: string, integrationId: number, via: string) => void,
    onEmailInvoice: (
        integrationId: number,
        customerId: number,
        orderId: number | null,
        invoicePayload: Record<DraftOrderInvoice>,
        onDone: () => void
    ) => void,
    onInit: (
        integrationId: number,
        order: ?Record<Order>,
        customer: Record<$Shape<Customer>>,
        currencyCode: string,
        onError: () => void
    ) => void,
    onPayloadChange: (
        integrationId: number,
        payload: Record<$Shape<DraftOrder>>
    ) => void,
    onCreateDraftOrder: (
        integrationId: number,
        orderId: ?number
    ) => Promise<?Map<any, any>>,
    onReset: () => void,
}

export class DraftOrderModalComponent extends React.PureComponent<Props> {
    static _DEFAULT_CURRENCY = 'USD'

    static contextTypes = {
        integrationId: PropTypes.number.isRequired,
        customerId: PropTypes.number.isRequired,
    }

    static defaultProps = {
        draftOrder: fromJS({}), // TODO this will be used with action "edit order"
        data: {
            actionName: null,
            order: null,
        },
    }

    componentWillReceiveProps(nextProps: Props) {
        const {
            isOpen,
            data: {actionName, order, customer},
            onOpen,
            onInit,
            onChange,
        } = this.props
        const {integrationId} = this.context
        const hasScope = this._hasScope()

        if (!isOpen && nextProps.isOpen) {
            const integration = this._getIntegration()
            const currencyCode = integration
                ? integration.getIn(
                      ['meta', 'currency'],
                      DraftOrderModalComponent._DEFAULT_CURRENCY
                  )
                : DraftOrderModalComponent._DEFAULT_CURRENCY

            onOpen(actionName)
            hasScope &&
                onInit(
                    integrationId,
                    order,
                    customer,
                    currencyCode,
                    this._onInitError
                )
            shortcutManager.pause()

            if (order) {
                onChange('order_id', order.get('id'))
            }
        }
    }

    _getIntegration() {
        const {integrations} = this.props
        const {integrationId} = this.context

        return integrations.find(
            (integration) => integration.get('id') === integrationId
        )
    }

    _hasScope() {
        const integration = this._getIntegration()

        return !!integration
            ? integration
                  .getIn(['meta', 'oauth', 'scope'])
                  .includes('write_draft_orders')
            : false
    }

    _onInitError = () => {
        const {onClose} = this.props

        onClose()
        this._onClose()
    }

    _onVariantClicked = (
        item: IntegrationDataItem<Product>,
        variant: Variant
    ) => {
        const {integrationId} = this.context
        const {
            addRow,
            data: {actionName},
        } = this.props
        const {data: product} = item

        addRow(actionName, integrationId, product, variant)
    }

    _onAddCustomItem = (lineItem: Record<$Shape<LineItem>>) => {
        const {addCustomRow} = this.props
        const {integrationId} = this.context

        addCustomRow(integrationId, lineItem)
    }

    _onLineItemsChange = (lineItems: List<$Shape<LineItem>>) => {
        const {payload, onPayloadChange} = this.props
        const {integrationId} = this.context
        const newPayload = payload.set('line_items', lineItems)

        onPayloadChange(integrationId, newPayload)
    }

    _onEmailInvoice = (invoicePayload: Record<DraftOrderInvoice>) => {
        const {
            onEmailInvoice,
            onClose,
            data: {order},
        } = this.props
        const {integrationId, customerId} = this.context
        const orderId = order ? order.get('id') : null

        onEmailInvoice(
            integrationId,
            customerId,
            orderId,
            invoicePayload,
            () => {
                onClose()
                this._onClose()
            }
        )
    }

    _onSubmit(paymentPending: boolean) {
        const {
            data: {order},
            onBulkChange,
            onCreateDraftOrder,
            onSubmit,
        } = this.props
        const {integrationId} = this.context
        const orderId: ?number = order ? order.get('id') : null

        onCreateDraftOrder(integrationId, orderId).then((draftOrder) => {
            const draftOrderId: string = !!draftOrder
                ? draftOrder.get('id')
                : ''
            const changes = [
                {name: 'draft_order_id', value: draftOrderId},
                {name: 'payment_pending', value: paymentPending},
            ]

            onBulkChange(changes, () => {
                onSubmit()
                this._onClose()
            })
        })
    }

    _onSubmitPaid = () => {
        this._onSubmit(false)
    }

    _onSubmitPending = () => {
        this._onSubmit(true)
    }

    _onCancel(via: string) {
        const {
            onCancel,
            onClose,
            data: {actionName},
        } = this.props
        const {integrationId} = this.context

        onCancel(actionName, integrationId, via)
        onClose()
        this._onClose()
    }

    _onCancelViaHeader = () => {
        this._onCancel('header')
    }

    _onCancelViaFooter = () => {
        this._onCancel('footer')
    }

    _onClose() {
        const {onReset} = this.props

        shortcutManager.unpause()
        onReset()
    }

    _onMissingScopeClose = () => {
        const {onClose} = this.props

        onClose()
        this._onClose()
    }

    render() {
        const {
            header,
            isOpen,
            payload,
            products,
            loading,
            loadingMessage,
            data: {order, actionName},
            draftOrder,
        } = this.props
        const {integrationId} = this.context
        const lineItems = payload
            ? payload.get('line_items', fromJS([]))
            : fromJS([])
        const empty = !lineItems.size

        const integration = this._getIntegration()
        if (!integration) {
            return null
        }

        const shopName = integration.getIn(['meta', 'shop_name'])
        const currencyCode = integration.getIn(
            ['meta', 'currency'],
            DraftOrderModalComponent._DEFAULT_CURRENCY
        )
        const hasScope = this._hasScope()

        // TODO(@samy): remove when all Shopify integrations have draft order permissions
        if (!hasScope) {
            return (
                <Modal
                    header={header}
                    isOpen={isOpen}
                    onClose={this._onMissingScopeClose}
                >
                    <Alert color="danger">
                        Missing Shopify permissions. To use this new feature,
                        please go to the{' '}
                        <Link
                            to={`/app/settings/integrations/shopify/${integrationId}`}
                        >
                            settings page of your Shopify integration
                        </Link>{' '}
                        and click on "Update app permissions".
                    </Alert>
                </Modal>
            )
        }

        return (
            <Modal
                header={header}
                isOpen={isOpen}
                onClose={this._onCancelViaHeader}
                keyboard={false}
                size="xl"
                bodyClassName="p-0"
                backdrop="static"
            >
                <div className={css.formHeader}>
                    <ProductSearchInput
                        className={css.searchInput}
                        onVariantClicked={this._onVariantClicked}
                        searchOnFocus={!order && !lineItems.size}
                    />
                    <AddCustomItemPopover
                        id="add-custom-item"
                        actionName={actionName}
                        className={css.headerButton}
                        currencyCode={currencyCode}
                        onSubmit={this._onAddCustomItem}
                    />
                </div>
                {payload ? (
                    <div>
                        <DraftOrderTable
                            shopName={shopName}
                            actionName={actionName}
                            currencyCode={currencyCode}
                            lineItems={lineItems}
                            products={products}
                            onChange={this._onLineItemsChange}
                        />
                        <DraftOrderFooter
                            editable
                            actionName={actionName}
                            currencyCode={currencyCode}
                        />
                        {draftOrder.get('status') === 'invoice_sent' ? (
                            <div className={css.emailInvoiceContainer}>
                                <h4 className="mr-auto">Invoice sent</h4>
                                <span className="mr-4">
                                    Sent on{' '}
                                    <DatetimeLabel
                                        dateTime={draftOrder.get(
                                            'invoice_sent_at'
                                        )}
                                        labelFormat="L LT"
                                        hasTooltip={false}
                                    />
                                </span>
                                <EmailInvoicePopover
                                    id="email-invoice"
                                    actionName={actionName}
                                    color="link"
                                    customerEmail={payload.getIn([
                                        'customer',
                                        'email',
                                    ])}
                                    disabled={loading || empty}
                                    onSubmit={this._onEmailInvoice}
                                >
                                    Email new invoice
                                </EmailInvoicePopover>
                            </div>
                        ) : (
                            <div className={css.emailInvoiceContainer}>
                                <h4 className="mr-auto">Email invoice</h4>
                                <EmailInvoicePopover
                                    id="email-invoice"
                                    actionName={actionName}
                                    color="primary"
                                    customerEmail={payload.getIn([
                                        'customer',
                                        'email',
                                    ])}
                                    disabled={loading || empty}
                                    onSubmit={this._onEmailInvoice}
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
                        onClick={this._onCancelViaFooter}
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
                        disabled={loading || empty}
                        tabIndex={0}
                        className={classnames(css.focusable, 'ml-auto')}
                        onClick={this._onSubmitPaid}
                    >
                        Create order as paid
                    </Button>
                    <Button
                        color="primary"
                        disabled={loading || empty}
                        tabIndex={0}
                        className={css.focusable}
                        onClick={this._onSubmitPending}
                    >
                        Create order as pending
                    </Button>
                </ModalFooter>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => ({
    integrations: getIntegrationsByTypes([SHOPIFY_INTEGRATION_TYPE])(state),
    loading: getCreateOrderState(state).get('loading'),
    loadingMessage: getCreateOrderState(state).get('loadingMessage'),
    payload: getCreateOrderState(state).get('payload'),
    products: getCreateOrderState(state).get('products'),
})

const mapDispatchToProps = {
    addCustomRow,
    addRow,
    onCancel,
    onEmailInvoice,
    onInit,
    onPayloadChange,
    onCreateDraftOrder,
    onReset,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DraftOrderModalComponent)
