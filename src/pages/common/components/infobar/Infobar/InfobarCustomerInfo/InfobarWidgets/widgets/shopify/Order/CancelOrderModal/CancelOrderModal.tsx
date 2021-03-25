import React, {ChangeEvent, FormEvent} from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Form, ModalFooter} from 'reactstrap'
import {fromJS, List, Map} from 'immutable'

import {
    onCancel,
    onInit,
    onLineItemsChange,
    onPayloadChange,
    onReset,
    setPayload,
} from '../../../../../../../../../../../state/infobarActions/shopify/cancelOrder/actions'
import {IntegrationType} from '../../../../../../../../../../../models/integration/types'
import {getCancelOrderState} from '../../../../../../../../../../../state/infobarActions/shopify/cancelOrder/selectors'
import shortcutManager from '../../../../../../../../../../../services/shortcutManager/shortcutManager'
import {getIntegrationsByTypes} from '../../../../../../../../../../../state/integrations/selectors'
import {RootState} from '../../../../../../../../../../../state/types'
import {getFinalCancelOrderPayload} from '../../../../../../../../../../../business/shopify/order'
import Loader from '../../../../../../../../Loader/Loader'
import {InfobarModalProps} from '../../../types'
import Modal from '../../../../../../../../Modal.js'
import RefundOrderForm from '../RefundOrderForm/index.js'

import css from './CancelOrderModal.less'

type Props = InfobarModalProps & {
    data: {
        actionName: string | null
        order: Map<any, any>
    }
    setPayload: (integrationId: number, payload: Map<any, any>) => void
} & ConnectedProps<typeof connector>

export class CancelOrderModalComponent extends React.PureComponent<Props> {
    static contextTypes = {
        integrationId: PropTypes.number.isRequired,
    }

    static defaultProps = {
        data: {
            actionName: null,
            order: fromJS({}),
        },
    }

    componentWillReceiveProps(nextProps: Props) {
        const {
            isOpen,
            data: {actionName, order},
            onOpen,
            onInit,
            onChange,
        } = this.props
        const {integrationId} = this.context

        if (!isOpen && nextProps.isOpen) {
            onOpen(actionName)
            void onInit(integrationId, order)
            onChange('order_id', (order as Map<any, any>).get('id'))
            shortcutManager.pause()
        }
    }

    _getIntegration() {
        const {integrations} = this.props
        const {integrationId} = this.context

        return integrations.find(
            (integration: Map<any, any>) =>
                integration.get('id') === integrationId
        ) as Map<any, any> | null
    }

    _onLineItemsChange = (lineItems: List<any>) => {
        const {onLineItemsChange} = this.props
        const {integrationId} = this.context

        void onLineItemsChange(integrationId, lineItems)
    }

    _onRefundPayloadChange = (refundPayload: Map<any, any>) => {
        const {payload, onPayloadChange} = this.props
        const {integrationId} = this.context
        const newPayload = payload.set('refund', refundPayload)

        void onPayloadChange(integrationId, newPayload)
    }

    _setRefundPayload = (refundPayload: Map<any, any>) => {
        const {payload, setPayload} = this.props
        const newPayload = payload.set('refund', refundPayload)

        setPayload(newPayload)
    }

    _onReasonChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const {value} = event.target
        const newPayload = payload
            .set('reason', value)
            .set('email', value !== 'fraud')

        setPayload(newPayload)
    }

    _onNotifyChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const {checked} = event.target
        const newPayload = payload.set('email', checked)

        setPayload(newPayload)
    }

    _onCancel(via: string) {
        const {onCancel, onClose} = this.props

        onCancel(via)
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

    _onSubmit = (event: FormEvent<HTMLFormElement>) => {
        const {payload, refund, onChange, onSubmit} = this.props
        const finalPayload = getFinalCancelOrderPayload(payload, refund)

        event.preventDefault()

        onChange('payload', finalPayload.toJS(), () => {
            onSubmit()
            this._onClose()
        })
    }

    render() {
        const {
            header,
            isOpen,
            payload,
            refund,
            lineItems,
            loading,
            loadingMessage,
            data: {order, actionName},
        } = this.props

        const integration = this._getIntegration()
        if (!integration) {
            return null
        }

        const shopName = integration.getIn(['meta', 'shop_name'])

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
                <Form onSubmit={this._onSubmit}>
                    {payload && lineItems && (
                        <RefundOrderForm
                            shopName={shopName}
                            actionName={actionName}
                            loading={loading}
                            payload={payload.get('refund')}
                            reason={payload.get('reason')}
                            notify={payload.get('email')}
                            order={order}
                            refund={refund}
                            lineItems={lineItems}
                            setPayload={this._setRefundPayload}
                            onPayloadChange={this._onRefundPayloadChange}
                            onLineItemsChange={this._onLineItemsChange}
                            onReasonChange={this._onReasonChange}
                            onNotifyChange={this._onNotifyChange}
                        />
                    )}
                    <ModalFooter className={css.footer}>
                        <Button
                            tabIndex={0}
                            className={css.focusable}
                            onClick={this._onCancelViaFooter}
                        >
                            Keep order
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
                            type="submit"
                            disabled={loading}
                            tabIndex={0}
                            className={classnames(css.focusable, 'ml-auto')}
                        >
                            Cancel order
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        integrations: getIntegrationsByTypes([
            IntegrationType.ShopifyIntegrationType,
        ])(state),
        loading: getCancelOrderState(state).get('loading') as boolean,
        loadingMessage: getCancelOrderState(state).get(
            'loadingMessage'
        ) as string,
        payload: getCancelOrderState(state).get('payload') as Map<any, any>,
        lineItems: getCancelOrderState(state).get('lineItems') as List<any>,
        refund: getCancelOrderState(state).get('refund') as Map<any, any>,
    }),
    {
        onCancel,
        onInit,
        onLineItemsChange,
        onPayloadChange,
        onReset,
        setPayload,
    }
)

export default connector(CancelOrderModalComponent as any)
