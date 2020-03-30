// @flow

import React, {type Node} from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS, type Map} from 'immutable'
import {Badge} from 'reactstrap'

import {humanizeString} from '../../../../../../../../../../utils'
import ActionButtonsGroup from '../../ActionButtonsGroup'
import type {ActionType} from '../../types'

import DuplicateOrderModal from './DuplicateOrderModal'
import CancelOrderModal from './CancelOrderModal'
import RefundOrderModal from './RefundOrderModal'
import {ShopifyAction} from './constants'

export default function OrderWidget() {
    return {
        AfterTitle,
        BeforeContent,
        editionHiddenFields: ['link'],
        TitleWrapper,
        Wrapper,
    }
}

type AfterTitleProps = {
    isEditing: boolean,
    source: Map<string, string | number | boolean>
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
                        ]
                    }
                ],
                title: 'Refund order',
                child: (
                    <div>
                        <i className="material-icons mr-1">
                            refresh
                        </i>
                        Refund
                    </div>
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
                        ]
                    }
                ],
                title: 'Cancel order',
                child: (
                    <div>
                        <i className="material-icons mr-1">
                            block
                        </i>
                        Cancel
                    </div>
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
                    <div>
                        <i className="material-icons mr-2">
                            filter_none
                        </i>
                        Duplicate
                    </div>
                ),
                modal: DuplicateOrderModal,
                modalData: {
                    actionName: ShopifyAction.DUPLICATE_ORDER,
                    order: source,
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
        return actions.filter((action: ActionType) => !removed.includes(action.key))
    }

    render() {
        const {source}: AfterTitleProps = this.props
        const {integrationId}: { integrationId: number } = this.context

        if (this.props.isEditing) {
            return null
        }

        if (!integrationId) {
            return null
        }

        const payload: Object = {
            order_id: source.get('id') || ''
        }

        return (
            <ActionButtonsGroup
                actions={this._getActions()}
                payload={payload}
            />
        )
    }
}

const statusColors = {
    pending: 'secondary',
    partially_paid: 'success',
    paid: 'success',
    partially_refunded: 'warning',
    refunded: 'warning',
}


type BeforeContentProps = {
    source: Map<*, *>
}

class BeforeContent extends React.Component<BeforeContentProps> { // eslint-disable-line
    static contextTypes = {
        isOrderCancelled: PropTypes.bool.isRequired,
    }

    render() {
        const {source} = this.props
        const {isOrderCancelled}: { isOrderCancelled: boolean } = this.context

        const status: string = source.get('financial_status') || ''

        return (
            <div className="simple-field">
                <span className="field-label">
                    Status:
                </span>
                <span className="field-value">
                    <Badge color={statusColors[status] || 'secondary'}>
                        {humanizeString(status)}
                    </Badge>
                    {
                        isOrderCancelled && (
                            <Badge
                                color="danger"
                                className="ml-2"
                            >
                                Cancelled
                            </Badge>
                        )
                    }
                </span>
            </div>
        )
    }
}


type TitleWrapperProps = {
    children?: Node,
    source: Map<*, *>
}

class TitleWrapper extends React.Component<TitleWrapperProps> { // eslint-disable-line
    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {children, source} = this.props
        const shopName: string = this.context.integration.getIn(['meta', 'shop_name'])

        return (
            <a
                href={`https://${shopName}.myshopify.com/admin/orders/${(source.get('id') || '').toString()}`}
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
    source: Map<*, *>
}

class Wrapper extends React.Component<WrapperProps> { // eslint-disable-line
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
        const isPartiallyFulfilled = order.get('fulfillment_status') === 'partial'

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
