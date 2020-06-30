// @flow

import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {Button, Form, ModalFooter} from 'reactstrap'
import {fromJS, type List, type Record} from 'immutable'

import {
    onCancel,
    onInit,
    onLineItemsChange,
    onPayloadChange,
    onReset,
    setPayload,
} from '../../../../../../../../../../../state/infobarActions/shopify/cancelOrder/actions'
import {getCancelOrderState} from '../../../../../../../../../../../state/infobarActions/shopify/cancelOrder/selectors'
import shortcutManager from '../../../../../../../../../../../services/shortcutManager/shortcutManager'
import {getIntegrationsByTypes} from '../../../../../../../../../../../state/integrations/selectors'
import {getFinalCancelOrderPayload} from '../../../../../../../../../../../business/shopify/order'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../../../../../../constants/integration'
import * as Shopify from '../../../../../../../../../../../constants/integrations/shopify'
import Loader from '../../../../../../../../Loader/Loader'
import type {InfobarModalProps} from '../../../types'
import Modal from '../../../../../../../../Modal'
import RefundOrderForm from '../RefundOrderForm'

import css from './CancelOrderModal.less'

type Props = InfobarModalProps & {
    integrations: List<*>,
    loading: boolean,
    loadingMessage: string,
    payload: Record<$Shape<Shopify.CancelOrderPayload>>,
    lineItems: List<$Shape<Shopify.LineItem>>,
    refund: Record<Shopify.Refund>,
    data: {
        actionName: ?string,
        order: Record<Shopify.Order>,
    },
    onCancel: (via: string) => void,
    onInit: (integrationId: number, order: Record<Shopify.Order>) => void,
    onLineItemsChange: (
        integrationId: number,
        lineItems: List<$Shape<Shopify.LineItem>>
    ) => void,
    onReset: () => void,
    onPayloadChange: (
        integrationId: number,
        payload: Record<$Shape<Shopify.CancelOrderPayload>>
    ) => void,
    setPayload: (
        integrationId: number,
        Record<$Shape<Shopify.RefundOrderPayload>>
    ) => void,
}

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
            onInit(integrationId, order)
            onChange('order_id', order.get('id'))
            shortcutManager.pause()
        }
    }

    _getIntegration() {
        const {integrations} = this.props
        const {integrationId} = this.context

        return integrations.find(
            (integration) => integration.get('id') === integrationId
        )
    }

    _onLineItemsChange = (lineItems: List<$Shape<Shopify.LineItem>>) => {
        const {onLineItemsChange} = this.props
        const {integrationId} = this.context

        onLineItemsChange(integrationId, lineItems)
    }

    _onRefundPayloadChange = (
        refundPayload: Record<$Shape<Shopify.RefundOrderPayload>>
    ) => {
        const {payload, onPayloadChange} = this.props
        const {integrationId} = this.context
        const newPayload = payload.set('refund', refundPayload)

        onPayloadChange(integrationId, newPayload)
    }

    _setRefundPayload = (
        refundPayload: Record<$Shape<Shopify.RefundOrderPayload>>
    ) => {
        const {payload, setPayload} = this.props
        const newPayload = payload.set('refund', refundPayload)

        setPayload(newPayload)
    }

    _onReasonChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const {value} = event.target
        const newPayload = payload
            .set('reason', value)
            .set('email', value !== 'fraud')

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

    _onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
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
                            order={order}
                            refund={refund}
                            lineItems={lineItems}
                            setPayload={this._setRefundPayload}
                            onPayloadChange={this._onRefundPayloadChange}
                            onLineItemsChange={this._onLineItemsChange}
                            onReasonChange={this._onReasonChange}
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

const mapStateToProps = (state) => ({
    integrations: getIntegrationsByTypes([SHOPIFY_INTEGRATION_TYPE])(state),
    loading: getCancelOrderState(state).get('loading'),
    loadingMessage: getCancelOrderState(state).get('loadingMessage'),
    payload: getCancelOrderState(state).get('payload'),
    lineItems: getCancelOrderState(state).get('lineItems'),
    refund: getCancelOrderState(state).get('refund'),
})

const mapDispatchToProps = {
    onCancel,
    onInit,
    onLineItemsChange,
    onPayloadChange,
    onReset,
    setPayload,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CancelOrderModalComponent)
