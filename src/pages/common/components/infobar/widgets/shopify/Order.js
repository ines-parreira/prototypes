// @flow
import React, {PropTypes} from 'react'
import type {Node} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'
import {
    Badge,
} from 'reactstrap'

import {humanizeString} from '../../../../../../utils'

import type {ActionType} from './../types'

import ActionButtonsGroup from '../ActionButtonsGroup'

export default () => {
    return {
        AfterTitle, // eslint-disable-line
        BeforeContent, // eslint-disable-line
        editionHiddenFields: ['link'],
        TitleWrapper, // eslint-disable-line
        Wrapper, // eslint-disable-line
    }
}

type AfterTitleProps = {
    isEditing: boolean,
    source: Map<string, string | number | boolean>
}

class AfterTitle extends React.Component<AfterTitleProps> { // eslint-disable-line
    static contextTypes = {
        integrationId: PropTypes.number,
        isOrderCancelled: PropTypes.bool.isRequired,
        isOrderRefunded: PropTypes.bool.isRequired,
    }

    render() {
        const {source}: AfterTitleProps = this.props
        const {
            integrationId,
            isOrderCancelled,
            isOrderRefunded
        }: {
            integrationId: number,
            isOrderCancelled: boolean,
            isOrderRefunded: boolean
        } = this.context

        if (this.props.isEditing) {
            return null
        }

        if (!integrationId) {
            return null
        }

        const orderTotalPrice: number = parseFloat(source.get('total_price') || '0')

        let actions: Array<ActionType> = [
            {
                key: 'refund',
                options: [
                    {
                        value: 'shopifyPartialRefundOrder',
                        label: 'Partial refund',
                        parameters: [
                            {
                                name: 'amount',
                                type: 'number',
                                defaultValue: orderTotalPrice,
                                label: 'Amount',
                                placeholder: 'Amount',
                                required: true,
                                step: 0.01,
                                min: 0.01,
                                max: orderTotalPrice
                            }
                        ],
                    },
                    {
                        value: 'shopifyFullRefundOrder',
                        label: 'Full refund',
                        parameters: [
                            {name: 'restock', type: 'checkbox', defaultValue: true, label: 'Restock all items'}
                        ]
                    },
                    {
                        value: 'shopifyRefundShippingCostOfOrder',
                        label: 'Refund shipping only'
                    },
                ],
                tooltip: 'This will refund the order in Shopify.',
                title: (
                    <div>
                        <i className="material-icons mr-2">
                            refresh
                        </i>
                        Refund order
                    </div>
                ),
                child: (
                    <div>
                        <i className="material-icons mr-2">
                            refresh
                        </i>
                        Refund
                    </div>
                )
            },
            {
                key: 'cancel',
                options: [
                    {
                        value: 'shopifyCancelOrder',
                        label: 'Cancel order',
                        parameters: [
                            {name: 'refund', type: 'checkbox', defaultValue: true, label: 'Refund order'},
                            {name: 'restock', type: 'checkbox', defaultValue: true, label: 'Restock all items'},
                        ]
                    }
                ],
                tooltip: 'This will cancel the order in Shopify.',
                title: (
                    <div>
                        <i className="material-icons mr-1">
                            block
                        </i>
                        Cancel order
                    </div>
                ),
                child: (
                    <div>
                        <i className="material-icons mr-1">
                            block
                        </i>
                        Cancel
                    </div>
                )
            },
            {
                key: 'duplicate',
                options: [
                    {
                        value: 'shopifyDuplicateOrder',
                        label: 'Duplicate',
                    }
                ],
                tooltip: 'This will create a new order with the same items and mark it as paid.',
                title: (
                    <div>
                        <i className="material-icons mr-2">
                            filter_none
                        </i>
                        Duplicate order
                    </div>
                ),
                child: (
                    <div>
                        <i className="material-icons mr-2">
                            filter_none
                        </i>
                        Duplicate
                    </div>
                )
            },
        ]

        let removed = []

        if (isOrderCancelled) {
            removed = removed.concat(['cancel'])
        }

        if (isOrderRefunded) {
            removed = removed.concat(['refund'])
        }

        // remove removed actions from list of available actions
        actions = actions.filter((action: ActionType) => !removed.includes(action.key))

        const payload: Object = {
            order_id: source.get('id') || ''
        }

        return (
            <ActionButtonsGroup
                actions={actions}
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
    source: Map<*,*>
}

class BeforeContent extends React.Component<BeforeContentProps> { // eslint-disable-line
    static contextTypes = {
        isOrderCancelled: PropTypes.bool.isRequired,
    }

    render() {
        const {source} = this.props
        const {isOrderCancelled}: {isOrderCancelled: boolean} = this.context

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
    source: Map<*,*>
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
            >
                {children}
            </a>
        )
    }
}


type WrapperProps = {
    children?: Node,
    source: Map<*,*>
}

class Wrapper extends React.Component<WrapperProps> { // eslint-disable-line
    static childContextTypes = {
        order: ImmutablePropTypes.map.isRequired,
        orderId: PropTypes.number,
        isOrderCancelled: PropTypes.bool.isRequired,
        isOrderRefunded: PropTypes.bool.isRequired,
    }

    getChildContext() {
        const order = this.props.source || fromJS({})

        const isCancelled = !!order.get('cancelled_at')

        const isRefunded = order.get('financial_status') === 'refunded'

        return {
            order,
            orderId: order.get('id'),
            isOrderCancelled: isCancelled,
            isOrderRefunded: isRefunded,
        }
    }

    render() {
        return this.props.children
    }
}
