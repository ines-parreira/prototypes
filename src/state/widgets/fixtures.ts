import {Widget, WidgetContextType} from 'state/widgets/types'
import {IntegrationType} from 'models/integration/constants'

export const shopifyWidgetFixture: Widget = {
    integration_id: 7,
    deactivated_datetime: null,
    uri: '/api/widgets/70/',
    order: 0,
    context: WidgetContextType.User,
    created_datetime: '2022-07-29T23:19:00.306812+00:00',
    app_id: null,
    template: {
        type: 'wrapper',
        widgets: [
            {
                meta: {},
                path: 'customer',
                type: 'card',
                title: '{{first_name}} {{last_name}}',
                widgets: [
                    {
                        path: 'accepts_marketing',
                        type: 'boolean',
                        title: 'Accepts marketing',
                    },
                    {
                        path: 'accepts_marketing_updated_at',
                        type: 'text',
                        title: 'Accepts marketing updated at',
                    },
                    {
                        path: 'addresses',
                        type: 'array',
                        title: 'Addresses',
                    },
                    {
                        path: 'admin_graphql_api_id',
                        type: 'text',
                        title: 'Admin graphql api id',
                    },
                    {
                        path: 'created_at',
                        type: 'text',
                        title: 'Created at',
                    },
                    {
                        path: 'currency',
                        type: 'text',
                        title: 'Currency',
                    },
                    {
                        path: 'email',
                        type: 'email',
                        title: 'Email',
                    },
                    {
                        path: 'first_name',
                        type: 'text',
                        title: 'First name',
                    },
                    {
                        path: 'id',
                        type: 'text',
                        title: 'Id',
                    },
                    {
                        path: 'last_name',
                        type: 'text',
                        title: 'Last name',
                    },
                    {
                        path: 'last_order_id',
                        type: 'text',
                        title: 'Last order id',
                    },
                    {
                        path: 'last_order_name',
                        type: 'text',
                        title: 'Last order name',
                    },
                    {
                        path: 'marketing_opt_in_level',
                        type: 'text',
                        title: 'Marketing opt in level',
                    },
                    {
                        path: 'multipass_identifier',
                        type: 'text',
                        title: 'Multipass identifier',
                    },
                    {
                        path: 'note',
                        type: 'text',
                        title: 'Note',
                    },
                    {
                        path: 'orders_count',
                        type: 'text',
                        title: 'Orders count',
                    },
                    {
                        path: 'phone',
                        type: 'text',
                        title: 'Phone',
                    },
                    {
                        path: 'sms_marketing_consent',
                        type: 'text',
                        title: 'Sms marketing consent',
                    },
                    {
                        path: 'state',
                        type: 'text',
                        title: 'State',
                    },
                    {
                        path: 'tags',
                        type: 'text',
                        title: 'Tags',
                    },
                    {
                        path: 'tax_exempt',
                        type: 'boolean',
                        title: 'Tax exempt',
                    },
                    {
                        path: 'tax_exemptions',
                        type: 'array',
                        title: 'Tax exemptions',
                    },
                    {
                        path: 'total_spent',
                        type: 'text',
                        title: 'Total spent',
                    },
                    {
                        path: 'updated_at',
                        type: 'text',
                        title: 'Updated at',
                    },
                    {
                        path: 'verified_email',
                        type: 'boolean',
                        title: 'Verified email',
                    },
                ],
            },
        ],
    },
    type: IntegrationType.Shopify,
    id: 70,
    updated_datetime: '2022-08-04T21:55:49.036241+00:00',
}

export const httpWidgetFixture: Widget = {
    integration_id: 14,
    deactivated_datetime: null,
    uri: '/api/widgets/79/',
    order: 5,
    context: WidgetContextType.User,
    created_datetime: '2022-08-05T10:45:53.951255+00:00',
    app_id: null,
    template: {
        type: 'wrapper',
        widgets: [
            {
                path: '',
                type: 'card',
                title: '',
                widgets: [
                    {
                        path: 'foo',
                        type: 'text',
                        title: 'Foo',
                    },
                ],
            },
        ],
    },
    type: IntegrationType.Http,
    id: 79,
    updated_datetime: '2022-08-05T10:45:53.951259+00:00',
}

export const externalDataWidgetFixture: Widget = {
    integration_id: null,
    deactivated_datetime: null,
    uri: '/api/widgets/72/',
    order: 1,
    context: WidgetContextType.User,
    created_datetime: '2022-08-02T15:37:05.230566+00:00',
    app_id: '6193d9874c836e5cace49e11',
    template: {
        type: 'wrapper',
        widgets: [
            {
                meta: {},
                path: '',
                type: 'card',
                title: '',
                widgets: [
                    {
                        path: 'id',
                        type: 'text',
                        title: 'Id',
                    },
                    {
                        path: 'name',
                        type: 'text',
                        title: 'Name',
                    },
                    {
                        path: 'ppu',
                        type: 'text',
                        title: 'Ppu',
                    },
                    {
                        path: 'type',
                        type: 'text',
                        title: 'Type',
                    },
                    {
                        path: 'batters',
                        type: 'card',
                        title: 'Batters',
                        widgets: [
                            {
                                path: 'batter',
                                type: 'list',
                                widgets: [
                                    {
                                        type: 'card',
                                        title: 'Batter',
                                        widgets: [
                                            {
                                                path: 'id',
                                                type: 'text',
                                                title: 'Id',
                                            },
                                            {
                                                path: 'type',
                                                type: 'text',
                                                title: 'Type',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        path: 'toppings',
                        type: 'list',
                        widgets: [
                            {
                                type: 'card',
                                title: 'Toppings',
                                widgets: [
                                    {
                                        path: 'id',
                                        type: 'text',
                                        title: 'Id',
                                    },
                                    {
                                        path: 'type',
                                        type: 'text',
                                        title: 'Type',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    type: 'customer_external_data',
    id: 72,
    updated_datetime: '2022-08-04T17:49:53.343764+00:00',
}
