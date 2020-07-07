// @flow

import React, {type Node} from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS, type Map} from 'immutable'

import {DatetimeLabel} from '../../../../../../../../utils/labels'
import ActionButtonsGroup from '../../ActionButtonsGroup'
import {CardHeaderDetails} from '../../CardHeaderDetails'
import DraftOrderModal from '../shared/DraftOrderModal'
import {CardHeaderValue} from '../../CardHeaderValue'
import type {ActionType} from '../../types'
import {ShopifyAction} from '../constants'
import MoneyAmount from '../../MoneyAmount'

import CancelOrderModal from './CancelOrderModal'
import RefundOrderModal from './RefundOrderModal'
import OrderStatus from './OrderStatus'

export default function OrderWidget() {
    return {
        AfterTitle,
        editionHiddenFields: ['link'],
        TitleWrapper,
        Wrapper,
    }
}

type AfterTitleProps = {
    isEditing: boolean,
    source: Map<string, string | number | boolean>,
}

class AfterTitle extends React.Component<AfterTitleProps> {
    static contextTypes = {
        integrationId: PropTypes.number,
        isOrderCancelled: PropTypes.bool.isRequired,
        isOrderRefunded: PropTypes.bool.isRequired,
        isOrderFulfilled: PropTypes.bool.isRequired,
        isOrderPartiallyFulfilled: PropTypes.bool.isRequired,
    }

    _getActions = () => {
        const {source}: AfterTitleProps = this.props
        const {
            isOrderCancelled,
            isOrderRefunded,
            isOrderFulfilled,
            isOrderPartiallyFulfilled,
        } = this.context

        const actions: Array<ActionType> = [
            {
                key: 'refund',
                options: [
                    {
                        value: ShopifyAction.REFUND_ORDER,
                        label: 'Refund order',
                        parameters: [
                            {name: 'order_id', type: 'hidden'},
                            {name: 'payload', type: 'hidden'},
                        ],
                    },
                ],
                title: 'Refund order',
                child: (
                    <>
                        <i className="material-icons">refresh</i> Refund
                    </>
                ),
                modal: RefundOrderModal,
                modalData: {
                    actionName: ShopifyAction.REFUND_ORDER,
                    order: source,
                },
            },
            {
                key: 'cancel',
                options: [
                    {
                        value: ShopifyAction.CANCEL_ORDER,
                        label: 'Cancel order',
                        parameters: [
                            {name: 'order_id', type: 'hidden'},
                            {name: 'payload', type: 'hidden'},
                        ],
                    },
                ],
                title: 'Cancel order',
                child: (
                    <>
                        <i className="material-icons">block</i> Cancel
                    </>
                ),
                modal: CancelOrderModal,
                modalData: {
                    actionName: ShopifyAction.CANCEL_ORDER,
                    order: source,
                },
            },
            {
                key: 'duplicate',
                options: [
                    {
                        value: ShopifyAction.DUPLICATE_ORDER,
                        label: 'Duplicate',
                        parameters: [
                            {name: 'order_id', type: 'hidden'},
                            {name: 'draft_order_id', type: 'hidden'},
                            {name: 'payment_pending', type: 'hidden'},
                        ],
                    },
                ],
                title: 'Duplicate order',
                child: (
                    <>
                        <i className="material-icons">filter_none</i> Duplicate
                    </>
                ),
                modal: DraftOrderModal,
                modalData: {
                    actionName: ShopifyAction.DUPLICATE_ORDER,
                    order: source,
                    customer: fromJS({
                        id: source.getIn(['customer', 'id']),
                        email: source.getIn(['customer', 'email']),
                        default_address: source.get('default_address'),
                        currency: source.get('currency'),
                    }),
                },
            },
        ]

        const removed = []

        if (isOrderCancelled || isOrderFulfilled || isOrderPartiallyFulfilled) {
            removed.push('cancel')
        }

        if (isOrderRefunded) {
            removed.push('refund')
        }

        // remove removed actions from list of available actions
        return actions.filter(
            (action: ActionType) => !removed.includes(action.key)
        )
    }

    render() {
        const {source}: AfterTitleProps = this.props
        const {integrationId, isOrderCancelled} = this.context

        if (this.props.isEditing) {
            return null
        }

        if (!integrationId) {
            return null
        }

        const payload: Object = {
            order_id: source.get('id') || '',
        }

        return (
            <>
                <OrderStatus
                    fulfillmentStatus={source.get('fulfillment_status')}
                    financialStatus={source.get('financial_status')}
                    isCancelled={isOrderCancelled}
                />
                <ActionButtonsGroup
                    actions={this._getActions()}
                    payload={payload}
                />
                <CardHeaderDetails>
                    <CardHeaderValue label="Created">
                        <DatetimeLabel
                            key="created-at"
                            dateTime={source.get('created_at')}
                        />
                    </CardHeaderValue>
                    <CardHeaderValue label="Total">
                        <MoneyAmount
                            amount={source.getIn([
                                'total_price_set',
                                'presentment_money',
                                'amount',
                            ])}
                            currencyCode={source.getIn([
                                'total_price_set',
                                'presentment_money',
                                'currency_code',
                            ])}
                        />
                    </CardHeaderValue>
                </CardHeaderDetails>
            </>
        )
    }
}

type TitleWrapperProps = {
    children?: Node,
    source: Map<*, *>,
}

class TitleWrapper extends React.Component<TitleWrapperProps> {
    // eslint-disable-line
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source} = this.props
        const shopName: string = this.context.integration.getIn([
            'meta',
            'shop_name',
        ])

        return (
            <a
                href={`https://${shopName}.myshopify.com/admin/orders/${(
                    source.get('id') || ''
                ).toString()}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        )
    }
}

type WrapperProps = {
    children: Node,
    source: Map<*, *>,
}

class Wrapper extends React.Component<WrapperProps> {
    // eslint-disable-line
    static childContextTypes = {
        order: ImmutablePropTypes.map.isRequired,
        orderId: PropTypes.number,
        isOrderCancelled: PropTypes.bool.isRequired,
        isOrderRefunded: PropTypes.bool.isRequired,
        isOrderFulfilled: PropTypes.bool.isRequired,
        isOrderPartiallyFulfilled: PropTypes.bool.isRequired,
    }

    getChildContext() {
        const order = this.props.source || fromJS({})

        const isCancelled = !!order.get('cancelled_at')
        const isRefunded = order.get('financial_status') === 'refunded'
        const isFulfilled = order.get('fulfillment_status') === 'fulfilled'
        const isPartiallyFulfilled =
            order.get('fulfillment_status') === 'partial'

        return {
            order,
            orderId: order.get('id'),
            isOrderCancelled: isCancelled,
            isOrderRefunded: isRefunded,
            isOrderFulfilled: isFulfilled,
            isOrderPartiallyFulfilled: isPartiallyFulfilled,
        }
    }

    render() {
        return this.props.children
    }
}
