import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Alert, Button, ModalFooter} from 'reactstrap'
import {fromJS, List, Map} from 'immutable'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Link} from 'react-router-dom'

import {getCreateOrderState} from '../../../../../../../../../../../state/infobarActions/shopify/createOrder/selectors'
import {
    addCustomRow,
    addRow,
    onCancel,
    onCreateDraftOrder,
    onEmailInvoice,
    onInit,
    onPayloadChange,
    onReset,
} from '../../../../../../../../../../../state/infobarActions/shopify/createOrder/actions'
import shortcutManager from '../../../../../../../../../../../services/shortcutManager/shortcutManager'
import {getIntegrationsByTypes} from '../../../../../../../../../../../state/integrations/selectors'
import {RootState} from '../../../../../../../../../../../state/types'
import {
    IntegrationDataItem,
    IntegrationType,
} from '../../../../../../../../../../../models/integration/types'
import {
    Product,
    Variant,
} from '../../../../../../../../../../../constants/integrations/types/shopify'
import ProductSearchInput from '../../../../../../../../../forms/ProductSearchInput/ProductSearchInput.js'
import {DatetimeLabel} from '../../../../../../../../../utils/labels.js'
import Loader from '../../../../../../../../Loader/Loader'
import {InfobarModalProps} from '../../../types'
import Modal from '../../../../../../../../Modal'
import {ShopifyActionType} from '../../types'

import AddCustomItemPopover from './AddCustomItemPopover/AddCustomItemPopover'
import EmailInvoicePopover from './EmailInvoicePopover/EmailInvoicePopover'
import DraftOrderFooter from './OrderFooter/OrderFooter'
import DraftOrderTable from './DraftOrderTable/DraftOrderTable'
import css from './DraftOrderModal.less'

type Props = Omit<InfobarModalProps, 'data'> & {
    draftOrder: Map<any, any>
    data: {
        actionName: ShopifyActionType
        order?: Map<any, any>
        customer: Map<any, any>
    }
} & ConnectedProps<typeof connector>

export class DraftOrderModalContainer extends Component<Props> {
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
        } as any,
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
            const integration = this._getIntegration() as Map<any, any> | null
            const currencyCode = integration
                ? integration.getIn(
                      ['meta', 'currency'],
                      DraftOrderModalContainer._DEFAULT_CURRENCY
                  )
                : DraftOrderModalContainer._DEFAULT_CURRENCY

            onOpen(actionName as string)
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
            (integration: Map<any, any>) =>
                integration.get('id') === integrationId
        ) as Map<any, any>
    }

    _hasScope() {
        const integration = this._getIntegration()

        return !!integration
            ? (integration.getIn([
                  'meta',
                  'oauth',
                  'scope',
              ]) as string).includes('write_draft_orders')
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

        void addRow(actionName, integrationId, product, variant)
    }

    _onAddCustomItem = (lineItem: Map<any, any>) => {
        const {addCustomRow} = this.props
        const {integrationId} = this.context

        void addCustomRow(integrationId, lineItem)
    }

    _onLineItemsChange = (lineItems: List<any>) => {
        const {payload, onPayloadChange} = this.props
        const {integrationId} = this.context
        const newPayload = payload.set('line_items', lineItems)

        void onPayloadChange(integrationId, newPayload)
    }

    _onEmailInvoice = (invoicePayload: Map<any, any>) => {
        const {
            onEmailInvoice,
            onClose,
            data: {order},
        } = this.props
        const {integrationId, customerId} = this.context
        const orderId = order ? order.get('id') : null

        void onEmailInvoice(
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
        const orderId: number | null = order ? order.get('id') : null

        void onCreateDraftOrder(integrationId, orderId).then((draftOrder) => {
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
        const lineItems: List<any> = payload
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
            DraftOrderModalContainer._DEFAULT_CURRENCY
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
                            to={`/app/settings/integrations/shopify/${
                                integrationId as string
                            }`}
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

const connector = connect(
    (state: RootState) => ({
        integrations: getIntegrationsByTypes([
            IntegrationType.ShopifyIntegrationType,
        ])(state),
        loading: getCreateOrderState(state).get('loading'),
        loadingMessage: getCreateOrderState(state).get('loadingMessage'),
        payload: getCreateOrderState(state).get('payload') as Map<any, any>,
        products: getCreateOrderState(state).get('products'),
    }),
    {
        addCustomRow,
        addRow,
        onCancel,
        onEmailInvoice,
        onInit,
        onPayloadChange,
        onCreateDraftOrder,
        onReset,
    }
)

export default connector(DraftOrderModalContainer)
