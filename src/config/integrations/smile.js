//@flow
import {SMILE_INTEGRATION_TYPE} from '../../constants/integration'

export const MACRO_VARIABLES = {
    type: SMILE_INTEGRATION_TYPE,
    integration: true,
    name: 'Smile',
    children: [{
        name: 'Points balance',
        value: '{{ticket.customer.integrations.smile.customer.points_balance}}',
    }, {
        name: 'Referral URL',
        value: '{{ticket.customer.integrations.smile.customer.referral_url}}',
    }, {
        name: 'Customer state',
        value: '{{ticket.customer.integrations.smile.customer.state}}',
    }, {
        name: 'Vip tier',
        value: '{{ticket.customer.integrations.smile.customer.vip_tier.name}}',
    }]
}
