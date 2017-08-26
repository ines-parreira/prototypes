export const currentUser = {
    lastname: 'Plugaru',
    settings: [
        {
            data: {
                1: {
                    hide: false,
                    display_order: 2
                },
                2: {
                    hide: true,
                    display_order: 3
                },
                3: {
                    hide: true,
                    display_order: 1
                },
                4: {
                    hide: true,
                    display_order: 3
                },
                5: {
                    hide: true,
                    display_order: 7
                },
                6: {
                    hide: true,
                    display_order: 5
                },
                7: {
                    hide: true,
                    display_order: 6
                },
                8: {
                    hide: true,
                    display_order: 8
                },
                9: {
                    hide: true,
                    display_order: 6
                },
                10: {
                    hide: false,
                    display_order: 1
                },
                11: {
                    hide: true,
                    display_order: 6
                },
                12: {
                    hide: true,
                    display_order: 4
                }
            },
            id: 1,
            type: 'ticket-views'
        },
        {
            data: {
                13: {
                    display_order: 1,
                    hide: false
                },
                14: {
                    display_order: 2,
                    hide: false
                },
                15: {
                    display_order: 2,
                    hide: false
                }
            },
            id: 2,
            type: 'user-views'
        },
        {
            data: {
                show_macros: true,
                available_for_chat: true,
                hide_tips: true,
            },
            id: 3,
            type: 'preferences'
        }
    ],
    meta: null,
    active: true,
    deactivated_datetime: null,
    name: 'Alex Plugaru',
    auths: [
        {
            data: {
                token: 'f4eea0ca3ba4c6bd4109ef440b293dcdcc41c570fb434ef999dc47577fd24d23'
            },
            type: 'api_key'
        }
    ],
    account_id: 1,
    external_id: '2',
    channels: [
        {
            address: '@humanfromearth',
            created_datetime: '2016-12-22T19:36:12.542241+00:00',
            id: 3,
            preferred: true,
            type: 'twitter',
            updated_datetime: '2016-12-22T19:36:12.542251+00:00',
            user: {
                id: 2,
                name: 'Alex Plugaru'
            }
        },
        {
            address: 'alex@gorgias.io',
            created_datetime: '2016-12-22T19:36:12.558896+00:00',
            id: 4,
            preferred: true,
            type: 'email',
            updated_datetime: '2016-12-22T19:36:12.558905+00:00',
            user: {
                id: 2,
                name: 'Alex Plugaru'
            }
        },
        {
            address: 'support@gorgias.gorgias.io',
            created_datetime: '2016-12-22T19:36:12.581514+00:00',
            id: 5,
            preferred: false,
            type: 'email',
            updated_datetime: '2016-12-22T19:36:12.581523+00:00',
            user: {
                id: 2,
                name: 'Alex Plugaru'
            }
        },
        {
            address: 'support@gorgias.io',
            created_datetime: '2016-12-22T19:36:12.602904+00:00',
            id: 6,
            preferred: false,
            type: 'email',
            updated_datetime: '2016-12-22T19:36:12.602914+00:00',
            user: {
                id: 2,
                name: 'Alex Plugaru'
            }
        },
        {
            address: '4561237890',
            created_datetime: '2016-12-22T19:36:12.625121+00:00',
            id: 7,
            preferred: true,
            type: 'facebook',
            updated_datetime: '2016-12-22T19:36:12.625131+00:00',
            user: {
                id: 2,
                name: 'Alex Plugaru'
            }
        }
    ],
    signature_html: null,
    created_datetime: '2016-12-22T19:36:12.487448+00:00',
    signature_text: null,
    country: 'US',
    language: 'en',
    timezone: 'EST',
    id: 2,
    firstname: 'Alex',
    email: 'alex@gorgias.io',
    roles: [
        {
            id: 2,
            name: 'agent'
        },
        {
            id: 3,
            name: 'admin'
        },
        {
            id: 4,
            name: 'staff'
        }
    ],
    customer: null,
    updated_datetime: '2016-12-22T19:36:12.489432+00:00'
}

export const userSetting = {
    id: 1,
    type: 'ticket-views',
    data: {
        183: {
            hide: true,
            display_order: 1
        },
        93: {
            hide: true,
            display_order: 2
        },
        38: {
            hide: true,
            display_order: 3
        },
        234: {
            hide: true,
            display_order: 4
        },
        4: {
            hide: true,
            display_order: 5
        }
    }
}

export const agents = [
    {
        lastname: 'Support',
        active: true,
        deactivated_datetime: null,
        name: 'Acme Support',
        external_id: '1',
        created_datetime: '2017-07-31T21:43:05.483835+00:00',
        id: 1,
        firstname: 'Acme',
        email: 'support@acme.gorgias.io',
        roles: [
            {
                name: 'agent',
                id: 2
            },
            {
                name: 'admin',
                id: 3
            },
            {
                name: 'staff',
                id: 4
            }
        ],
        updated_datetime: '2017-07-31T21:43:05.502541+00:00'
    },
    {
        lastname: 'Smith',
        active: true,
        deactivated_datetime: null,
        name: 'Bob Smith',
        external_id: '2',
        created_datetime: '2017-07-31T21:43:08.027035+00:00',
        id: 2,
        firstname: 'Bob',
        email: 'agent-smith@gorgias.io',
        roles: [
            {
                name: 'agent',
                id: 2
            }
        ],
        updated_datetime: '2017-07-31T21:43:08.033390+00:00'
    }
]

export const agentsLocation = [
    {
        users: [
            '1',
            '2'
        ],
        ticket: '1'
    },
    {
        users: [
            '1'
        ],
        ticket: '2'
    }
]

export const agentsTypingStatus = [
    {
        users: [
            '1',
            '2'
        ],
        ticket: '1'
    },
    {
        users: [
            '1'
        ],
        ticket: '2'
    }
]

export const user = {
    lastname: 'Bon',
    meta: null,
    active: true,
    deactivated_datetime: null,
    name: 'Jean Bon',
    external_id: null,
    channels: [
        {
            user: {
                name: 'Jean Bon',
                id: 34
            },
            deleted_datetime: null,
            type: 'email',
            address: 'jeanbon@gorgias.io',
            id: 55,
            updated_datetime: '2017-07-31T21:45:03.399828+00:00',
            preferred: true,
            created_datetime: '2017-07-31T21:45:03.399819+00:00'
        },
        {
            user: {
                name: 'Jean Bon',
                id: 34
            },
            deleted_datetime: null,
            type: 'phone',
            address: '+1 415-548-9999',
            id: 56,
            updated_datetime: '2017-07-31T21:45:03.416976+00:00',
            preferred: true,
            created_datetime: '2017-07-31T21:45:03.416965+00:00'
        }
    ],
    created_datetime: '2017-07-31T21:45:03.382498+00:00',
    id: 34,
    firstname: 'Jean',
    email: 'jeanbon@gorgias.io',
    roles: [
        {
            name: 'user',
            id: 1
        }
    ],
    customer: null,
    integrations: {
        '2': {
            url: 'https://httpbin.org/get?name=Jean Bon',
            origin: '199.188.194.25',
            args: {
                name: 'Jean Bon'
            },
            __integration_type__: 'http',
            headers: {
                Host: 'httpbin.org',
                'Content-Type': 'application/json',
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate',
                'User-Agent': 'python-requests/2.14.2',
                Connection: 'close'
            }
        },
        '5': {
            customer: {
                addresses: [
                    {
                        'default': false,
                        zip: '75012',
                        city: 'Paris',
                        name: 'Jean Bon',
                        phone: '',
                        province: 'Ile de France',
                        country_name: 'France',
                        last_name: 'Bon',
                        country_code: 'FR',
                        country: 'France',
                        first_name: 'Jean',
                        id: 4665556619,
                        customer_id: 4279837195,
                        province_code: null,
                        company: 'Fleury Michon',
                        address1: '3 rue des volailles',
                        address2: ''
                    }
                ],
                last_order_name: '#1202',
                verified_email: true,
                created_at: '2017-03-17T21:26:16-04:00',
                phone: '+14155489999',
                state: 'disabled',
                accepts_marketing: false,
                note: 'Un grand jambon',
                total_spent: '131.50',
                tax_exempt: false,
                last_name: 'Bon',
                orders_count: 80,
                last_order_id: 4236385803,
                default_address: {
                    'default': true,
                    zip: '75012',
                    city: 'Paris',
                    name: 'Jean Bon',
                    phone: null,
                    province: 'Ile de France',
                    country_name: 'France',
                    last_name: 'Bon',
                    country_code: 'FR',
                    country: 'France',
                    first_name: 'Jean',
                    id: 4797217995,
                    customer_id: 4279837195,
                    province_code: null,
                    company: 'Fleury Michon',
                    address1: '12 rue du poisson cru',
                    address2: 'unit 3'
                },
                updated_at: '2017-07-12T20:44:14-04:00',
                tags: 'Active Subscriber',
                first_name: 'Jean',
                id: 4279837195,
                email: 'jeanbon@gorgias.io',
                multipass_identifier: null
            },
            orders: [
                {
                    checkout_token: null,
                    cancelled_at: null,
                    taxes_included: true,
                    landing_site_ref: null,
                    shipping_address: {
                        zip: '75012',
                        city: 'Paris',
                        name: 'Jean Bon',
                        latitude: 48.8293647,
                        phone: null,
                        longitude: 2.4265406,
                        province: 'Ile de France',
                        last_name: 'Bon',
                        country_code: 'FR',
                        country: 'France',
                        first_name: 'Jean',
                        province_code: null,
                        company: 'Fleury Michon',
                        address1: '12 rue du poisson cru',
                        address2: 'unit 3'
                    },
                    gateway: 'manual',
                    processed_at: '2017-07-12T16:14:09-04:00',
                    device_id: null,
                    note_attributes: [],
                    location_id: null,
                    buyer_accepts_marketing: false,
                    closed_at: null,
                    financial_status: 'paid',
                    discount_codes: [],
                    number: 202,
                    cancel_reason: null,
                    created_at: '2017-07-12T16:14:09-04:00',
                    tax_lines: [
                        {
                            price: '1.50',
                            rate: 0.2,
                            title: 'TVA'
                        }
                    ],
                    name: '#1202',
                    reference: null,
                    source_url: null,
                    source_identifier: null,
                    processing_method: 'manual',
                    total_price: '9.00',
                    shipping_lines: [],
                    phone: null,
                    subtotal_price: '9.00',
                    source_name: 'shopify_draft_order',
                    landing_site: null,
                    user_id: 95205899,
                    total_tax: '1.50',
                    billing_address: {
                        zip: '75012',
                        city: 'Paris',
                        name: 'Jean Bon',
                        latitude: 48.8293647,
                        phone: null,
                        longitude: 2.4265406,
                        province: 'Ile de France',
                        last_name: 'Bon',
                        country_code: 'FR',
                        country: 'France',
                        first_name: 'Jean',
                        province_code: null,
                        company: 'Fleury Michon',
                        address1: '12 rue du poisson cru',
                        address2: 'unit 3'
                    },
                    currency: 'EUR',
                    test: false,
                    note: null,
                    order_status_url: null,
                    fulfillment_status: null,
                    total_weight: 200,
                    checkout_id: null,
                    payment_gateway_names: [
                        'manual'
                    ],
                    total_price_usd: '10.33',
                    fulfillments: [],
                    line_items: [
                        {
                            variant_inventory_management: null,
                            taxable: true,
                            vendor: 'storegorgias3',
                            price: '9.00',
                            quantity: 1,
                            tax_lines: [
                                {
                                    price: '1.50',
                                    rate: 0.2,
                                    title: 'TVA'
                                }
                            ],
                            product_id: 9211387275,
                            name: 'Baskets peu cheres  10.00% Off Auto renew',
                            product_exists: true,
                            fulfillable_quantity: 1,
                            properties: [],
                            fulfillment_status: null,
                            fulfillment_service: 'manual',
                            variant_id: 32994232907,
                            title: 'Baskets peu cheres  10.00% Off Auto renew',
                            id: 8276448779,
                            grams: 200,
                            total_discount: '0.00',
                            sku: '1234567890',
                            variant_title: null,
                            gift_card: false,
                            requires_shipping: true
                        }
                    ],
                    referring_site: null,
                    total_discounts: '0.00',
                    updated_at: '2017-07-12T16:14:10-04:00',
                    tags: '',
                    token: 'c4e9a492adf51bed245af52b4dd1789a',
                    cart_token: null,
                    order_number: 1202,
                    total_line_items_price: '9.00',
                    id: 4236385803,
                    customer_locale: null,
                    refunds: [],
                    email: 'jeanbon@gorgias.io',
                    contact_email: 'jeanbon@gorgias.io',
                    browser_ip: null,
                    customer: {
                        last_order_name: '#1202',
                        verified_email: true,
                        created_at: '2017-03-17T21:26:16-04:00',
                        phone: '+14155489999',
                        state: 'disabled',
                        accepts_marketing: false,
                        note: 'Un grand jambon',
                        total_spent: '131.50',
                        tax_exempt: false,
                        last_name: 'Bon',
                        orders_count: 80,
                        last_order_id: 4236385803,
                        default_address: {
                            'default': true,
                            zip: '75012',
                            city: 'Paris',
                            name: 'Jean Bon',
                            phone: null,
                            province: 'Ile de France',
                            country_name: 'France',
                            last_name: 'Bon',
                            country_code: 'FR',
                            country: 'France',
                            first_name: 'Jean',
                            id: 4797217995,
                            customer_id: 4279837195,
                            province_code: null,
                            company: 'Fleury Michon',
                            address1: '12 rue du poisson cru',
                            address2: 'unit 3'
                        },
                        updated_at: '2017-07-12T20:44:14-04:00',
                        tags: 'Active Subscriber',
                        first_name: 'Jean',
                        id: 4279837195,
                        email: 'jeanbon@gorgias.io',
                        multipass_identifier: null
                    },
                    confirmed: true
                },
                {
                    checkout_token: null,
                    cancelled_at: null,
                    taxes_included: false,
                    landing_site_ref: null,
                    shipping_address: {
                        zip: '75012',
                        city: 'Paris',
                        name: 'Jean Bon',
                        latitude: 48.8293647,
                        phone: null,
                        longitude: 2.4265406,
                        province: 'Ile de France',
                        last_name: 'Bon',
                        country_code: 'FR',
                        country: 'France',
                        first_name: 'Jean',
                        province_code: null,
                        company: 'Fleury Michon',
                        address1: '12 rue du poisson cru',
                        address2: 'unit 3'
                    },
                    gateway: '',
                    processed_at: '2017-06-16T20:06:10-04:00',
                    device_id: null,
                    note_attributes: [],
                    location_id: null,
                    buyer_accepts_marketing: false,
                    closed_at: null,
                    financial_status: 'paid',
                    discount_codes: [],
                    number: 199,
                    cancel_reason: null,
                    created_at: '2017-06-16T20:06:10-04:00',
                    tax_lines: [],
                    name: '#1199',
                    reference: null,
                    source_url: null,
                    source_identifier: null,
                    processing_method: '',
                    total_price: '0.10',
                    shipping_lines: [],
                    phone: null,
                    subtotal_price: '0.10',
                    source_name: '1424624',
                    landing_site: null,
                    user_id: null,
                    total_tax: '0.00',
                    currency: 'EUR',
                    test: false,
                    note: null,
                    order_status_url: null,
                    fulfillment_status: null,
                    total_weight: null,
                    checkout_id: null,
                    payment_gateway_names: [],
                    total_price_usd: '0.11',
                    fulfillments: [],
                    line_items: [
                        {
                            variant_inventory_management: null,
                            taxable: true,
                            vendor: 'storegorgias3',
                            price: '0.10',
                            quantity: 1,
                            tax_lines: [],
                            product_id: 8345093387,
                            name: 'Bonbon acidulé',
                            product_exists: true,
                            fulfillable_quantity: 1,
                            properties: [],
                            fulfillment_status: null,
                            fulfillment_service: 'manual',
                            variant_id: 28442938955,
                            title: 'Bonbon acidulé',
                            id: 8184387659,
                            grams: 10,
                            total_discount: '0.00',
                            sku: '0987654321',
                            variant_title: null,
                            gift_card: false,
                            requires_shipping: true
                        }
                    ],
                    referring_site: null,
                    total_discounts: '0.00',
                    updated_at: '2017-06-16T20:06:10-04:00',
                    tags: '',
                    token: '0fbe98fcc45da2abe985cc7eea5a5cf4',
                    cart_token: null,
                    order_number: 1199,
                    total_line_items_price: '0.10',
                    id: 4194477515,
                    customer_locale: null,
                    refunds: [],
                    email: 'jean@gorgias.io',
                    contact_email: 'jean@gorgias.io',
                    browser_ip: null,
                    customer: {
                        last_order_name: '#1202',
                        verified_email: true,
                        created_at: '2017-03-17T21:26:16-04:00',
                        phone: '+14155489999',
                        state: 'disabled',
                        accepts_marketing: false,
                        note: 'Un grand jambon',
                        total_spent: '131.50',
                        tax_exempt: false,
                        last_name: 'Bon',
                        orders_count: 80,
                        last_order_id: 4236385803,
                        default_address: {
                            'default': true,
                            zip: '75012',
                            city: 'Paris',
                            name: 'Jean Bon',
                            phone: null,
                            province: 'Ile de France',
                            country_name: 'France',
                            last_name: 'Bon',
                            country_code: 'FR',
                            country: 'France',
                            first_name: 'Jean',
                            id: 4797217995,
                            customer_id: 4279837195,
                            province_code: null,
                            company: 'Fleury Michon',
                            address1: '12 rue du poisson cru',
                            address2: 'unit 3'
                        },
                        updated_at: '2017-07-12T20:44:14-04:00',
                        tags: 'Active Subscriber',
                        first_name: 'Jean',
                        id: 4279837195,
                        email: 'jeanbon@gorgias.io',
                        multipass_identifier: null
                    },
                    confirmed: true
                }
            ],
            __integration_type__: 'shopify'
        }
    },
    updated_datetime: '2017-07-31T23:17:01.313273+00:00'
}
