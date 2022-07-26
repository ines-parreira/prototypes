import {IntegrationType} from '../../models/integration/types'

export const MACRO_VARIABLES = {
    type: IntegrationType.BigCommerce,
    name: 'BigCommerce',
    integration: true,
    children: [
        {
            name: 'Number of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].id}}',
        },
        {
            name: 'Date of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].date_created|datetime_format("MMMM d YYYY")}}',
        },
        {
            name: 'Tracking url of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_order_shipments[0].tracking_link}}',
        },
        {
            name: 'Tracking number of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_order_shipments[0].tracking_number}}',
        },
        {
            name: 'Status of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].status}}',
        },
        {
            name: 'Shipping date of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].date_shipped|datetime_format("MMMM d YYYY")}}',
        },
        {
            name: 'Destination country of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].country}}',
        },
        {
            name: 'Shipping address of last order',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].street_1}} {{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].street_2}}, {{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].zip}} {{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].city}} {{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].state}}',
        },
    ],
}

export const MACRO_HIDDEN_VARIABLES = {
    type: IntegrationType.BigCommerce,
    name: 'BigCommerce',
    integration: true,
    children: [
        {
            name: 'Street 1',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].street_1}}',
        },
        {
            name: 'Street 2',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].street_2}}',
        },
        {
            name: 'Zip code',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].zip}}',
        },
        {
            name: 'City',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].city}}',
        },
        {
            name: 'State',
            value: '{{ticket.customer.integrations.bigcommerce.orders[0].bc_shipping[0].state}}',
        },
    ],
}
