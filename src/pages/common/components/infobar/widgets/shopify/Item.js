import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'
import {Badge} from 'reactstrap'

import ActionButtonsGroup from '../ActionButtonsGroup'

export default () => { // eslint-disable-line
    return {
        AfterTitle, // eslint-disable-line
        BeforeContent, // eslint-disable-line
        Wrapper, // eslint-disable-line
    }
}

class AfterTitle extends React.Component { // eslint-disable-line
    static propTypes = {
        isEditing: PropTypes.bool.isRequired,
        source: ImmutablePropTypes.map.isRequired,
    }

    static contextTypes = {
        integrationId: PropTypes.number,
        orderId: PropTypes.number,
        refundedQuantity: PropTypes.number.isRequired,
    }

    render() {
        const {source} = this.props

        if (this.props.isEditing) {
            return null
        }

        if (!this.context.integrationId) {
            return null
        }

        const quantity = source.get('quantity') - this.context.refundedQuantity

        const payload = {
            item_id: source.get('id'),
            order_id: this.context.orderId,
            quantity,
        }

        if (quantity <= 0) {
            return null
        }

        let actions = [
            {
                key: 'refund',
                tooltip: 'This will send an email to the customer.',
                options: [
                    {
                        value: 'shopifyRefundOrderItem',
                        label: 'Refund item(s)',
                        parameters: [
                            {
                                name: 'quantity',
                                type: 'number',
                                defaultValue: quantity,
                                placeholder: 'Quantity',
                                required: true,
                                min: 1,
                                max: quantity
                            },
                            {
                                name: 'restock',
                                type: 'checkbox',
                                defaultValue: false,
                                label: 'Restock items'
                            }
                        ]
                    }
                ],
                title: (
                    <div>
                        <i className="fa fa-fw fa-repeat mr-2" />
                        Refund item
                    </div>
                ),
                child: (
                    <div>
                        <i className="fa fa-fw fa-repeat mr-2" />
                        Refund
                    </div>
                )
            }
        ]

        return (
            <ActionButtonsGroup
                actions={actions}
                payload={payload}
            />
        )
    }
}

class BeforeContent extends React.Component { // eslint-disable-line
    static contextTypes = {
        refundedQuantity: PropTypes.number.isRequired,
    }

    render() {
        const {refundedQuantity} = this.context

        if (!refundedQuantity) {
            return null
        }

        return (
            <div className="simple-field">
                <span className="field-label">
                    Refunded:
                </span>
                <span className="field-value">
                    <Badge color="warning">
                        {refundedQuantity} item{refundedQuantity > 1 && 's'}
                    </Badge>
                </span>
            </div>
        )
    }
}

class Wrapper extends React.Component { // eslint-disable-line
    static propTypes = {
        children: PropTypes.node,
        source: ImmutablePropTypes.map.isRequired,
    }

    static contextTypes = {
        order: ImmutablePropTypes.map.isRequired,
    }

    static childContextTypes = {
        refundedQuantity: PropTypes.number.isRequired,
    }

    getChildContext() {
        const item = this.props.source || fromJS({})

        const itemId = item.get('id')
        const refunds = this.context.order.get('refunds', fromJS([]))

        const refundedQuantity = refunds
            .map((refund) => { // keep refund items information about current item
                return refund
                    .get('refund_line_items', fromJS([]))
                    .filter(lineItem => lineItem.get('line_item_id').toString() === itemId.toString())
            })
            .filter(refundedItemInfo => !refundedItemInfo.isEmpty()) // remove falsey data
            .flatten(true) // flatten all those refund info in one List
            .reduce((total, refund) => { // sum all refunded quantities
                return total + refund.get('quantity')
            }, 0)

        return {
            refundedQuantity,
        }
    }

    render() {
        return this.props.children
    }
}

