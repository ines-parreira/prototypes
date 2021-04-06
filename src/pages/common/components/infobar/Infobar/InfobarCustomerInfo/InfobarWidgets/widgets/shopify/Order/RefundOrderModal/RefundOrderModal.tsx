import React, {ChangeEvent} from 'react'
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
} from '../../../../../../../../../../../state/infobarActions/shopify/refundOrder/actions'
import {getRefundOrderState} from '../../../../../../../../../../../state/infobarActions/shopify/refundOrder/selectors'
import shortcutManager from '../../../../../../../../../../../services/shortcutManager/shortcutManager'
import {getIntegrationsByTypes} from '../../../../../../../../../../../state/integrations/selectors'
import {getFinalRefundOrderPayload} from '../../../../../../../../../../../business/shopify/order'
import {IntegrationType} from '../../../../../../../../../../../models/integration/types'
import {RootState} from '../../../../../../../../../../../state/types'
import Loader from '../../../../../../../../Loader/Loader'
import {InfobarModalProps} from '../../../types'
import Modal from '../../../../../../../../Modal'
import RefundOrderForm from '../RefundOrderForm/RefundOrderForm'

import css from './RefundOrderModal.less'

type OwnProps = Omit<InfobarModalProps, 'data'> & {
    data: {
        actionName: string | null
        order: Map<any, any>
    }
}

type Props = OwnProps & ConnectedProps<typeof connector>

export class RefundOrderModalContainer extends React.PureComponent<Props> {
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
            onOpen(actionName as string)
            void onInit(integrationId, order)
            onChange('order_id', order.get('id'))
            shortcutManager.pause()
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

    _onLineItemsChange = (lineItems: List<any>) => {
        const {onLineItemsChange} = this.props
        const {integrationId} = this.context

        void onLineItemsChange(integrationId, lineItems)
    }

    _onPayloadChange = (payload: Map<any, any>) => {
        const {onPayloadChange} = this.props
        const {integrationId} = this.context

        void onPayloadChange(integrationId, payload)
    }

    _onReasonChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const {value} = event.target
        const newPayload = payload.set('note', value)

        setPayload(newPayload)
    }

    _onNotifyChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const {checked} = event.target
        const newPayload = payload.set('notify', checked)

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

    _onSubmit = (event: ChangeEvent<HTMLFormElement>) => {
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
                            notify={payload.get('notify')}
                            loading={loading}
                            payload={payload}
                            order={order}
                            refund={refund}
                            lineItems={lineItems}
                            setPayload={setPayload}
                            onPayloadChange={this._onPayloadChange}
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

const connector = connect(
    (state: RootState) => ({
        integrations: getIntegrationsByTypes([
            IntegrationType.ShopifyIntegrationType,
        ])(state),
        loading: getRefundOrderState(state).get('loading') as boolean,
        loadingMessage: getRefundOrderState(state).get(
            'loadingMessage'
        ) as string,
        payload: getRefundOrderState(state).get('payload') as Map<any, any>,
        lineItems: getRefundOrderState(state).get('lineItems') as List<any>,
        refund: getRefundOrderState(state).get('refund') as Map<any, any>,
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

export default connector(RefundOrderModalContainer)
