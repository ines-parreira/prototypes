import {LDMLToMomentFormat, renderTemplate} from '../template'

describe('utils', () => {
    describe('template', () => {
        describe('LDMLToMomentFormat()', () => {
            it('should replace `d` with `D`', () => {
                expect(LDMLToMomentFormat('MMMM d YYYY')).toEqual('MMMM D YYYY')
                expect(LDMLToMomentFormat('MMMM dd YYYY')).toEqual(
                    'MMMM DD YYYY'
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
                    expect(LDMLToMomentFormat(pattern)).toEqual(pattern)
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
                    })
                ).toBe('Hello world')
            })

            it('should interpolate number values', () => {
                expect(
                    renderTemplate('You have {{sum}} orders.', {
                        sum: 0,
                    })
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
                        }
                    )
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
                    })
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
                    })
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
                        }
                    )
                ).toBe('Hello Michael, how about a nice ?')
            })

            it('should interpolate an empty string because the value is null', () => {
                expect(
                    renderTemplate('You have {{sum}} orders.', {
                        sum: null,
                    })
                ).toBe('You have  orders.')
            })

            it('should interpolate an empty string because the value is undefined', () => {
                expect(
                    renderTemplate('You have {{sum}} orders.', {
                        sum: undefined,
                    })
                ).toBe('You have  orders.')
            })

            it('should format passed date according to passed pattern', () => {
                expect(
                    renderTemplate('{{date|datetime_format("YYYY")}}', {
                        date: '2018-01-02',
                    })
                ).toBe('2018')
            })

            it('should format passed date according to passed pattern (different format)', () => {
                expect(
                    renderTemplate('{{date|datetime_format("YYYY-MM")}}', {
                        date: '2018-01-02',
                    })
                ).toBe('2018-01')
            })

            it('should interpolate the provided value for the variable because it is set and not empty', () => {
                expect(
                    renderTemplate('Hi {{x|fallback("there")}}', {
                        x: 'Alex',
                    })
                ).toBe('Hi Alex')
            })

            it('should interpolate the fallback because the value for the variable is empty', () => {
                expect(
                    renderTemplate('Hi {{x|fallback("there")}}', {
                        x: '',
                    })
                ).toBe('Hi there')
            })

            it('should interpolate the fallback because the value for the variable is not provided', () => {
                expect(
                    renderTemplate('Hi {{x|fallback("there")}}', {
                        y: 'Alex',
                    })
                ).toBe('Hi there')
            })

            it('should ignore unknown filters and interpolate provided value', () => {
                expect(
                    renderTemplate('{{x|unknown()}}', {
                        x: 123,
                    })
                ).toBe('123')
            })

            it('should not execute XSS', () => {
                expect(
                    renderTemplate('{{x|datetime_relative(alert(123))}}', {
                        x: 123,
                    })
                ).toBe('{{x|datetime_relative(alert(123))}}')
            })

            it('should render variable with negative index array', () => {
                expect(
                    renderTemplate('{{x.messages[-1].from_agent}}', {
                        x: {
                            messages: [{from_agent: true}, {from_agent: false}],
                        },
                    })
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
                        }
                    )
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
                        }
                    )
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
                        }
                    )
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
                    })
                ).toBe('foo')
            })
        })
    })
})
