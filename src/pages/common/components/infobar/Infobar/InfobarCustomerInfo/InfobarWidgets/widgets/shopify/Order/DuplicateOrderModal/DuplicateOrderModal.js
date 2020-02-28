// @flow

import React from 'react'
import {connect} from 'react-redux'
import {Alert, Button, ModalFooter} from 'reactstrap'
import {fromJS, type List, type Record} from 'immutable'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Link} from 'react-router'

import {
    getDuplicateOrderState
} from '../../../../../../../../../../../state/infobarActions/shopify/duplicateOrder/selectors'
import {
    addCustomRow,
    addRow,
    onCancel,
    onCleanUp,
    onEmailInvoice,
    onInit,
    onReset,
} from '../../../../../../../../../../../state/infobarActions/shopify/duplicateOrder/actions'
import shortcutManager from '../../../../../../../../../../../services/shortcutManager/shortcutManager'
import {getIntegrationsByTypes} from '../../../../../../../../../../../state/integrations/selectors'
import * as segmentTracker from '../../../../../../../../../../../store/middlewares/segmentTracker'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../../../../../../constants/integration'
import type {IntegrationDataItem} from '../../../../../../../../../../../models/integration'
import * as Shopify from '../../../../../../../../../../../constants/integrations/shopify'
import ProductSearchInput from '../../../../../../../../../forms/ProductSearchInput'
import {DatetimeLabel} from '../../../../../../../../../utils/labels'
import Loader from '../../../../../../../../Loader/Loader'
import AddCustomItemPopover from '../AddCustomItemPopover'
import EmailInvoicePopover from '../EmailInvoicePopover'
import type {InfobarModalProps} from '../../../types'
import Modal from '../../../../../../../../Modal'
import OrderFooter from '../OrderFooter'
import OrderTable from '../OrderTable'

import css from './DuplicateOrderModal.less'

type Props = InfobarModalProps & {
    integrations: List<*>,
    loading: boolean,
    loadingMessage: ?string,
    payload: Record<$Shape<Shopify.DraftOrder>>,
    draftOrder: ?Record<Shopify.DraftOrder>,
    products: Map<number, Record<Shopify.Product>>,
    data: {
        actionName: ?string,
        order: Record<Shopify.Order>,
    },
    addCustomRow: (integrationId: number, lineItem: Record<$Shape<Shopify.LineItem>>) => void,
    addRow: (integrationId: number, product: Shopify.Product, variant: Shopify.Variant) => void,
    onCancel: (integrationId: number, via: string) => void,
    onCleanUp: (integrationId: number) => void,
    onEmailInvoice: (
        integrationId: number,
        customerId: number,
        orderId: number,
        invoicePayload: Record<Shopify.DraftOrderInvoice>,
        onDone: () => void,
    ) => void,
    onInit: (integrationId: number, order: Record<Shopify.Order>, onError: () => void) => void,
    onReset: () => void,
}

export class DuplicateOrderModalComponent extends React.PureComponent<Props> {
    static contextTypes = {
        integrationId: PropTypes.number.isRequired,
        customerId: PropTypes.number.isRequired,
    }

    static defaultProps = {
        data: {
            actionName: null,
            order: fromJS({}),
        },
    }

    componentWillMount() {
        const {onCleanUp} = this.props
        const {integrationId} = this.context

        onCleanUp(integrationId)
    }

    componentWillReceiveProps(nextProps: Props) {
        const {isOpen, data: {actionName, order}, draftOrder, onOpen, onInit, onBulkChange} = this.props
        const {integrationId} = this.context
        const hasScope = this._hasScope()

        if (!isOpen && nextProps.isOpen) {
            onOpen(actionName)
            hasScope && onInit(integrationId, order, this._onInitError)
            shortcutManager.pause()
        }

        const id = draftOrder ? draftOrder.get('id') : null
        const nextId = nextProps.draftOrder ? nextProps.draftOrder.get('id') : null

        if (nextId && nextId !== id) {
            onBulkChange([
                {name: 'order_id', value: order.get('id')},
                {name: 'draft_order_id', value: nextId},
            ])
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
        const {addRow} = this.props
        const {data: product} = item

        addRow(integrationId, product, variant)
    }

    _onAddCustomItem = (lineItem: Record<$Shape<Shopify.LineItem>>) => {
        const {addCustomRow} = this.props
        const {integrationId} = this.context

        addCustomRow(integrationId, lineItem)
    }

    _onEmailInvoice = (invoicePayload: Record<Shopify.DraftOrderInvoice>) => {
        const {onEmailInvoice, onClose, data: {order}} = this.props
        const {integrationId, customerId} = this.context
        const orderId = order.get('id')

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

        segmentTracker.logEvent(segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_SUBMIT, {
            payment_pending: false,
        })
    }

    _onSubmitPending = () => {
        const {onChange, onSubmit} = this.props

        onChange('payment_pending', true, () => {
            onSubmit()
            this._onClose()
        })

        segmentTracker.logEvent(segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_SUBMIT, {
            payment_pending: true,
        })
    }

    _onCancel(via: string) {
        const {onCancel, onClose} = this.props
        const {integrationId} = this.context

        onCancel(integrationId, via)
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
        const {header, isOpen, payload, draftOrder, loading, loadingMessage, data: {order}} = this.props
        const {integrationId} = this.context

        const integration = this._getIntegration()
        if (!integration) {
            return null
        }

        const shopName = integration.getIn(['meta', 'shop_name'])
        const currencyCode = integration.getIn(['meta', 'currency'])
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
                    />
                    <AddCustomItemPopover
                        id="add-custom-item"
                        className={css.headerButton}
                        currencyCode={currencyCode}
                        onSubmit={this._onAddCustomItem}
                    />
                </div>
                {payload && draftOrder
                    ? (
                        <div>
                            <OrderTable
                                editable
                                shopName={shopName}
                                currencyCode={currencyCode}
                            />
                            <OrderFooter
                                editable
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
                                            color="link"
                                            customerEmail={order.getIn(['customer', 'email'])}
                                            disabled={loading}
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
                                            color="primary"
                                            customerEmail={order.getIn(['customer', 'email'])}
                                            disabled={loading}
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
                        disabled={loading}
                        tabIndex={0}
                        className={classnames(css.focusable, 'ml-auto')}
                        onClick={this._onSubmitPaid}
                    >
                        Create order as paid
                    </Button>
                    <Button
                        color="primary"
                        disabled={loading}
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
    loading: getDuplicateOrderState(state).get('loading'),
    loadingMessage: getDuplicateOrderState(state).get('loadingMessage'),
    payload: getDuplicateOrderState(state).get('payload'),
    draftOrder: getDuplicateOrderState(state).get('draftOrder'),
    products: getDuplicateOrderState(state).get('products'),
})

const mapDispatchToProps = {
    addCustomRow,
    addRow,
    onCancel,
    onCleanUp,
    onEmailInvoice,
    onInit,
    onReset,
}

export default connect(mapStateToProps, mapDispatchToProps)(DuplicateOrderModalComponent)

