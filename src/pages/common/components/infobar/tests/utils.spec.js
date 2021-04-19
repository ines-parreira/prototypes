import React from 'react'
import {fromJS} from 'immutable'
import moment from 'moment'
import momentTimezone from 'moment-timezone'

import * as utils from '../utils'

jest.mock('../../../utils/labels', () => ({
    DatetimeLabel: () => <div>DatetimeLabel</div>,
}))

describe('widgets infobar utils', () => {
    describe('is array of objects', () => {
        const correct = [
            [
                {
                    hello: 'world',
                },
            ],
        ]

        const incorrect = [
            undefined,
            null,
            '',
            {},
            fromJS([]),
            fromJS({}),
            'hello',
            [],
            ['hello'],
        ]

        it('detection OK', () => {
            correct.forEach((input) => {
                expect(utils.isArrayOfObjects(input)).toBe(true)
            })
        })

        it('detection KO', () => {
            incorrect.forEach((input) => {
                expect(utils.isArrayOfObjects(input)).toBe(false)
            })
        })
    })

    describe('is object', () => {
        const correct = [
            {
                hello: 'world',
            },
            {},
            fromJS([]),
            fromJS({}),
        ]

        const incorrect = [undefined, null, '', 'hello', [], ['hello']]

        it('detection OK', () => {
            correct.forEach((input) => {
                expect(utils.isObject(input)).toBe(true)
            })
        })

        it('detection KO', () => {
            incorrect.forEach((input) => {
                expect(utils.isObject(input)).toBe(false)
            })
        })
    })

    describe('are sources ready', () => {
        const correct = [
            fromJS({
                ticket: {
                    customer: {
                        data: {
                            name: 'hello',
                        },
                    },
                },
            }),
            fromJS({
                ticket: {
                    customer: {
                        data: {
                            age: 33,
                            list: ['hello'],
                        },
                    },
                },
            }),
        ]

        const incorrect = [
            fromJS({
                ticket: {
                    customer: {},
                },
            }),
            fromJS({
                ticket: {
                    orders: [],
                },
            }),
            fromJS({
                imaginaryKey: {},
            }),
            fromJS({
                imaginaryKey: {
                    something: {
                        really: 'yes',
                    },
                },
            }),
            fromJS({}),
        ]

        const context = 'ticket'

        it('detection OK', () => {
            correct.forEach((input) => {
                expect(utils.areSourcesReady(input, context, false)).toBe(true)
            })
        })

        it('detection KO', () => {
            incorrect.forEach((input) => {
                expect(utils.areSourcesReady(input, context, false)).toBe(false)
            })
        })
    })

    describe('json to widgets', () => {
        const source = {
            list: [
                {
                    name: 'Michael',
                },
                {
                    name: 'Julien',
                },
            ],
            customer: {
                name: 'Pedro',
                url: 'http://google.com',
                children: [
                    {
                        name: 'Sylvie',
                    },
                ],
            },
            description: 'Best friend',
        }

        const result = {
            path: '',
            title: '',
            type: 'card',
            widgets: [
                {
                    path: 'description',
                    title: 'Description',
                    type: 'text',
                },
                {
                    path: 'customer',
                    title: 'Customer',
                    type: 'card',
                    widgets: [
                        {
                            path: 'name',
                            title: 'Name',
                            type: 'text',
                        },
                        {
                            path: 'url',
                            title: 'Url',
                            type: 'url',
                        },
                        {
                            path: 'children',
                            type: 'list',
                            widgets: [
                                {
                                    title: 'Children',
                                    type: 'card',
                                    widgets: [
                                        {
                                            path: 'name',
                                            title: 'Name',
                                            type: 'text',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    path: 'list',
                    type: 'list',
                    widgets: [
                        {
                            title: 'List',
                            type: 'card',
                            widgets: [
                                {
                                    path: 'name',
                                    title: 'Name',
                                    type: 'text',
                                },
                            ],
                        },
                    ],
                },
            ],
        }

        it('templating OK', () => {
            expect(utils.jsonToWidget(source)).toEqual(result)
        })
    })

    describe('guessFieldValueFromRawData()', () => {
        it('should return an empty string because passed data is undefined', () => {
            expect(utils.guessFieldValueFromRawData(undefined)).toEqual('')
        })

        it('should return an empty string because passed data is null', () => {
            expect(utils.guessFieldValueFromRawData(null)).toEqual('')
        })

        it('should return passed data because passed type is `text`', () => {
            const passedData = 'foo'
            expect(
                utils.guessFieldValueFromRawData(passedData, 'text')
            ).toEqual(passedData)
        })

        it('should return a datetime label because passed type is `date`', () => {
            expect(
                utils.guessFieldValueFromRawData('foo', 'date')
            ).toMatchSnapshot()
        })

        it('should return an age string because passed type is `age` and passed data is a valid datetime', () => {
            const expectedAge = 2
            const currentYear = new Date().getFullYear()

            const year = `${currentYear - expectedAge}-01-01`
            expect(
                utils.guessFieldValueFromRawData(`${year} 00:05:00`, 'age')
            ).toEqual(`${expectedAge} (${year})`)
        })

        it('should return passed data because passed type is `age` and passed data is not a valid datetime', () => {
            const passedData = '20180101-05 00:'
            expect(utils.guessFieldValueFromRawData(passedData, 'age')).toEqual(
                passedData
            )
        })

        it('should return a link because passed type is `url` and passed data is an url', () => {
            expect(
                utils.guessFieldValueFromRawData('https://gorgias.io', 'url')
            ).toMatchSnapshot()
        })

        it('should return passed data because passed type is `url` and passed data is not an url', () => {
            const passedData = 'httpsgorgiasio'
            expect(utils.guessFieldValueFromRawData(passedData, 'url')).toEqual(
                passedData
            )
        })

        it('should return a link because passed type is `email` and passed data is an email address', () => {
            expect(
                utils.guessFieldValueFromRawData(
                    'developers@gorgias.io',
                    'email'
                )
            ).toMatchSnapshot()
        })

        it('should return passed data because passed type is `email` and passed data is not an email address', () => {
            const passedData = 'developersgorgias.io'
            expect(
                utils.guessFieldValueFromRawData(passedData, 'email')
            ).toEqual(passedData)
        })

        it('should render a success badge because passed type is `boolean` and passed data is a `true` value', () => {
            expect(
                utils.guessFieldValueFromRawData(true, 'boolean')
            ).toMatchSnapshot()
            expect(
                utils.guessFieldValueFromRawData('true', 'boolean')
            ).toMatchSnapshot()
            expect(
                utils.guessFieldValueFromRawData('1', 'boolean')
            ).toMatchSnapshot()
            expect(
                utils.guessFieldValueFromRawData(1, 'boolean')
            ).toMatchSnapshot()
            expect(
                utils.guessFieldValueFromRawData(42, 'boolean')
            ).toMatchSnapshot()
        })

        it('should render a danger badge because passed type is `boolean` and passed data is a `false` value', () => {
            expect(
                utils.guessFieldValueFromRawData(false, 'boolean')
            ).toMatchSnapshot()
            expect(
                utils.guessFieldValueFromRawData('false', 'boolean')
            ).toMatchSnapshot()
            expect(
                utils.guessFieldValueFromRawData('0', 'boolean')
            ).toMatchSnapshot()
            expect(
                utils.guessFieldValueFromRawData(0, 'boolean')
            ).toMatchSnapshot()
        })

        const validValues = [
            ['1', 'sentiment'],
            [1, 'sentiment'],
            ['-1', 'sentiment'],
            [-1, 'sentiment'],
            ['0', 'sentiment'],
            [0, 'sentiment'],
            ['1', 'rating'],
            [1, 'rating'],
            [5, 'rating'],
            ['1', 'points'],
            [1, 'points'],
            [555, 'points'],
            ['1', 'percent'],
            [1, 'percent'],
            [555, 'percent'],
        ]
        const defaultValues = [
            ['hello', 'sentiment'],
            ['hello', 'rating'],
            ['hello', 'points'],
            ['hello', 'percent'],
        ]

        it.each(validValues)(
            'given %p and %p as arguments, returns correct value',
            (data, type) => {
                const result = utils.guessFieldValueFromRawData(data, type)
                expect(result).toMatchSnapshot()
            }
        )
        it.each(defaultValues)(
            'given %p and %p as arguments, returns default value',
            (data, type) => {
                const result = utils.guessFieldValueFromRawData(data, type)
                expect(result).toMatchSnapshot()
            }
        )
    })

    describe('getLocalTime()', () => {
        const nowDates = [
            ['+0100', '13:34'],
            ['+0900', '21:34'],
            ['+0000', '12:34'],
            ['-0300', '09:34'],
            ['-0500', '07:34'],
            ['+1200', '00:34'],
        ]

        it.each(nowDates)(
            'should correctly format local time in the hh:mm format',
            (timezoneOffset, expectedLocalTime) => {
                const fixedUtcDate = moment.utc('2019-01-26T12:34:56.000Z')
                jest.spyOn(moment, 'utc').mockImplementationOnce(
                    () => fixedUtcDate
                )

                const result = utils.getLocalTime(timezoneOffset)
                expect(result).toBe(expectedLocalTime)
            }
        )
    })

    describe('getDisplayCustomerLastSeenOnChat()', () => {
        const lastSeenDatetimeStamps = [
            [
                '2021-02-26T13:24:00.000Z',
                '2021-02-26T13:23:00.000Z',
                'Europe/Paris',
                '2021-02-26T13:24:00.000Z',
                'now',
            ],
            [
                '2021-02-26T13:24:00.000Z',
                '2021-02-26T12:44:00.000Z',
                'Europe/Paris',
                '2021-02-26T13:24:00.000Z',
                '40 minutes ago',
            ],
            [
                '2021-02-26T13:24:00.000Z',
                '2021-02-26T11:34:00.000Z',
                'Europe/Paris',
                '2021-02-26T13:24:00.000Z',
                'Today at 12:34 PM',
            ],
            [
                '2021-02-27T13:24:00.000Z',
                '2021-02-26T11:34:00.000Z',
                'Europe/Paris',
                '2021-02-27T13:24:00.000Z',
                'Yesterday at 12:34 PM',
            ],
            [
                '2021-02-26T13:24:00.000Z',
                '2021-02-17T23:44:00.000Z',
                'Europe/Paris',
                '2021-02-26T13:24:00.000Z',
                '02/18/2021',
            ],
            [
                '2021-02-26T13:24:00.000Z',
                '2021-02-17T23:44:00.000Z',
                null,
                '2021-02-26T13:24:00.000Z',
                '02/17/2021',
            ],
            [
                '2021-02-26T13:24:00.000Z',
                '2021-02-17T23:44:00.000Z',
                'Europe/Paris',
                null,
                '02/18/2021',
            ],
            [
                '2021-02-26T13:24:00.000Z',
                '2021-02-17T23:44:00.000Z',
                null,
                null,
                '02/17/2021',
            ],
        ]

        it.each(lastSeenDatetimeStamps)(
            'should construct the best displayable string from the datetime string',
            (
                mockedNow,
                lastSeenOnChat,
                timezone,
                referenceDay,
                expectedDisplayLastSeenOnChat
            ) => {
                const fixedUtcDate = momentTimezone.utc(mockedNow)
                const mockedReference = momentTimezone.utc(referenceDay)
                jest.spyOn(momentTimezone, 'utc').mockImplementationOnce(
                    () => fixedUtcDate
                )

                const result = utils.getDisplayCustomerLastSeenOnChat(
                    lastSeenOnChat,
                    timezone,
                    referenceDay ? mockedReference : null
                )
                expect(result).toBe(expectedDisplayLastSeenOnChat)
            }
        )
    })

    describe('isWidgetEmpty()', () => {
        const emptyValues = [
            [fromJS({type: 'wrapper', path: 'foo'}), fromJS({})],
            [
                fromJS({
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        fromJS({type: 'wrapper', path: 'bar'}),
                        fromJS({type: 'card', path: 'baz'}),
                    ],
                }),
                fromJS({}),
            ],
            [
                fromJS({
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        fromJS({
                            type: 'card',
                            path: 'bar',
                            widgets: [fromJS({type: 'text', path: 'baz'})],
                        }),
                    ],
                }),
                fromJS({foo: {bar: {baz: null}}}),
            ],
            [
                fromJS({
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        fromJS({
                            type: 'list',
                            path: 'bar',
                            widgets: [fromJS({type: 'text', path: 'baz'})],
                        }),
                    ],
                }),
                fromJS({foo: {bar: []}}),
            ],
            [
                fromJS({
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        fromJS({
                            type: 'list',
                            path: 'bar',
                            widgets: [fromJS({type: 'text', path: 'baz'})],
                        }),
                    ],
                }),
                fromJS({foo: {bar: [{baz: null}]}}),
            ],
        ]

        it.each(emptyValues)(
            'should return `true` because widget is empty',
            (widget, source) => {
                const result = utils.isWidgetEmpty(widget, source)
                expect(result).toBe(true)
            }
        )

        const validValues = [
            [
                fromJS({
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        fromJS({
                            type: 'card',
                            path: 'bar',
                            widgets: [
                                fromJS({type: 'text', path: 'baz'}),
                                fromJS({type: 'text', path: 'buz'}),
                            ],
                        }),
                    ],
                }),
                fromJS({foo: {bar: {baz: 'baz!', buz: ''}}}),
            ],
            [
                fromJS({
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        fromJS({
                            type: 'list',
                            path: 'bar',
                            widgets: [
                                fromJS({type: 'text', path: 'baz'}),
                                fromJS({type: 'text', path: 'buz'}),
                            ],
                        }),
                    ],
                }),
                fromJS({foo: {bar: [{baz: 'baz!', buz: ''}]}}),
            ],
        ]

        it.each(validValues)(
            'should return `false` because widget is not empty',
            (widget, source) => {
                const result = utils.isWidgetEmpty(widget, source)
                expect(result).toBe(false)
            }
        )
    })

    describe('getInfobarMinWidth()', () => {
        it('should return calculated width because it is larger than the limit', () => {
            window.innerWidth = 1800
            const expected = window.innerWidth / 5.1
            expect(utils.getInfobarMinWidth()).toBe(expected)
        })

        it('should return limit because the calculated width is smaller than the limit', () => {
            window.innerWidth = 1700
            const expected = 350
            expect(utils.getInfobarMinWidth()).toBe(expected)
        })
    })

    describe('getInfobarWidth()', () => {
        it('should return store infobar width', () => {
            const expected = '500'
            window.localStorage.setItem('infobar-width', expected)
            expect(utils.getInfobarWidth()).toBe(expected)
        })
    })
})
