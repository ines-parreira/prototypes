import React, {ReactElement} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import {WidgetContextType} from 'state/widgets/types'

import {jsonToCovertToWidgets} from 'pages/common/components/infobar/tests/fixtures'
import {getDateAndTimeFormat} from 'utils/datetime'
import {
    DateTimeResultFormatType,
    DateFormatType,
    TimeFormatType,
    DateAndTimeFormatting,
} from 'constants/datetime'
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

        const context = WidgetContextType.Ticket

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
            expect(utils.jsonToTemplate(source)).toEqual(result)
        })
    })

    describe('guessFieldValueFromRawData()', () => {
        it('should return passed data because passed type is `text`', () => {
            const passedData = 'foo'
            expect(utils.guessFieldValueFromRawData(passedData, 'text')).toBe(
                passedData
            )
        })

        it('should return a datetime label because passed type is `date`', () => {
            const passedData = '2017-12-14T16:34'
            expect(
                utils.guessFieldValueFromRawData(passedData, 'date')
            ).toMatchSnapshot()
        })

        it('should return an age string because passed type is `age` and passed data is a valid datetime', () => {
            const expectedAge = 2
            const currentYear = new Date().getFullYear()

            const year = `${currentYear - expectedAge}-01-01`
            expect(
                utils.guessFieldValueFromRawData(`${year} 00:05:00`, 'age')
            ).toBe(`${expectedAge} (${year})`)
        })

        it('should return passed data because passed type is `age` and passed data is not a valid datetime', () => {
            const passedData = '20180101-05 00:'
            expect(utils.guessFieldValueFromRawData(passedData, 'age')).toBe(
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
            expect(utils.guessFieldValueFromRawData(passedData, 'url')).toBe(
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
            expect(utils.guessFieldValueFromRawData(passedData, 'email')).toBe(
                passedData
            )
        })

        const validValues: [string | number, string][] = [
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
        it('should return the default value when passed an empty value', () => {
            expect(utils.guessFieldValueFromRawData(undefined)).toEqual('-')
            expect(utils.guessFieldValueFromRawData(null)).toEqual('-')
            expect(utils.guessFieldValueFromRawData('')).toEqual('-')
        })

        describe('should return a success badge because passed data is a `true` value', () => {
            it('should render a badge', () => {
                const {container} = render(
                    utils.guessFieldValueFromRawData(true) as ReactElement
                )
                expect(container).toMatchSnapshot()
            })
            it.each([[true], ['true'], ['1'], [1], [42]])(
                'should return a truthy badge',
                (data) => {
                    expect(
                        JSON.stringify(
                            utils.guessFieldValueFromRawData(data, 'boolean')
                        ).includes('True')
                    ).toBeTruthy()
                }
            )
        })

        describe('should return a danger badge because passed data is a `false` value', () => {
            it('should render a badge', () => {
                const {container} = render(
                    utils.guessFieldValueFromRawData(false) as ReactElement
                )
                expect(container).toMatchSnapshot()
            })
            it.each([[false], ['false'], ['0'], [0]])(
                'should return a truthy badge',
                (data) => {
                    expect(
                        JSON.stringify(
                            utils.guessFieldValueFromRawData(data, 'boolean')
                        ).includes('False')
                    ).toBeTruthy()
                }
            )
        })

        it('should return a comma-separated list of rendered values because passed data is an array', () => {
            const {container} = render(
                utils.guessFieldValueFromRawData([
                    123,
                    'test',
                    true,
                    null,
                ]) as ReactElement
            )
            expect(container).toMatchSnapshot()
        })

        it('should return default value when passer undefined, null or an object', () => {
            expect(utils.guessFieldValueFromRawData({key: 'value'})).toBe('-')
            expect(utils.guessFieldValueFromRawData(undefined)).toBe('-')
            expect(utils.guessFieldValueFromRawData(null)).toBe('-')
        })

        it('should work when passed an immutable object', () => {
            expect(
                utils.guessFieldValueFromRawData(fromJS({key: 'value'}))
            ).toBe('-')
        })

        it('should return "Undetermined value" when passed an array of objects', () => {
            expect(utils.guessFieldValueFromRawData([{foo: 'bar'}])).toBe(
                'Undetermined value'
            )
        })
    })

    describe('getLocalTime()', () => {
        const enGBDateTimeFormat = getDateAndTimeFormat(
            DateFormatType.en_GB,
            TimeFormatType.TwentyFourHour,
            DateAndTimeFormatting.TimeDoubleDigitHour
        )
        const enUSDateTimeFormat = getDateAndTimeFormat(
            DateFormatType.en_US,
            TimeFormatType.AmPm,
            DateAndTimeFormatting.TimeDoubleDigitHour
        )
        const nowDates = [
            {
                timezoneOffset: '+0100',
                expectedLocalTime: '13:34',
                datetimeFormat: enGBDateTimeFormat,
            },
            {
                timezoneOffset: '+0900',
                expectedLocalTime: '21:34',
                datetimeFormat: enGBDateTimeFormat,
            },
            {
                timezoneOffset: '+0000',
                expectedLocalTime: '12:34',
                datetimeFormat: enGBDateTimeFormat,
            },
            {
                timezoneOffset: '-0300',
                expectedLocalTime: '09:34',
                datetimeFormat: enGBDateTimeFormat,
            },
            {
                timezoneOffset: '-0500',
                expectedLocalTime: '07:34',
                datetimeFormat: enGBDateTimeFormat,
            },
            {
                timezoneOffset: '+1200',
                expectedLocalTime: '00:34',
                datetimeFormat: enGBDateTimeFormat,
            },
            {
                timezoneOffset: '+0100',
                expectedLocalTime: '01:34 PM',
                datetimeFormat: enUSDateTimeFormat,
            },
            {
                timezoneOffset: '+0900',
                expectedLocalTime: '09:34 PM',
                datetimeFormat: enUSDateTimeFormat,
            },
            {
                timezoneOffset: '+0000',
                expectedLocalTime: '12:34 PM',
                datetimeFormat: enUSDateTimeFormat,
            },
            {
                timezoneOffset: '-0300',
                expectedLocalTime: '09:34 AM',
                datetimeFormat: enUSDateTimeFormat,
            },
            {
                timezoneOffset: '-0500',
                expectedLocalTime: '07:34 AM',
                datetimeFormat: enUSDateTimeFormat,
            },
            {
                timezoneOffset: '+1200',
                expectedLocalTime: '12:34 AM',
                datetimeFormat: enUSDateTimeFormat,
            },
        ]

        it.each(nowDates)(
            'should correctly format local time in the hh:mm format',
            (obj: {
                timezoneOffset: string
                expectedLocalTime: string
                datetimeFormat: DateTimeResultFormatType
            }) => {
                const fixedUtcDate = moment.utc('2019-01-26T12:34:56.000Z')
                jest.spyOn(moment, 'utc').mockImplementationOnce(
                    () => fixedUtcDate
                )

                const result = utils.getLocalTime(
                    obj.timezoneOffset,
                    obj.datetimeFormat
                )
                expect(result).toBe(obj.expectedLocalTime)
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
            [{type: 'wrapper', path: 'foo'}, fromJS({})],
            [
                {
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        {type: 'wrapper', path: 'bar'},
                        {type: 'card', path: 'baz'},
                    ],
                },
                fromJS({}),
            ],
            [
                {
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        {
                            type: 'card',
                            path: 'bar',
                            widgets: [{type: 'text', path: 'baz'}],
                        },
                    ],
                },
                fromJS({foo: {bar: {baz: null}}}),
            ],
            [
                {
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        {
                            type: 'list',
                            path: 'bar',
                            widgets: [{type: 'text', path: 'baz'}],
                        },
                    ],
                },
                fromJS({foo: {bar: []}}),
            ],
            [
                {
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        {
                            type: 'list',
                            path: 'bar',
                            widgets: [{type: 'text', path: 'baz'}],
                        },
                    ],
                },
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
                {
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        {
                            type: 'card',
                            path: 'bar',
                            widgets: [
                                {type: 'text', path: 'baz'},
                                {type: 'text', path: 'buz'},
                            ],
                        },
                    ],
                },
                fromJS({foo: {bar: {baz: 'baz!', buz: ''}}}),
            ],
            [
                {
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        {
                            type: 'list',
                            path: 'bar',
                            widgets: [
                                {type: 'text', path: 'baz'},
                                {type: 'text', path: 'buz'},
                            ],
                        },
                    ],
                },
                fromJS({foo: {bar: [{baz: 'baz!', buz: ''}]}}),
            ],
            [
                {
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        {
                            type: 'card',
                            path: 'bar',
                            meta: {
                                custom: {
                                    links: ['a link'],
                                },
                            },
                        },
                    ],
                },
                fromJS({}),
            ],
            [
                {
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        {
                            type: 'card',
                            path: 'bar',
                            meta: {
                                custom: {
                                    buttons: ['a button'],
                                },
                            },
                        },
                    ],
                },
                fromJS({}),
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
            global.innerWidth = 1800
            const expected = global.innerWidth / 5.1
            expect(utils.getInfobarMinWidth()).toBe(expected)
        })

        it('should return limit because the calculated width is smaller than the limit', () => {
            global.innerWidth = 1700
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

    describe('stringifyRawData()', () => {
        it('should return null because passed data is undefined', () => {
            expect(utils.stringifyRawData(undefined, '')).toEqual(null)
        })

        it('should return null because passed data is null', () => {
            expect(utils.stringifyRawData(null, '')).toEqual(null)
        })

        it('should return passed data because passed type is `text`', () => {
            expect(utils.stringifyRawData('foo', 'text')).toEqual('foo')
        })

        it('should return passed data as string because passed type is `text`', () => {
            expect(utils.stringifyRawData(1, 'text')).toEqual('1')
        })

        it('should return null when invalid datetime and passed type is `date`', () => {
            expect(utils.stringifyRawData('foo', 'date')).toBeNull()
        })

        it('should return a formatted datetime label because passed type is `date`', () => {
            expect(utils.stringifyRawData('2017-12-14T16:34', 'date')).toBe(
                '2017-12-14T16:34:00Z'
            )
        })

        it('should return a formatted datetime label because passed type is `date`', () => {
            expect(utils.stringifyRawData(1513269240000, 'date')).toBe(
                '2017-12-14T16:34:00Z'
            )
        })

        it('should return an age string because passed type is `age` and passed data is a valid datetime', () => {
            const expectedAge = 2
            const currentYear = new Date().getFullYear()

            const year = `${currentYear - expectedAge}-01-01`
            expect(utils.stringifyRawData(`${year} 00:05:00`, 'age')).toEqual(
                `${expectedAge} (${year})`
            )
        })

        it('should return an age string label because passed type is `date`', () => {
            expect(utils.stringifyRawData(1513269240000, 'age')).toBe(
                '5 (2017-12-14)'
            )
        })

        it('should return passed data because passed type is `age` and passed data is not a valid datetime', () => {
            expect(utils.stringifyRawData('foo', 'age')).toBeNull()
        })

        it('should return the url because passed type is `url` and passed data is an url', () => {
            expect(utils.stringifyRawData('https://gorgias.io', 'url')).toBe(
                'https://gorgias.io'
            )
        })

        it('should return null because passed type is `url` and passed data is not an url', () => {
            expect(utils.stringifyRawData('foo', 'url')).toBeNull()
            expect(utils.stringifyRawData(1, 'url')).toBeNull()
            expect(utils.stringifyRawData('google.com', 'url')).toBeNull()
        })

        it('should return the emai because passed type is `email` and passed data is an email address', () => {
            expect(
                utils.stringifyRawData('developers@gorgias.io', 'email')
            ).toBe('developers@gorgias.io')
        })

        it('should return null because passed type is `email` and passed data is not an email', () => {
            expect(utils.stringifyRawData('foo', 'email')).toBeNull()
            expect(utils.stringifyRawData(1, 'email')).toBeNull()
            expect(utils.stringifyRawData('google.com', 'email')).toBeNull()
        })

        it('should return `true` because passed type is `boolean` and passed data is a `true` value', () => {
            expect(utils.stringifyRawData('true', 'boolean')).toBe('true')
            expect(utils.stringifyRawData('1', 'boolean')).toBe('true')
            expect(utils.stringifyRawData(1, 'boolean')).toBe('true')
            expect(utils.stringifyRawData(42, 'boolean')).toBe('true')
        })

        it('should return `false` because passed type is `boolean` and passed data is a `false` value', () => {
            expect(utils.stringifyRawData('false', 'boolean')).toBe('false')
            expect(utils.stringifyRawData('0', 'boolean')).toBe('false')
            expect(utils.stringifyRawData(0, 'boolean')).toBe('false')
        })

        const validValues: [string | number, string, string | null][] = [
            ['1', 'sentiment', 'Positive'],
            [1, 'sentiment', 'Positive'],
            ['-1', 'sentiment', 'Negative'],
            [-1, 'sentiment', 'Negative'],
            ['0', 'sentiment', 'Negative'],
            [0, 'sentiment', 'Negative'],
            ['1', 'rating', '1'],
            [1, 'rating', '1'],
            [5, 'rating', '5'],
            ['1', 'points', '1'],
            [1, 'points', '1'],
            [555, 'points', '555'],
            ['1', 'percent', '1%'],
            [1, 'percent', '1%'],
            [555, 'percent', '555%'],
        ]

        it.each(validValues)(
            'given %p and %p as arguments, returns correct value',
            (data, type, expected) => {
                expect(utils.stringifyRawData(data, type)).toBe(expected)
            }
        )

        const defaultValues = [
            ['hello', 'sentiment'],
            ['hello', 'rating'],
            ['hello', 'points'],
            ['hello', 'percent'],
        ]

        it.each(defaultValues)(
            'given %p and %p as arguments, returns default value',
            (data, type) => {
                expect(utils.stringifyRawData(data, type)).toBeNull()
            }
        )
    })

    describe('jsonToWidgets()', () => {
        it('should convert json to widgets', () => {
            expect(
                utils.jsonToWidgets(
                    jsonToCovertToWidgets,
                    WidgetContextType.Customer
                )
            ).toMatchSnapshot()
        })
    })
})
