import bigCommerceEvent from './bigcommerce'
import rechargeEvent from './recharge'
import shopifyEvent from './shopify'
import {eventMaker, integrationEvent} from './types'

export const eventMatcher = (
    eventData: eventMaker
): integrationEvent | undefined => {
    const {integration} = eventData
    const integrationType = integration.get('type')

    switch (integrationType) {
        case 'shopify': {
            return shopifyEvent(eventData)
        }
        case 'recharge': {
            return rechargeEvent(eventData)
        }
        case 'bigcommerce': {
            return bigCommerceEvent(eventData)
        }
    }
}
