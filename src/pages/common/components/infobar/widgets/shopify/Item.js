import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

import ActionButton from '../ActionButton'

export default () => { // eslint-disable-line
    return {
        AfterTitle, // eslint-disable-line
        BeforeContent, // eslint-disable-line
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
    }

    render() {
        const {source} = this.props

        if (this.props.isEditing) {
            return null
        }

        if (!this.context.integrationId) {
            return null
        }

        const quantity = source.get('fulfillable_quantity')

        const payload = {
            item_id: source.get('id'),
            order_id: this.context.orderId,
            quantity,
        }

        if (quantity <= 0) {
            return null
        }

        return (
            <div className="action-buttons">
                <ActionButton
                    tag="button"
                    className="ui button basic action-button"
                    actionName="shopifyRefundOrderItem"
                    reason={`refund ${source.get('name')}`}
                    payload={{
                        ...payload,
                        quantity: 1,
                    }}
                >
                    <i className="repeat icon" />
                    Refund one
                </ActionButton>
                {
                    quantity > 1 && (
                        <ActionButton
                            key="all"
                            tag="button"
                            className="ui button basic action-button"
                            actionName="shopifyRefundOrderItem"
                            reason={`refund ${quantity} ${source.get('name')}`}
                            payload={payload}
                        >
                            <i className="repeat icon" />
                            Refund {quantity}
                        </ActionButton>
                    )
                }
            </div>
        )
    }
}

class BeforeContent extends React.Component { // eslint-disable-line
    static propTypes = {
        source: ImmutablePropTypes.map.isRequired,
    }

    render() {
        const {source} = this.props

        const fulfillableQuantity = source.get('fulfillable_quantity')
        const quantity = source.get('quantity')
        const refundedQuantity = quantity - fulfillableQuantity

        if (!refundedQuantity) {
            return null
        }

        return (
            <div className="simple-field">
                <span className="field-label">
                    Refunded:
                </span>
                <span className="field-value">
                    <span className="ui mini yellow label mr5i">
                        {refundedQuantity} item{refundedQuantity > 1 && 's'}
                        </span>
                </span>
            </div>
        )
    }
}
