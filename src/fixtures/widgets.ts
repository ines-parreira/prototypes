import { IntegrationType } from 'models/integration/constants'
import { CardTemplate, LeafTemplate, ListTemplate } from 'models/widget/types'
import { Widget, WidgetEnvironment } from 'state/widgets/types'

export const cardTemplate: CardTemplate = {
    widgets: [
        {
            path: 'id',
            type: 'text',
            title: 'Id',
        },
        {
            path: 'created_at',
            type: 'date',
            title: 'Created at',
        },
        {
            path: 'fulfillments',
            meta: {
                limit: '',
                orderBy: '',
            },
            type: 'list',
            widgets: [
                {
                    widgets: [
                        {
                            path: 'tracking_url',
                            type: 'url',
                            title: 'Tracking url',
                        },
                        {
                            path: 'tracking_number',
                            type: 'text',
                            title: 'Tracking number',
                        },
                    ],
                    meta: {
                        link: '{tracking_url}',
                    },
                    type: 'card',
                    title: ':shipment_status: Shipment',
                },
            ],
        },
        {
            path: 'refunds',
            meta: {
                limit: '',
                orderBy: '',
            },
            type: 'list',
            widgets: [
                {
                    widgets: [
                        {
                            path: 'processed_at',
                            type: 'date',
                            title: 'Processed at',
                        },
                        {
                            path: 'refund_line_items',
                            meta: {
                                limit: '',
                                orderBy: '',
                            },
                            type: 'list',
                            widgets: [
                                {
                                    widgets: [
                                        {
                                            path: 'subtotal',
                                            type: 'text',
                                            title: 'Subtotal',
                                        },
                                    ],
                                    meta: {
                                        link: '',
                                    },
                                    type: 'card',
                                    title: '{quantity} × {line_item.name}',
                                },
                            ],
                        },
                    ],
                    meta: {
                        link: '',
                    },
                    type: 'card',
                    title: ':refund: Refund',
                },
            ],
        },
        {
            path: 'shipping_address',
            widgets: [
                {
                    path: 'address1',
                    type: 'text',
                    title: 'Address1',
                },
                {
                    path: 'address2',
                    type: 'text',
                    title: 'Address2',
                },
                {
                    path: 'city',
                    type: 'text',
                    title: 'City',
                },
                {
                    path: 'country',
                    type: 'text',
                    title: 'Country',
                },
                {
                    path: 'province_code',
                    type: 'text',
                    title: 'Province code',
                },
                {
                    path: 'zip',
                    type: 'text',
                    title: 'Zip',
                },
            ],
            meta: {
                link: '',
            },
            type: 'card',
            title: ':shipping_address: Shipping address',
        },
        {
            path: 'line_items',
            meta: {
                limit: '',
                orderBy: '',
            },
            type: 'list',
            widgets: [
                {
                    widgets: [
                        {
                            path: 'price',
                            type: 'text',
                            title: 'Price',
                        },
                        {
                            path: 'sku',
                            type: 'text',
                            title: 'Sku',
                        },
                    ],
                    meta: {
                        link: '',
                    },
                    type: 'card',
                    title: ':product: {quantity} × {name}',
                },
            ],
        },
    ],
    meta: {
        displayCard: true,
        link: 'https://www.kma.com',
    },
    type: 'card',
    title: 'Order {name}',
    templatePath: '0.template.widgets.1.widgets.0',
}

export const listTemplate: ListTemplate = {
    path: 'orders',
    type: 'list',
    widgets: [cardTemplate],
    meta: {
        limit: '2',
        orderBy: '',
    },
    templatePath: '0.template.widgets.1',
}

export const shopifyWidget: Widget = {
    integration_id: null,
    deactivated_datetime: null,
    uri: '/api/widgets/2/',
    order: 0,
    context: WidgetEnvironment.Ticket,
    created_datetime: '2017-08-17T22:46:50.922473+00:00',
    template: {
        type: 'wrapper',
        widgets: [
            {
                path: 'customer',
                widgets: [
                    {
                        path: 'created_at',
                        type: 'date',
                        title: 'Created at',
                    },
                ],
                type: 'card',
                title: '{first_name} {last_name}',
            } as CardTemplate,
            listTemplate,
        ],
    },
    type: IntegrationType.Shopify,
    id: 2,
    updated_datetime: '2017-08-17T23:33:46.991886+00:00',
}

export const idTemplate: LeafTemplate = {
    path: 'id',
    type: 'text',
    title: 'Id',
    templatePath: '0.template.widgets.0.widgets.0',
}
