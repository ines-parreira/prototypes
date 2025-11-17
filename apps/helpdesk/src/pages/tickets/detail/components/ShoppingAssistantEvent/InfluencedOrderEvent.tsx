import cn from 'classnames'

import type { ShoppingAssistantEvent } from '../../hooks/useInsertShoppingAssistantEventElements'
import { InfluencedOrderSource } from '../../hooks/useInsertShoppingAssistantEventElements'

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
                <ViaSource influencedBy={event.data.influencedBy} />
            </div>
        </div>
    </div>
)

interface ViaSourceProps {
    influencedBy: InfluencedOrderSource
}

const influencedByLabel = (influencedBy: InfluencedOrderSource): string => {
    switch (influencedBy) {
        case InfluencedOrderSource.AI_JOURNEY:
            return 'AI Journey'
        case InfluencedOrderSource.SHOPPING_ASSISTANT:
        case InfluencedOrderSource.AI_AGENT:
            return 'Shopping Assistant'
    }
}
const ViaSource = ({ influencedBy }: ViaSourceProps) => (
    <div className={css.viaShoppingAssistant}>
        via{' '}
        <i className={cn('material-icons', css.awesomeIcon)}>auto_awesome</i>{' '}
        {influencedByLabel(influencedBy)}
    </div>
)
