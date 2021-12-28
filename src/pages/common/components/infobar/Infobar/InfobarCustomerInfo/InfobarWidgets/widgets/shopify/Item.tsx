import React, {
    ContextType,
    createContext,
    FunctionComponent,
    useContext,
} from 'react'
import {fromJS, List, Map} from 'immutable'
import {Badge} from 'reactstrap'

import {OrderContext} from './Order/OrderWidget'

export default function Item() {
    return {
        BeforeContent,
        Wrapper,
    }
}

const OrderItemContext = createContext<{
    refundedQuantity: number | null
}>({
    refundedQuantity: null,
})

class BeforeContent extends React.Component {
    static contextType = OrderItemContext
    context!: ContextType<typeof OrderItemContext>
    render() {
        const {refundedQuantity} = this.context

        if (!refundedQuantity) {
            return null
        }

        return (
            <div className="simple-field">
                <span className="field-label">Refunded:</span>
                <span className="field-value">
                    <Badge pill color="warning">
                        {refundedQuantity} item{refundedQuantity > 1 && 's'}
                    </Badge>
                </span>
            </div>
        )
    }
}

const Wrapper: FunctionComponent<{source: Map<string, unknown>}> = ({
    source: item,
    children,
}) => {
    const {order} = useContext(OrderContext)
    const itemId = item.get('id') as number
    const refunds = order.get('refunds', fromJS([])) as List<any>

    const refundedQuantity = refunds
        .map((refund: Map<string, unknown>) => {
            // keep refund items information about current item
            return (
                refund.get('refund_line_items', fromJS([])) as List<any>
            ).filter(
                (lineItem: Map<string, number>) =>
                    lineItem.get('line_item_id').toString() ===
                    itemId.toString()
            )
        })
        .filter((refundedItemInfo) =>
            typeof refundedItemInfo === 'undefined'
                ? false
                : !refundedItemInfo.isEmpty()
        ) // remove falsey data
        .flatten(true) // flatten all those refund info in one List
        .reduce((total = 0, refund: Map<string, number>) => {
            // sum all refunded quantities
            return total + refund.get('quantity')
        }, 0)

    return (
        <OrderItemContext.Provider
            value={{
                refundedQuantity,
            }}
        >
            {children}
        </OrderItemContext.Provider>
    )
}
