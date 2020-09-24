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
} from '../../../../../../../../../../../state/infobarActions/shopify/refundOrder/actions.ts'
import {getRefundOrderState} from '../../../../../../../../../../../state/infobarActions/shopify/refundOrder/selectors.ts'
import shortcutManager from '../../../../../../../../../../../services/shortcutManager/shortcutManager.ts'
import {getIntegrationsByTypes} from '../../../../../../../../../../../state/integrations/selectors.ts'
import {getFinalRefundOrderPayload} from '../../../../../../../../../../../business/shopify/order.ts'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../../../../../../constants/integration'
import type {
    RefundOrderPayload,
    LineItem,
    Refund,
    Order,
} from '../../../../../../../../../../../constants/integrations/types/shopify'
import Loader from '../../../../../../../../Loader/Loader'
import type {InfobarModalProps} from '../../../types'
import Modal from '../../../../../../../../Modal'
import RefundOrderForm from '../RefundOrderForm'

import css from './RefundOrderModal.less'

type Props = InfobarModalProps & {
    integrations: List<*>,
    loading: boolean,
    loadingMessage: string,
    payload: Record<$Shape<RefundOrderPayload>>,
    lineItems: List<$Shape<LineItem>>,
    refund: Record<Refund>,
    data: {
        actionName: ?string,
        order: Record<Order>,
    },
    onCancel: (via: string) => void,
    onInit: (integrationId: number, order: Record<Order>) => void,
    onLineItemsChange: (
        integrationId: number,
        lineItems: List<$Shape<LineItem>>
    ) => void,
    onReset: () => void,
    onPayloadChange: (
        integrationId: number,
        payload: Record<$Shape<RefundOrderPayload>>
    ) => void,
    setPayload: (
        integrationId: number,
        Record<$Shape<RefundOrderPayload>>
    ) => void,
}

export class RefundOrderModalComponent extends React.PureComponent<Props> {
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

    _onLineItemsChange = (lineItems: List<$Shape<LineItem>>) => {
        const {onLineItemsChange} = this.props
        const {integrationId} = this.context

        onLineItemsChange(integrationId, lineItems)
    }

    _onPayloadChange = (payload: Record<$Shape<RefundOrderPayload>>) => {
        const {onPayloadChange} = this.props
        const {integrationId} = this.context

        onPayloadChange(integrationId, payload)
    }

    _onReasonChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const {value} = event.target
        const newPayload = payload.set('note', value)

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
        const finalPayload = getFinalRefundOrderPayload(payload, refund)

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
            setPayload,
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
                            reason={payload.get('note', '')}
                            loading={loading}
                            payload={payload}
                            order={order}
                            refund={refund}
                            lineItems={lineItems}
                            setPayload={setPayload}
                            onPayloadChange={this._onPayloadChange}
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
                            type="submit"
                            disabled={loading}
                            tabIndex={0}
                            className={classnames(css.focusable, 'ml-auto')}
                        >
                            Refund
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => ({
    integrations: getIntegrationsByTypes([SHOPIFY_INTEGRATION_TYPE])(state),
    loading: getRefundOrderState(state).get('loading'),
    loadingMessage: getRefundOrderState(state).get('loadingMessage'),
    payload: getRefundOrderState(state).get('payload'),
    lineItems: getRefundOrderState(state).get('lineItems'),
    refund: getRefundOrderState(state).get('refund'),
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
)(RefundOrderModalComponent)
