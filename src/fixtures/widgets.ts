import {IntegrationType} from '../models/integration/types'
import {
    Widget,
    WidgetContextType,
    WidgetTemplateType,
    WidgetTemplateWidgetType,
} from '../state/widgets/types'

export const shopifyWidget: Widget = {
    deleted_datetime: null,
    integration_id: null,
    deactivated_datetime: null,
    uri: '/api/widgets/2/',
    order: 0,
    context: WidgetContextType.Ticket,
    created_datetime: '2017-08-17T22:46:50.922473+00:00',
    template: {
        type: WidgetTemplateType.Wrapper,
        widgets: [
            {
                path: 'customer',
                widgets: [
                    {
                        path: 'created_at',
                        type: WidgetTemplateWidgetType.Date,
                        title: 'Created at',
                    },
                ],
                type: WidgetTemplateWidgetType.Card,
                title: '{first_name} {last_name}',
            },
            {
                path: 'orders',
                meta: {
                    limit: '2',
                    orderBy: '',
                },
                type: WidgetTemplateWidgetType.List,
                widgets: [
                    {
                        widgets: [
                            {
                                path: 'id',
                                type: WidgetTemplateWidgetType.Text,
                                title: 'Id',
                            },
                            {
                                path: 'created_at',
                                type: WidgetTemplateWidgetType.Date,
                                title: 'Created at',
                            },
                            {
                                path: 'fulfillments',
                                meta: {
                                    limit: '',
                                    orderBy: '',
                                },
                                type: WidgetTemplateWidgetType.List,
                                widgets: [
                                    {
                                        widgets: [
                                            {
                                                path: 'tracking_url',
                                                type:
                                                    WidgetTemplateWidgetType.Url,
                                                title: 'Tracking url',
                                            },
                                            {
                                                path: 'tracking_number',
                                                type:
                                                    WidgetTemplateWidgetType.Text,
                                                title: 'Tracking number',
                                            },
                                        ],
                                        meta: {
                                            link: '{tracking_url}',
                                        },
                                        type: WidgetTemplateWidgetType.Card,
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
                                type: WidgetTemplateWidgetType.List,
                                widgets: [
                                    {
                                        widgets: [
                                            {
                                                path: 'processed_at',
                                                type:
                                                    WidgetTemplateWidgetType.Date,
                                                title: 'Processed at',
                                            },
                                            {
                                                path: 'refund_line_items',
                                                meta: {
                                                    limit: '',
                                                    orderBy: '',
                                                },
                                                type:
                                                    WidgetTemplateWidgetType.List,
                                                widgets: [
                                                    {
                                                        widgets: [
                                                            {
                                                                path:
                                                                    'subtotal',
                                                                type:
                                                                    WidgetTemplateWidgetType.Text,
                                                                title:
                                                                    'Subtotal',
                                                            },
                                                        ],
                                                        meta: {
                                                            link: '',
                                                        },
                                                        type:
                                                            WidgetTemplateWidgetType.Card,
                                                        title:
                                                            '{quantity} × {line_item.name}',
                                                    },
                                                ],
                                            },
                                        ],
                                        meta: {
                                            link: '',
                                        },
                                        type: WidgetTemplateWidgetType.Card,
                                        title: ':refund: Refund',
                                    },
                                ],
                            },
                            {
                                path: 'shipping_address',
                                widgets: [
                                    {
                                        path: 'address1',
                                        type: WidgetTemplateWidgetType.Text,
                                        title: 'Address1',
                                    },
                                    {
                                        path: 'address2',
                                        type: WidgetTemplateWidgetType.Text,
                                        title: 'Address2',
                                    },
                                    {
                                        path: 'city',
                                        type: WidgetTemplateWidgetType.Text,
                                        title: 'City',
                                    },
                                    {
                                        path: 'country',
                                        type: WidgetTemplateWidgetType.Text,
                                        title: 'Country',
                                    },
                                    {
                                        path: 'province_code',
                                        type: WidgetTemplateWidgetType.Text,
                                        title: 'Province code',
                                    },
                                    {
                                        path: 'zip',
                                        type: WidgetTemplateWidgetType.Text,
                                        title: 'Zip',
                                    },
                                ],
                                meta: {
                                    link: '',
                                },
                                type: WidgetTemplateWidgetType.Card,
                                title: ':shipping_address: Shipping address',
                            },
                            {
                                path: 'line_items',
                                meta: {
                                    limit: '',
                                    orderBy: '',
                                },
                                type: WidgetTemplateWidgetType.List,
                                widgets: [
                                    {
                                        widgets: [
                                            {
                                                path: 'price',
                                                type:
                                                    WidgetTemplateWidgetType.Text,
                                                title: 'Price',
                                            },
                                            {
                                                path: 'sku',
                                                type:
                                                    WidgetTemplateWidgetType.Text,
                                                title: 'Sku',
                                            },
                                        ],
                                        meta: {
                                            link: '',
                                        },
                                        type: WidgetTemplateWidgetType.Card,
                                        title: ':product: {quantity} × {name}',
                                    },
                                ],
                            },
                        ],
                        meta: {
                            displayCard: true,
                            link: '',
                        },
                        type: WidgetTemplateWidgetType.Card,
                        title: 'Order {name}',
                    },
                ],
            },
        ],
    },
    type: IntegrationType.Shopify,
    id: 2,
    updated_datetime: '2017-08-17T23:33:46.991886+00:00',
}
