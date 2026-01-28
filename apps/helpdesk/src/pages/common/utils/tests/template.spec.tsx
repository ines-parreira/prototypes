import {
    LDMLToMomentFormat,
    MAX_OBJECT_RENDER_LENGTH,
    renderTemplate,
} from '../template'

describe('utils', () => {
    describe('template', () => {
        describe('LDMLToMomentFormat()', () => {
            it('should replace `d` with `D`', () => {
                expect(LDMLToMomentFormat('MMMM d YYYY')).toEqual('MMMM D YYYY')
                expect(LDMLToMomentFormat('MMMM dd YYYY')).toEqual(
                    'MMMM DD YYYY',
                )
                expect(LDMLToMomentFormat('MMMM/d/YYYY')).toEqual('MMMM/D/YYYY')
                expect(LDMLToMomentFormat('d/YYYY')).toEqual('D/YYYY')
                expect(LDMLToMomentFormat('MMMM/d')).toEqual('MMMM/D')
                expect(LDMLToMomentFormat('d d d d')).toEqual('D D D D')
            })

            it('should not replace `d` with `D` because there is other letters consecutive to the `d`', () => {
                ;[
                    'MMMM de YYYY',
                    'MMMM ed YYYY',
                    'MMMM ede YYYY',
                    'MMMM dO YYYY',
                    'MMMM Od YYYY',
                    'MMMM OdO YYYY',
                ].forEach((pattern) =>
                    expect(LDMLToMomentFormat(pattern)).toEqual(pattern),
                )
            })
        })

        describe('renderTemplate()', () => {
            it('should return an empty string because the passed body is invalid', () => {
                expect(renderTemplate()).toBe('')
                expect(renderTemplate('')).toBe('')
                expect(renderTemplate(null)).toBe('')
                expect(renderTemplate(undefined)).toBe('')
            })

            it('should not throw error when the context is undefined', () => {
                expect(renderTemplate('Hello')).toBe('Hello')
            })

            it('should interpolates string values', () => {
                expect(
                    renderTemplate('Hello {{something}}', {
                        something: 'world',
                    }),
                ).toBe('Hello world')
            })

            it('should interpolate number values', () => {
                expect(
                    renderTemplate('You have {{sum}} orders.', {
                        sum: 0,
                    }),
                ).toBe('You have 0 orders.')
            })

            it('should interpolate nested object', () => {
                expect(
                    renderTemplate(
                        'Hello {{somebody.name}}, how about a nice {{something.name}}?',
                        {
                            somebody: {
                                name: 'Michael',
                            },
                            something: {
                                name: 'cup of tea',
                                temperature: 300,
                            },
                        },
                    ),
                ).toBe('Hello Michael, how about a nice cup of tea?')
            })

            it('should interpolate deeply nested object', () => {
                expect(
                    renderTemplate('Hello {{somebody.bestFriend.name}}', {
                        somebody: {
                            bestFriend: {
                                name: 'Michael',
                            },
                        },
                    }),
                ).toBe('Hello Michael')
            })

            it('should return passed text without variables because the interpolation failed', () => {
                const text = 'Hello {{somebody.bestFriend.name}}'
                const result = 'Hello '

                expect(
                    renderTemplate(text, {
                        somebody: {
                            bestEnemy: {
                                name: 'Michael',
                            },
                        },
                    }),
                ).toBe(result)
            })

            it('should interpolate available variables and ignores missing ones', () => {
                expect(
                    renderTemplate(
                        'Hello {{somebody.name}}, how about a nice {{something.name}}?',
                        {
                            somebody: {
                                name: 'Michael',
                            },
                        },
                    ),
                ).toBe('Hello Michael, how about a nice ?')
            })

            it('should interpolate an empty string because the value is null', () => {
                expect(
                    renderTemplate('You have {{sum}} orders.', {
                        sum: null,
                    }),
                ).toBe('You have  orders.')
            })

            it('should interpolate an empty string because the value is undefined', () => {
                expect(
                    renderTemplate('You have {{sum}} orders.', {
                        sum: undefined,
                    }),
                ).toBe('You have  orders.')
            })

            it('should format passed date according to passed pattern', () => {
                expect(
                    renderTemplate('{{date|datetime_format("YYYY")}}', {
                        date: '2018-01-02',
                    }),
                ).toBe('2018')
            })

            it('should format passed date according to passed pattern (different format)', () => {
                expect(
                    renderTemplate('{{date|datetime_format("YYYY-MM")}}', {
                        date: '2018-01-02',
                    }),
                ).toBe('2018-01')
            })

            it('should interpolate the provided value for the variable because it is set and not empty', () => {
                expect(
                    renderTemplate('Hi {{x|fallback("there")}}', {
                        x: 'Alex',
                    }),
                ).toBe('Hi Alex')
            })

            it('should interpolate the fallback because the value for the variable is empty', () => {
                expect(
                    renderTemplate('Hi {{x|fallback("there")}}', {
                        x: '',
                    }),
                ).toBe('Hi there')
            })

            it('should interpolate the fallback because the value for the variable is not provided', () => {
                expect(
                    renderTemplate('Hi {{x|fallback("there")}}', {
                        y: 'Alex',
                    }),
                ).toBe('Hi there')
            })

            it('should ignore unknown filters and interpolate provided value', () => {
                expect(
                    renderTemplate('{{x|unknown()}}', {
                        x: 123,
                    }),
                ).toBe('123')
            })

            it('should not execute XSS', () => {
                expect(
                    renderTemplate('{{x|datetime_relative(alert(123))}}', {
                        x: 123,
                    }),
                ).toBe('{{x|datetime_relative(alert(123))}}')
            })

            it('should render variable with negative index array', () => {
                expect(
                    renderTemplate('{{x.messages[-1].from_agent}}', {
                        x: {
                            messages: [
                                { from_agent: true },
                                { from_agent: false },
                            ],
                        },
                    }),
                ).toBe('false')
            })

            it('should render variable with negative index and datetime format ', () => {
                expect(
                    renderTemplate(
                        '{{x.messages[-1].created_datetime|datetime_format("MMMM d YYYY")}}',
                        {
                            x: {
                                messages: [
                                    {
                                        created_datetime:
                                            '2021-03-11T18:14:21.191818+00:00',
                                    },
                                    {
                                        created_datetime:
                                            '2022-03-11T18:14:21.191818+00:00',
                                    },
                                ],
                            },
                        },
                    ),
                ).toBe('March 11 2022')
            })

            it('should render variable with mix of array and dicts', () => {
                expect(
                    renderTemplate(
                        '{{x.customer.integrations[14].orders[0].created_at}}',
                        {
                            x: {
                                customer: {
                                    integrations: {
                                        14: {
                                            orders: [
                                                {
                                                    created_at:
                                                        '2020-05-12T08:14:21.191818+00:00',
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    ),
                ).toBe('2020-05-12T08:14:21.191818+00:00')
            })

            it('should render variable with mix of array and dicts', () => {
                expect(
                    renderTemplate(
                        '{{x.customer.integrations.14.orders[0].created_at}}',
                        {
                            x: {
                                customer: {
                                    integrations: {
                                        14: {
                                            orders: [
                                                {
                                                    created_at:
                                                        '2020-05-12T08:14:21.191818+00:00',
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    ),
                ).toBe('2020-05-12T08:14:21.191818+00:00')
            })

            it('should render variable ending with an accessor', () => {
                expect(
                    renderTemplate('{{x.customer.integrations.14.orders[0]}}', {
                        x: {
                            customer: {
                                integrations: {
                                    14: {
                                        orders: ['foo'],
                                    },
                                },
                            },
                        },
                    }),
                ).toBe('foo')
            })

            it('should render objects in stringified JSON', () => {
                expect(
                    renderTemplate('{{x}}', {
                        x: {
                            customer: {
                                integrations: {
                                    14: {
                                        orders: ['foo'],
                                    },
                                },
                            },
                        },
                    }),
                ).toBe(
                    '{"customer":{"integrations":{"14":{"orders":["foo"]}}}}',
                )
            })
            it('should trim too long objects in stringified JSON', () => {
                expect(
                    renderTemplate('{{x}}', {
                        x: {
                            customer: 'customer_name'.repeat(1000),
                        },
                    }).length,
                ).toBe(MAX_OBJECT_RENDER_LENGTH)
            })

            it('should return template when templated value is empty', () => {
                expect(renderTemplate('hello {{x}}', {})).toEqual('hello ')
                expect(renderTemplate('hello {{x}}', {}, true)).toEqual(
                    'hello {{x}}',
                )
            })

            describe('metafields array lookup by key', () => {
                const metafieldsContext = {
                    ticket: {
                        customer: {
                            integrations: {
                                '5007': {
                                    orders: [
                                        {
                                            name: '#1088',
                                            metafields: [
                                                {
                                                    key: 'oreder_test_def',
                                                    value: 'test metafield value',
                                                },
                                                {
                                                    key: 'another_field',
                                                    value: 'another value',
                                                },
                                            ],
                                        },
                                    ],
                                    customer: {
                                        metafields: [
                                            { key: 'color', value: 'blue' },
                                            { key: 'size', value: 'large' },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                }

                it('should lookup metafield by key in orders', () => {
                    const result = renderTemplate(
                        '{{ticket.customer.integrations[5007].orders[0].metafields.oreder_test_def.value}}',
                        metafieldsContext,
                    )
                    expect(result).toBe('test metafield value')
                })

                it('should lookup metafield by key in customer', () => {
                    const result = renderTemplate(
                        '{{ticket.customer.integrations[5007].customer.metafields.color.value}}',
                        metafieldsContext,
                    )
                    expect(result).toBe('blue')
                })

                it('should return empty for non-existent metafield key', () => {
                    const result = renderTemplate(
                        '{{ticket.customer.integrations[5007].customer.metafields.nonexistent.value}}',
                        metafieldsContext,
                    )
                    expect(result).toBe('')
                })

                it('should handle metafields with just key access (no .value)', () => {
                    const result = renderTemplate(
                        '{{ticket.customer.integrations[5007].customer.metafields.color}}',
                        metafieldsContext,
                    )
                    expect(result).toContain('color')
                    expect(result).toContain('blue')
                })

                it('should handle multiple metafields in same template', () => {
                    const result = renderTemplate(
                        'Color: {{ticket.customer.integrations[5007].customer.metafields.color.value}}, Size: {{ticket.customer.integrations[5007].customer.metafields.size.value}}',
                        metafieldsContext,
                    )
                    expect(result).toBe('Color: blue, Size: large')
                })
            })

            describe('real-world variable patterns', () => {
                const realWorldContext = {
                    ticket: {
                        customer: {
                            firstname: 'John',
                            integrations: {
                                magento2: {
                                    orders: [
                                        {
                                            created_at: '2024-01-15T10:30:00Z',
                                            increment_id: '100000123',
                                            last_shipment: {
                                                last_track: {
                                                    tracking_url:
                                                        'https://tracking.example.com/123',
                                                },
                                            },
                                            extension_attributes: {
                                                shipping_assignments: [
                                                    {
                                                        shipping: {
                                                            address: {
                                                                street: [
                                                                    '123 Main St',
                                                                    'Apt 4',
                                                                ],
                                                                postcode:
                                                                    '12345',
                                                                city: 'New York',
                                                                region_code:
                                                                    'NY',
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                                recharge: {
                                    subscriptions: [
                                        {
                                            quantity: 2,
                                            product_title: 'Monthly Coffee Box',
                                            order_interval_frequency: '30',
                                            order_interval_unit: 'days',
                                            price: '29.99',
                                            next_charge_scheduled_at:
                                                '2024-02-15T00:00:00Z',
                                        },
                                    ],
                                    customer: { hash: 'abc123hash' },
                                },
                                smile: {
                                    customer: {
                                        points_balance: 1500,
                                        referral_url:
                                            'https://smile.io/ref/abc',
                                        state: 'active',
                                        vip_tier: { name: 'Gold' },
                                    },
                                },
                                bigcommerce: {
                                    orders: [
                                        {
                                            id: 789,
                                            status: 'Shipped',
                                            date_created:
                                                '2024-01-10T08:00:00Z',
                                            bc_order_shipments: [
                                                {
                                                    tracking_link:
                                                        'https://bc-tracking.example.com/456',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    current_user: { firstname: 'Agent Sarah' },
                }

                it('should render simple nested properties', () => {
                    expect(
                        renderTemplate(
                            '{{ticket.customer.firstname}}',
                            realWorldContext,
                        ),
                    ).toBe('John')
                    expect(
                        renderTemplate(
                            '{{current_user.firstname}}',
                            realWorldContext,
                        ),
                    ).toBe('Agent Sarah')
                })

                it('should render Magento2 order properties with datetime format', () => {
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.magento2.orders[0].created_at|datetime_format("MMMM d, YYYY")}}',
                            realWorldContext,
                        ),
                    ).toBe('January 15, 2024')
                })

                it('should render Magento2 order increment_id', () => {
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.magento2.orders[0].increment_id}}',
                            realWorldContext,
                        ),
                    ).toBe('100000123')
                })

                it('should render deeply nested Magento2 tracking URL', () => {
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.magento2.orders[0].last_shipment.last_track.tracking_url}}',
                            realWorldContext,
                        ),
                    ).toBe('https://tracking.example.com/123')
                })

                it('should render deeply nested Magento2 shipping address', () => {
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.magento2.orders[0].extension_attributes.shipping_assignments[0].shipping.address.street[0]}}',
                            realWorldContext,
                        ),
                    ).toBe('123 Main St')
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.magento2.orders[0].extension_attributes.shipping_assignments[0].shipping.address.city}}',
                            realWorldContext,
                        ),
                    ).toBe('New York')
                })

                it('should render Recharge subscription properties', () => {
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.recharge.subscriptions[0].quantity}}',
                            realWorldContext,
                        ),
                    ).toBe('2')
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.recharge.subscriptions[0].product_title}}',
                            realWorldContext,
                        ),
                    ).toBe('Monthly Coffee Box')
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.recharge.customer.hash}}',
                            realWorldContext,
                        ),
                    ).toBe('abc123hash')
                })

                it('should render Smile customer properties', () => {
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.smile.customer.points_balance}}',
                            realWorldContext,
                        ),
                    ).toBe('1500')
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.smile.customer.vip_tier.name}}',
                            realWorldContext,
                        ),
                    ).toBe('Gold')
                })

                it('should render BigCommerce order properties', () => {
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.bigcommerce.orders[0].id}}',
                            realWorldContext,
                        ),
                    ).toBe('789')
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.bigcommerce.orders[0].status}}',
                            realWorldContext,
                        ),
                    ).toBe('Shipped')
                    expect(
                        renderTemplate(
                            '{{ticket.customer.integrations.bigcommerce.orders[0].bc_order_shipments[0].tracking_link}}',
                            realWorldContext,
                        ),
                    ).toBe('https://bc-tracking.example.com/456')
                })
            })

            describe('basic regression tests', () => {
                it('should handle arrays of objects without key property using standard path access', () => {
                    const result = renderTemplate('{{data.items[0].name}}', {
                        data: {
                            items: [{ name: 'first' }, { name: 'second' }],
                        },
                    })
                    expect(result).toBe('first')
                })

                it('should handle arrays of primitive values', () => {
                    const result = renderTemplate('{{data.tags[0]}}', {
                        data: { tags: ['tag1', 'tag2', 'tag3'] },
                    })
                    expect(result).toBe('tag1')
                })

                it('should still support negative index access on regular arrays', () => {
                    const result = renderTemplate('{{data.items[-1].name}}', {
                        data: {
                            items: [{ name: 'first' }, { name: 'last' }],
                        },
                    })
                    expect(result).toBe('last')
                })

                it('should return empty for empty array access', () => {
                    const result = renderTemplate('{{data.items[0]}}', {
                        data: { items: [] },
                    })
                    expect(result).toBe('')
                })
            })

            describe('metafields edge cases', () => {
                it('should return empty for key lookup in empty metafields array', () => {
                    const result = renderTemplate(
                        '{{data.metafields.somekey.value}}',
                        {
                            data: { metafields: [] },
                        },
                    )
                    expect(result).toBe('')
                })

                it('should fallback to standard path when first element is null', () => {
                    const result = renderTemplate(
                        '{{data.metafields.color.value}}',
                        {
                            data: {
                                metafields: [
                                    null,
                                    { key: 'color', value: 'red' },
                                ],
                            },
                        },
                    )
                    expect(result).toBe('')
                })

                it('should handle metafields as an object (not array)', () => {
                    const result = renderTemplate('{{data.metafields.color}}', {
                        data: { metafields: { color: 'blue' } },
                    })
                    expect(result).toBe('blue')
                })

                it('should allow index access on metafields-style arrays', () => {
                    const result = renderTemplate(
                        '{{data.metafields[0].value}}',
                        {
                            data: {
                                metafields: [{ key: 'color', value: 'blue' }],
                            },
                        },
                    )
                    expect(result).toBe('blue')
                })

                it('should handle metafield keys with underscores', () => {
                    const result = renderTemplate(
                        '{{data.metafields.my_special_key.value}}',
                        {
                            data: {
                                metafields: [
                                    { key: 'my_special_key', value: 'special' },
                                ],
                            },
                        },
                    )
                    expect(result).toBe('special')
                })

                it('should handle deeply nested paths after metafields key lookup', () => {
                    const result = renderTemplate(
                        '{{data.metafields.nested.value.deep.property}}',
                        {
                            data: {
                                metafields: [
                                    {
                                        key: 'nested',
                                        value: { deep: { property: 'found' } },
                                    },
                                ],
                            },
                        },
                    )
                    expect(result).toBe('found')
                })
            })

            describe('complex mixed scenarios', () => {
                it('should handle mixing array index access and metafields key lookup', () => {
                    const result = renderTemplate(
                        '{{data.items[0].metafields.color.value}}',
                        {
                            data: {
                                items: [
                                    {
                                        metafields: [
                                            { key: 'color', value: 'red' },
                                        ],
                                    },
                                    {
                                        metafields: [
                                            { key: 'color', value: 'blue' },
                                        ],
                                    },
                                ],
                            },
                        },
                    )
                    expect(result).toBe('red')
                })

                it('should handle path with multiple potential metafields arrays', () => {
                    const result = renderTemplate('{{data.configs.db.value}}', {
                        data: {
                            configs: [
                                { key: 'db', value: 'postgres' },
                                { key: 'cache', value: 'redis' },
                            ],
                        },
                    })
                    expect(result).toBe('postgres')
                })
            })
        })
    })
})
