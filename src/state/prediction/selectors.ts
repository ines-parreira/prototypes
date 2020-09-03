import {createSelector} from 'reselect'
import {fromJS, Map, List} from 'immutable'

import {getCurrentAccountState} from '../currentAccount/selectors'
import {CurrentAccountState} from '../currentAccount/types'
import {getCurrentUser} from '../currentUser/selectors'
import {CurrentUserState} from '../currentUser/types'
import {getTicket, getCustomerMessages} from '../ticket/selectors'
import {RootState} from '../types'

import {PredictionContext} from './types'

export const getContext = createSelector<
    RootState,
    PredictionContext,
    CurrentUserState,
    Map<any, any>,
    CurrentAccountState,
    List<any>
>(
    getCurrentUser,
    getTicket,
    getCurrentAccountState,
    getCustomerMessages,
    (user, ticket, account, customerMessages) => {
        let lastMessageIdFromCustomer = null
        if (customerMessages && !customerMessages.isEmpty()) {
            lastMessageIdFromCustomer = ((customerMessages.sortBy(
                (message: Map<any, any>) =>
                    message.get('created_datetime') as string
            ) as List<any>).last() as Map<any, any>).get('id') as number
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
        }) as Map<any, any>

        if (ticket && ticket.get('id')) {
            context = context.mergeDeep({
                ticket: {
                    id: ticket.get('id'),
                    last_message_id_from_customer: lastMessageIdFromCustomer,
                },
            })
        }

        // if the customer has a shopify integration get it's last order name
        const integrations = ticket.getIn(['customer', 'integrations']) as List<
            any
        >
        if (integrations) {
            integrations.forEach((integration: Map<any, any>) => {
                if (
                    integration &&
                    integration.get('__integration_type__') === 'shopify'
                ) {
                    const lastOrder = (integration.getIn(['orders', 0]) ||
                        fromJS({})) as Map<any, any>
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
                                        product_names: ((lastOrder.get(
                                            'line_items'
                                        ) as List<any>).map(
                                            (item: Map<any, any>) =>
                                                item.get('name') as string
                                        ) as List<any>).toJS(),
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
