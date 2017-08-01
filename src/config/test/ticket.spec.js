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

            it('structure of object\'s children', () => {
                const child = value[0].children[0]
                expect(child).toHaveProperty('name')
                expect(child).toHaveProperty('value')
            })
        })
    })

    describe('orderedMessages', () => {
        it('order messages', () => {
            const messages = [{
                id: 1,
                created_datetime: '2017-07-01T18:00:00',
            }, {
                id: 2,
                created_datetime: '2017-07-02T18:00:00',
            }]

            expect(
                ticketConfig.orderedMessages(messages).map(message => message.get('id')).toJS()
            ).toEqual([1, 2])

            const reversedMessages = [{
                id: 1,
                created_datetime: '2017-07-02T18:00:00',
            }, {
                id: 2,
                created_datetime: '2017-07-01T18:00:00',
            }]

            expect(
                ticketConfig.orderedMessages(reversedMessages).map(message => message.get('id')).toJS()
            ).toEqual([2, 1])
        })
    })

    describe('isAnswerableType', () => {
        it('is correct', () => {
            const validTypes = ticketConfig.USABLE_SOURCE_TYPES
            const invalidTypes = ['test', 123, undefined, null, {}, []]

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
            const invalidTypes = ['test', 123, undefined, null, {}, []]

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

            expect(
                ticketConfig.lastNonSystemTypeMessage(messages)
            ).toBeFalsy()
        })

        it('is correct', () => {
            const messages = [{
                id: 1,
                created_datetime: '2017-07-01T18:00:00',
            }, {
                id: 2,
                created_datetime: '2017-07-02T18:00:00',
            }]

            expect(
                ticketConfig.lastNonSystemTypeMessage(messages).get('id')
            ).toEqual(2)

            const reversedMessages = [{
                id: 1,
                created_datetime: '2017-07-02T18:00:00',
            }, {
                id: 2,
                created_datetime: '2017-07-01T18:00:00',
            }]

            expect(
                ticketConfig.lastNonSystemTypeMessage(reversedMessages).get('id')
            ).toEqual(1)
        })

        it('ignores system messages', () => {
            const systemType = ticketConfig.SYSTEM_SOURCE_TYPES[0]

            const messages = [{
                id: 1,
                created_datetime: '2017-07-01T18:00:00',
            }, {
                id: 2,
                created_datetime: '2017-07-02T18:00:00',
            }, {
                id: 3,
                created_datetime: '2017-07-03T18:00:00',
                source: {
                    type: systemType,
                }
            }]

            expect(
                ticketConfig.lastNonSystemTypeMessage(messages).get('id')
            ).toEqual(2)
        })
    })

    describe('isPublic', () => {
        it('is boolean', () => {
            const values = ['email', 'unknown-value', 1, undefined, null, []]

            values.forEach((value) => {
                expect(_isBoolean(ticketConfig.isPublic(value))).toBe(true)
            })
        })
    })

    describe('isRichType', () => {
        it('is boolean', () => {
            const values = ['email', 'unknown-value', 1, undefined, null, []]

            values.forEach((value) => {
                expect(_isBoolean(ticketConfig.isRichType(value))).toBe(true)
            })
        })
    })

    describe('acceptsOnlyImages', () => {
        it('is boolean', () => {
            const values = ['chat', 'email', 'unknown-value', 1, undefined, null, []]

            values.forEach((value) => {
                expect(_isBoolean(ticketConfig.acceptsOnlyImages(value))).toBe(true)
            })
        })
    })

    describe('sourceTypeToIcon', () => {
        it('is string', () => {
            expect(_isString(ticketConfig.sourceTypeToIcon())).toBe(true)

            ticketConfig.USABLE_SOURCE_TYPES.forEach((type) => {
                expect(_isString(ticketConfig.sourceTypeToIcon(type))).toBe(true)
            })

            ticketConfig.SYSTEM_SOURCE_TYPES.forEach((type) => {
                expect(_isString(ticketConfig.sourceTypeToIcon(type))).toBe(true)
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
            const invalidValues = [undefined, null, 'unknown-variable']

            invalidValues.forEach((value) => {
                expect(ticketConfig.getVariableWithValue(value)).toBe(undefined)
            })
        })

        it('returns correct config object', () => {
            const config = ticketConfig.VARIABLES[0].children[0]
            const result = ticketConfig.getVariableWithValue(config.value)

            expect(result).toHaveProperty('name', config.name)
            expect(result).toHaveProperty('value', config.value)
            expect(result).toHaveProperty('fullName', config.fullName)
        })
    })
})
