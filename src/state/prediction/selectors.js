// @flow
import {createSelector} from 'reselect'
import {fromJS} from 'immutable'

import {getCurrentUser} from '../currentUser/selectors'
import {getTicket} from '../ticket/selectors'

export const getContext = createSelector(
    [getCurrentUser, getTicket],
    (user, ticket) => {
        let context = fromJS({
            current_user: {
                firstname: user.get('firstname') || '',
                lastname: user.get('lastname') || '',
                email: user.get('email') || '',
            },
            customer: {
                firstname: ticket.getIn(['customer', 'firstname']) || '',
                lastname: ticket.getIn(['customer', 'lastname']) || '',
                name: ticket.getIn(['customer', 'name']) || '',
                email: ticket.getIn(['customer', 'email']) || '',

            }
        })

        // if the customer has a shopify integration get it's last order name
        const integrations = ticket.getIn(['customer', 'integrations'])
        if (integrations) {
            integrations.forEach((integration) => {
                if (integration && integration.get('__integration_type__') === 'shopify') {
                    const lastOrderName = integration.getIn(['customer', 'last_order_name']) || ''
                    if (lastOrderName) {
                        context = context.mergeDeep({
                            customer: {
                                shopify: {
                                    last_order_name: lastOrderName
                                }
                            }
                        })
                    }
                }
            })
        }

        return context
    }
)
