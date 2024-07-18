import {fromJS} from 'immutable'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import {WidgetEnvironment} from 'state/widgets/types'

import {jsonToCovertToWidgets} from 'pages/common/components/infobar/tests/fixtures'
import {getDateAndTimeFormat} from 'utils/datetime'
import {
    DateTimeResultFormatType,
    DateFormatType,
    TimeFormatType,
    DateAndTimeFormatting,
} from 'constants/datetime'
import {Template, Source} from 'models/widget/types'
import * as utils from '../utils'

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

        const context = WidgetEnvironment.Ticket

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
        const emptyValues: [Template, Source][] = [
            [{type: 'wrapper', path: 'foo'} as Template, {}],
            [
                {
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        {type: 'wrapper', path: 'bar'},
                        {type: 'card', path: 'baz'},
                    ],
                } as Template,
                {},
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
                } as Template,
                {foo: {bar: {baz: null}}},
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
                } as Template,
                {foo: {bar: []}},
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
                } as Template,
                {foo: {bar: [{baz: null}]}},
            ],
            [
                {
                    type: 'wrapper',
                    path: 'foo',
                    widgets: [
                        {type: 'wrapper', path: 'bar'},
                        {type: 'card', path: 'baz'},
                    ],
                } as Template,
                undefined,
            ],
            [
                {
                    type: 'list',
                    path: 'bar',
                    widgets: [
                        {
                            type: 'card',
                            path: '',
                            widgets: [
                                {type: 'text', path: 'baz'},
                                {type: 'text', path: 'buz'},
                            ],
                        },
                    ],
                } as Template,
                {bar: [{baz: '', buz: ''}]},
            ],
        ]

        it.each(emptyValues)(
            'should return `true` because widget is empty',
            (widget, source) => {
                const result = utils.isWidgetEmpty(widget, source)
                expect(result).toBe(true)
            }
        )

        const validValues: [Template, Source][] = [
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
                } as Template,
                {foo: {bar: {baz: 'baz!', buz: ''}}},
            ],
            [
                {
                    type: 'wrapper',
                    widgets: [
                        {
                            type: 'list',
                            path: 'bar',
                            widgets: [{type: 'text', path: 'baz'}],
                        },
                    ],
                } as Template,
                {bar: [{baz: 'baz!', buz: ''}]},
            ],
            [
                {
                    type: 'list',
                    path: 'bar',
                    widgets: [
                        {
                            type: 'card',
                            path: '',
                            widgets: [
                                {type: 'text', path: 'baz'},
                                {type: 'text', path: 'buz'},
                            ],
                        },
                    ],
                } as Template,
                {bar: [{baz: '', buz: 'miam'}]},
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

    describe('jsonToWidgets()', () => {
        it('should convert json to widgets', () => {
            expect(
                utils.jsonToWidgets(
                    jsonToCovertToWidgets,
                    WidgetEnvironment.Customer
                )
            ).toMatchSnapshot()
        })
    })
})
