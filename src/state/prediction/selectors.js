// @flow
import {createSelector} from 'reselect'
import {fromJS} from 'immutable'

import {getCurrentAccountState} from '../currentAccount/selectors.ts'
import {getCurrentUser} from '../currentUser/selectors'
import {getTicket, getCustomerMessages} from '../ticket/selectors'

export const getContext = createSelector(
    [getCurrentUser, getTicket, getCurrentAccountState, getCustomerMessages],
    (user, ticket, account, customerMessages) => {
        let lastMessageIdFromCustomer = null
        if (customerMessages && !customerMessages.isEmpty()) {
            lastMessageIdFromCustomer = customerMessages
                .sortBy((message) => message.get('created_datetime'))
                .last()
                .get('id')
        }

        let context = fromJS({
            current_user: {
                id: user.get('id') || '',
                email: user.get('email') || '',
                firstname: user.get('firstname') || '',
                lastname: user.get('lastname') || '',
            },
            customer: {
                firstname: ticket.getIn(['customer', 'firstname']) || '',
                lastname: ticket.getIn(['customer', 'lastname']) || '',
                name: ticket.getIn(['customer', 'name']) || '',
                email: ticket.getIn(['customer', 'email']) || '',
            },
            account: {
                domain: account.get('domain'),
            },
        })

        if (ticket && ticket.get('id')) {
            context = context.mergeDeep({
                ticket: {
                    id: ticket.get('id'),
                    last_message_id_from_customer: lastMessageIdFromCustomer,
                },
            })
        }

        // if the customer has a shopify integration get it's last order name
        const integrations = ticket.getIn(['customer', 'integrations'])
        if (integrations) {
            integrations.forEach((integration) => {
                if (
                    integration &&
                    integration.get('__integration_type__') === 'shopify'
                ) {
                    const lastOrder =
                        integration.getIn(['orders', 0]) || fromJS({})
                    if (!lastOrder.isEmpty()) {
                        context = context.mergeDeep({
                            customer: {
                                shopify: {
                                    last_order: {
                                        name: lastOrder.get('name') || null,
                                        tracking_number:
                                            lastOrder.getIn([
                                                'fulfillments',
                                                0,
                                                'tracking_number',
                                            ]) || null,
                                        product_names: lastOrder
                                            .get('line_items')
                                            .map((item) => item.get('name'))
                                            .toJS(),
                                    },
                                },
                            },
                        })
                    }
                }
            })
        }

        return context
    }
)
