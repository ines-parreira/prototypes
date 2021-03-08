import React, {Component, ReactNode} from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS, Map} from 'immutable'

import {
    FulfillmentStatus,
    FinancialStatus,
} from '../../../../../../../../../../constants/integrations/types/shopify'
import {DatetimeLabel} from '../../../../../../../../utils/labels.js'
import ActionButtonsGroup from '../../ActionButtonsGroup.js'
import {CardHeaderDetails} from '../../CardHeaderDetails.js'
import DraftOrderModal from '../shared/DraftOrderModal/DraftOrderModal'
import {CardHeaderValue} from '../../CardHeaderValue.js'
import {InfobarAction} from '../../types'
import {ShopifyActionType} from '../types'
import MoneyAmount from '../../MoneyAmount.js'

import CancelOrderModal from './CancelOrderModal/CancelOrderModal'
import RefundOrderModal from './RefundOrderModal/RefundOrderModal'
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
    isEditing: boolean
    source: Map<string, string | number | boolean>
}

class AfterTitle extends Component<AfterTitleProps> {
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

        const actions: Array<InfobarAction> = [
            {
                key: 'refund',
                options: [
                    {
                        value: ShopifyActionType.RefundOrder,
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
                    actionName: ShopifyActionType.RefundOrder,
                    order: source,
                },
            },
            {
                key: 'cancel',
                options: [
                    {
                        value: ShopifyActionType.CancelOrder,
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
                    actionName: ShopifyActionType.CancelOrder,
                    order: source,
                },
            },
            {
                key: 'duplicate',
                options: [
                    {
                        value: ShopifyActionType.DuplicateOrder,
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
                    actionName: ShopifyActionType.DuplicateOrder,
                    order: source,
                    customer: fromJS({
                        id: source.getIn(['customer', 'id']),
                        admin_graphql_api_id: source.getIn([
                            'customer',
                            'admin_graphql_api_id',
                        ]),
                        email: source.getIn(['customer', 'email']),
                        default_address: source.get('default_address'),
                        currency: source.get('currency'),
                    }),
                },
            },
        ]

        const removed: string[] = []

        if (isOrderCancelled || isOrderFulfilled || isOrderPartiallyFulfilled) {
            removed.push('cancel')
        }

        if (isOrderRefunded) {
            removed.push('refund')
        }

        // remove removed actions from list of available actions
        return actions.filter(
            (action: InfobarAction) => !removed.includes(action.key)
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

        const payload = {
            order_id: (source.get('id') as number) || '',
        }

        return (
            <>
                <OrderStatus
                    fulfillmentStatus={
                        source.get('fulfillment_status') as FulfillmentStatus
                    }
                    financialStatus={
                        source.get('financial_status') as FinancialStatus
                    }
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
                            dateTime={source.get('created_at') as string}
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
    children?: ReactNode
    source: Map<any, any>
}

class TitleWrapper extends Component<TitleWrapperProps> {
    // eslint-disable-line
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source} = this.props
        const shopName: string = (this.context as {
            integration: Map<any, any>
        }).integration.getIn(['meta', 'shop_name']) as string

        return (
            <a
                href={`https://${shopName}.myshopify.com/admin/orders/${(
                    (source.get('id') as number) || ''
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
    children: ReactNode
    source: Map<any, any>
}

class Wrapper extends React.Component<WrapperProps> {
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
