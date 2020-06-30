//@flow
import _isString from 'lodash/isString'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _isBoolean from 'lodash/isBoolean'

import * as ticketConfig from '../ticket'

describe('Config: ticket', () => {
    describe('DEFAULT_CHANNEL', () => {
        it('is string', () => {
            expect(_isString(ticketConfig.DEFAULT_CHANNEL)).toBe(true)
        })
    })

    describe('DEFAULT_SOURCE_TYPE', () => {
        it('is string', () => {
            expect(_isString(ticketConfig.DEFAULT_SOURCE_TYPE)).toBe(true)
        })
    })

    describe('STATUSES', () => {
        it('is array', () => {
            expect(_isArray(ticketConfig.STATUSES)).toBe(true)
        })
    })

    describe('CHANNELS', () => {
        it('is array', () => {
            expect(_isArray(ticketConfig.CHANNELS)).toBe(true)
        })
    })

    describe('SYSTEM_SOURCE_TYPES', () => {
        it('is array', () => {
            expect(_isArray(ticketConfig.SYSTEM_SOURCE_TYPES)).toBe(true)
        })
    })

    describe('USABLE_SOURCE_TYPES', () => {
        it('is array', () => {
            expect(_isArray(ticketConfig.USABLE_SOURCE_TYPES)).toBe(true)
        })
    })

    const variables = ['VARIABLES', 'PREVIOUS_VARIABLES']

    variables.forEach((name) => {
        const value = ticketConfig[name] // eslint-disable-line import/namespace

        describe(name, () => {
            it('is array', () => {
                expect(_isArray(value)).toBe(true)
            })

            it('is array of objects', () => {
                expect(_isObject(value[0])).toBe(true)
            })

            it('structure of objects', () => {
                const object = value[0]
                expect(object).toHaveProperty('name')
                expect(object).toHaveProperty('children')
            })

            it("structure of object's children", () => {
                const child = value[0].children ? value[0].children[0] : {}
                expect(child).toHaveProperty('name')
                expect(child).toHaveProperty('value')
            })
        })
    })

    describe('orderedMessages', () => {
        it('order messages', () => {
            const messages = [
                {
                    id: 1,
                    created_datetime: '2017-07-01T18:00:00',
                },
                {
                    id: 2,
                    created_datetime: '2017-07-02T18:00:00',
                },
            ]

            expect(
                ticketConfig
                    .orderedMessages(messages)
                    .map((message) => message.get('id'))
                    .toJS()
            ).toEqual([1, 2])

            const reversedMessages = [
                {
                    id: 1,
                    created_datetime: '2017-07-02T18:00:00',
                },
                {
                    id: 2,
                    created_datetime: '2017-07-01T18:00:00',
                },
            ]

            expect(
                ticketConfig
                    .orderedMessages(reversedMessages)
                    .map((message) => message.get('id'))
                    .toJS()
            ).toEqual([2, 1])
        })
    })

    describe('isAnswerableType', () => {
        it('is correct', () => {
            const validTypes = ticketConfig.USABLE_SOURCE_TYPES
            const invalidTypes: any = ['test', 123, undefined, null, {}, []]

            validTypes.forEach((type) => {
                expect(ticketConfig.isAnswerableType(type)).toEqual(true)
            })

            invalidTypes.forEach((type) => {
                expect(ticketConfig.isAnswerableType(type)).toEqual(false)
            })
        })
    })

    describe('isSystemType', () => {
        it('is correct', () => {
            const validTypes = ticketConfig.SYSTEM_SOURCE_TYPES
            const invalidTypes: any = ['test', 123, undefined, null, {}, []]

            validTypes.forEach((type) => {
                expect(ticketConfig.isSystemType(type)).toEqual(true)
            })

            invalidTypes.forEach((type) => {
                expect(ticketConfig.isSystemType(type)).toEqual(false)
            })
        })
    })

    describe('lastNonSystemTypeMessage', () => {
        it('falsy if no message', () => {
            const messages = []

            expect(ticketConfig.lastNonSystemTypeMessage(messages)).toBeFalsy()
        })

        it('is correct', () => {
            const lastMessage = ticketConfig.lastNonSystemTypeMessage([
                {
                    id: 1,
                    created_datetime: '2017-07-01T18:00:00',
                },
                {
                    id: 2,
                    created_datetime: '2017-07-02T18:00:00',
                },
            ])

            if (!lastMessage) {
                throw new Error('lastMessage is undefined')
            }
            expect(lastMessage.get('id')).toEqual(2)

            const lastReversedMessage = ticketConfig.lastNonSystemTypeMessage([
                {
                    id: 1,
                    created_datetime: '2017-07-02T18:00:00',
                },
                {
                    id: 2,
                    created_datetime: '2017-07-01T18:00:00',
                },
            ])

            if (!lastReversedMessage) {
                throw new Error('lastReversedMessages is undefined')
            }
            expect(lastReversedMessage.get('id')).toEqual(1)
        })

        it('ignores system messages', () => {
            const systemType = ticketConfig.SYSTEM_SOURCE_TYPES[0]

            const lastMessage = ticketConfig.lastNonSystemTypeMessage([
                {
                    id: 1,
                    created_datetime: '2017-07-01T18:00:00',
                },
                {
                    id: 2,
                    created_datetime: '2017-07-02T18:00:00',
                },
                {
                    id: 3,
                    created_datetime: '2017-07-03T18:00:00',
                    source: {
                        type: systemType,
                    },
                },
            ])

            if (!lastMessage) {
                throw new Error('lastMessage is undefined')
            }
            expect(lastMessage.get('id')).toEqual(2)
        })
    })

    describe('isPublic', () => {
        it('is boolean', () => {
            const values: any = [
                'email',
                'unknown-value',
                1,
                undefined,
                null,
                [],
            ]

            values.forEach((value) => {
                expect(_isBoolean(ticketConfig.isPublic(value))).toBe(true)
            })
        })
    })

    describe('isRichType', () => {
        it('is boolean', () => {
            const values: any = [
                'email',
                'unknown-value',
                1,
                undefined,
                null,
                [],
            ]

            values.forEach((value) => {
                expect(_isBoolean(ticketConfig.isRichType(value))).toBe(true)
            })
        })
    })

    describe('getVariablesList', () => {
        const list = ticketConfig.getVariablesList()

        it('is array', () => {
            expect(_isArray(list)).toBe(true)
        })

        it('is array of objects', () => {
            expect(_isObject(list[0])).toBe(true)
        })

        it('structure of objects', () => {
            const object = list[0]
            expect(object).toHaveProperty('name')
            expect(object).toHaveProperty('value')
            expect(object).toHaveProperty('fullName')
        })
    })

    describe('getVariableWithValue', () => {
        it('undefined if unknown value', () => {
            const invalidValues: any = [undefined, null, 'unknown-variable']

            invalidValues.forEach((value) => {
                expect(ticketConfig.getVariableWithValue(value)).toBe(undefined)
            })
        })

        it('returns correct config object', () => {
            const config =
                ticketConfig.VARIABLES[0].children &&
                ticketConfig.VARIABLES[0].children[0]
            if (!config) {
                throw new Error('config is undefined')
            }
            const result = ticketConfig.getVariableWithValue(config.value)

            expect(result).toHaveProperty('name', config.name)
            expect(result).toHaveProperty('value', config.value)
            expect(result).toHaveProperty('fullName', config.fullName)
        })
    })
})
