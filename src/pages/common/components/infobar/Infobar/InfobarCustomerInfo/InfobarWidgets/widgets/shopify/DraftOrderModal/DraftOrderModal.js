// @flow

import React from 'react'
import {connect} from 'react-redux'
import {Alert, Button, ModalFooter} from 'reactstrap'
import {fromJS, type List, type Record} from 'immutable'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Link} from 'react-router'

import {
    getCreateOrderState
} from '../../../../../../../../../../state/infobarActions/shopify/createOrder/selectors'
import {
    addCustomRow,
    addRow,
    onCancel,
    onCleanUp,
    onEmailInvoice,
    onInit,
    onPayloadChange,
    onReset,
} from '../../../../../../../../../../state/infobarActions/shopify/createOrder/actions'
import shortcutManager from '../../../../../../../../../../services/shortcutManager/shortcutManager'
import {getIntegrationsByTypes} from '../../../../../../../../../../state/integrations/selectors'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../../../../../constants/integration'
import type {IntegrationDataItem} from '../../../../../../../../../../models/integration'
import * as Shopify from '../../../../../../../../../../constants/integrations/shopify'
import ProductSearchInput from '../../../../../../../../forms/ProductSearchInput'
import {DatetimeLabel} from '../../../../../../../../utils/labels'
import Loader from '../../../../../../../Loader/Loader'
import EmailInvoicePopover from '../Order/EmailInvoicePopover'
import type {InfobarModalProps} from '../../types'
import Modal from '../../../../../../../Modal'
import type {ShopifyActionType} from '../types'

import AddCustomItemPopover from './AddCustomItemPopover'
import DuplicateOrderFooter from './OrderFooter'
import DraftOrderTable from './DraftOrderTable'
import css from './DraftOrderModal.less'

type Props = InfobarModalProps & {
    integrations: List<*>,
    loading: boolean,
    loadingMessage: ?string,
    payload: Record<$Shape<Shopify.DraftOrder>>,
    draftOrder: ?Record<Shopify.DraftOrder>,
    products: Map<number, Record<Shopify.Product>>,
    data: {
        actionName: ?ShopifyActionType,
        order?: Record<Shopify.Order>,
        customer: Record<$Shape<Shopify.Customer>>,
    },
    addCustomRow: (integrationId: number, lineItem: Record<$Shape<Shopify.LineItem>>) => void,
    addRow: (actionName: string, integrationId: number, product: Shopify.Product, variant: Shopify.Variant) => void,
    onCancel: (actionName: string, integrationId: number, via: string) => void,
    onCleanUp: (integrationId: number) => void,
    onEmailInvoice: (
        integrationId: number,
        customerId: number,
        orderId: number | null,
        invoicePayload: Record<Shopify.DraftOrderInvoice>,
        onDone: () => void,
    ) => void,
    onInit: (
        integrationId: number,
        order: ?Record<Shopify.Order>,
        customer: Record<$Shape<Shopify.Customer>>,
        onError: () => void,
    ) => void,
    onPayloadChange: (integrationId: number, payload: Record<$Shape<Shopify.DraftOrder>>) => void,
    onReset: () => void,
}

export class DraftOrderModalComponent extends React.PureComponent<Props> {
    static contextTypes = {
        integrationId: PropTypes.number.isRequired,
        customerId: PropTypes.number.isRequired,
    }

    static defaultProps = {
        data: {
            actionName: null,
            order: null,
        },
    }

    componentWillMount() {
        const {onCleanUp} = this.props
        const {integrationId} = this.context

        onCleanUp(integrationId)
    }

    componentWillReceiveProps(nextProps: Props) {
        const {isOpen, data: {actionName, order, customer}, draftOrder, onOpen, onInit, onBulkChange} = this.props
        const {integrationId} = this.context
        const hasScope = this._hasScope()

        if (!isOpen && nextProps.isOpen) {
            onOpen(actionName)
            hasScope && onInit(integrationId, order, customer, this._onInitError)
            shortcutManager.pause()
        }

        const id = draftOrder ? draftOrder.get('id') : null
        const nextId = nextProps.draftOrder ? nextProps.draftOrder.get('id') : null

        if (nextId && nextId !== id) {
            const changes = [{name: 'draft_order_id', value: nextId}]

            if (order) {
                changes.push({name: 'order_id', value: order.get('id')})
            }

            onBulkChange(changes)
        }
    }

    _getIntegration() {
        const {integrations} = this.props
        const {integrationId} = this.context

        return integrations.find((integration) => integration.get('id') === integrationId)
    }

    _hasScope() {
        const integration = this._getIntegration()

        return !!integration
            ? integration.getIn(['meta', 'oauth', 'scope']).includes('write_draft_orders')
            : false
    }

    _onInitError = () => {
        const {onClose} = this.props

        onClose()
        this._onClose()
    }

    _onVariantClicked = (item: IntegrationDataItem<Shopify.Product>, variant: Shopify.Variant) => {
        const {integrationId} = this.context
        const {addRow, data: {actionName}} = this.props
        const {data: product} = item

        addRow(actionName, integrationId, product, variant)
    }

    _onAddCustomItem = (lineItem: Record<$Shape<Shopify.LineItem>>) => {
        const {addCustomRow} = this.props
        const {integrationId} = this.context

        addCustomRow(integrationId, lineItem)
    }

    _onLineItemsChange = (lineItems: List<$Shape<Shopify.LineItem>>) => {
        const {payload, onPayloadChange} = this.props
        const {integrationId} = this.context
        const newPayload = payload.set('line_items', lineItems)

        onPayloadChange(integrationId, newPayload)
    }

    _onEmailInvoice = (invoicePayload: Record<Shopify.DraftOrderInvoice>) => {
        const {onEmailInvoice, onClose, data: {order}} = this.props
        const {integrationId, customerId} = this.context
        const orderId = order ? order.get('id') : null

        onEmailInvoice(integrationId, customerId, orderId, invoicePayload, () => {
            onClose()
            this._onClose()
        })
    }

    _onSubmitPaid = () => {
        const {onChange, onSubmit} = this.props

        onChange('payment_pending', false, () => {
            onSubmit()
            this._onClose()
        })
    }

    _onSubmitPending = () => {
        const {onChange, onSubmit} = this.props

        onChange('payment_pending', true, () => {
            onSubmit()
            this._onClose()
        })
    }

    _onCancel(via: string) {
        const {onCancel, onClose, data: {actionName}} = this.props
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
            header, isOpen, payload, products, draftOrder, loading, loadingMessage, data: {order, actionName},
        } = this.props
        const {integrationId} = this.context
        const lineItems = payload ? payload.get('line_items', fromJS([])) : fromJS([])
        const empty = !lineItems.size

        const integration = this._getIntegration()
        if (!integration) {
            return null
        }

        const shopName = integration.getIn(['meta', 'shop_name'])
        const currencyCode = integration.getIn(['meta', 'currency'], 'USD')
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
                        Missing Shopify permissions. To use this new feature, please go to the{' '}
                        <Link to={`/app/settings/integrations/shopify/${integrationId}`}>
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
                {payload && draftOrder
                    ? (
                        <div>
                            <DraftOrderTable
                                shopName={shopName}
                                actionName={actionName}
                                currencyCode={currencyCode}
                                lineItems={lineItems}
                                products={products}
                                onChange={this._onLineItemsChange}
                            />
                            <DuplicateOrderFooter
                                editable
                                actionName={actionName}
                                currencyCode={currencyCode}
                            />
                            {draftOrder.get('status') === 'invoice_sent'
                                ? (
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
                                            actionName={actionName}
                                            color="link"
                                            customerEmail={draftOrder.getIn(['customer', 'email'])}
                                            disabled={loading || empty}
                                            onSubmit={this._onEmailInvoice}
                                        >
                                            Email new invoice
                                        </EmailInvoicePopover>
                                    </div>
                                )
                                : (
                                    <div className={css.emailInvoiceContainer}>
                                        <h4 className="mr-auto">Email invoice</h4>
                                        <EmailInvoicePopover
                                            id="email-invoice"
                                            actionName={actionName}
                                            color="primary"
                                            customerEmail={draftOrder.getIn(['customer', 'email'])}
                                            disabled={loading || empty}
                                            onSubmit={this._onEmailInvoice}
                                        >
                                            Email invoice
                                        </EmailInvoicePopover>
                                    </div>
                                )
                            }
                        </div>
                    )
                    : <Loader/>
                }
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
    draftOrder: getCreateOrderState(state).get('draftOrder'),
    products: getCreateOrderState(state).get('products'),
})

const mapDispatchToProps = {
    addCustomRow,
    addRow,
    onCancel,
    onCleanUp,
    onEmailInvoice,
    onInit,
    onPayloadChange,
    onReset,
}

export default connect(mapStateToProps, mapDispatchToProps)(DraftOrderModalComponent)

