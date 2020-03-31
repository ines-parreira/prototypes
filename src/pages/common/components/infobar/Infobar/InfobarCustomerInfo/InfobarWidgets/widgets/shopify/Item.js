import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {fromJS} from 'immutable'
import {Badge} from 'reactstrap'

export default function Item() {
    return {
        BeforeContent,
        Wrapper,
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
                    .filter((lineItem) => lineItem.get('line_item_id').toString() === itemId.toString())
            })
            .filter((refundedItemInfo) => !refundedItemInfo.isEmpty()) // remove falsey data
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
