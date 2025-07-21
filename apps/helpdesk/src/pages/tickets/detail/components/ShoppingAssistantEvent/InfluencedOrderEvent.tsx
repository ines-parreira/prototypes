import cn from 'classnames'

import { ShoppingAssistantEvent } from '../../hooks/useInsertShoppingAssistantEventElements'

import cssEvent from '../Event.less'
import css from './InfluencedOrderEvent.less'

type Props = {
    event: ShoppingAssistantEvent
    isLast: boolean
}

export const InfluencedOrderEvent = ({ event, isLast }: Props) => (
    <div
        className={cn(cssEvent.component, {
            [css.last]: isLast,
        })}
    >
        <div className={cssEvent.event}>
            <div className={cssEvent.content}>
                <div className={cssEvent.icon}>
                    <i className="material-icons">shopping_cart</i>
                </div>
                <span className={cssEvent.actionName}>
                    <a
                        className={css.orderLink}
                        href={`https://admin.shopify.com/store/${event.data.shopName}/orders/${event.data.orderId}`}
                        target="_blank"
                    >
                        Order #{event.data.orderNumber}
                    </a>{' '}
                    influenced
                </span>
                <ViaShoppingAssistant />
            </div>
        </div>
    </div>
)

const ViaShoppingAssistant = () => (
    <div className={css.viaShoppingAssistant}>
        via{' '}
        <i className={cn('material-icons', css.awesomeIcon)}>auto_awesome</i>{' '}
        Shopping Assistant
    </div>
)
