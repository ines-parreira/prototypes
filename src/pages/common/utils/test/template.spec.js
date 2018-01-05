import {renderTemplate} from '../template'
import moment from 'moment'

describe('components utils : template', () => {
    describe('renderTemplate', () => {
        it('invalid body', () => {
            expect(renderTemplate()).toBe('')
            expect(renderTemplate('')).toBe('')
            expect(renderTemplate(null)).toBe('')
            expect(renderTemplate(undefined)).toBe('')
        })

        it('does not throw error when context is undefined', () => {
            expect(renderTemplate('Hello')).toBe('Hello')
        })

        it('interpolates correctly', () => {
            expect(renderTemplate('Hello {{something}}', {
                something: 'world'
            })).toBe('Hello world')
        })

        it('interpolates nested object', () => {
            expect(renderTemplate('Hello {{somebody.name}}, how about a nice {{something.name}}?', {
                somebody: {
                    name: 'Michael'
                },
                something: {
                    name: 'cup of tea',
                    temperature: 300
                }
            })).toBe('Hello Michael, how about a nice cup of tea?')
        })

        it('interpolates nested nested object', () => {
            expect(renderTemplate('Hello {{somebody.bestFriend.name}}', {
                somebody: {
                    bestFriend: {
                        name: 'Michael'
                    }
                }
            })).toBe('Hello Michael')
        })

        it('return passed text without templates if interpolation fails', () => {
            const text = 'Hello {{somebody.bestFriend.name}}'
            const result = 'Hello '

            expect(renderTemplate(text, {
                somebody: {
                    bestEnemy: {
                        name: 'Michael'
                    }
                }
            })).toBe(result)
        })

        it('interpolates available variables and ignores missing ones', () => {
            expect(renderTemplate('Hello {{somebody.name}}, how about a nice {{something.name}}?', {
                somebody: {
                    name: 'Michael'
                },
            })).toBe('Hello Michael, how about a nice ?')
        })

        it('render 0 numbers', () => {
            expect(renderTemplate('You have {{sum}} orders.', {
                sum: 0,
            })).toBe('You have 0 orders.')
        })

        it('empty string for null', () => {
            expect(renderTemplate('You have {{sum}} orders.', {
                sum: null,
            })).toBe('You have  orders.')
        })

        it('empty string for undefined', () => {
            expect(renderTemplate('You have {{sum}} orders.', {
                sum: undefined,
            })).toBe('You have  orders.')
        })

        it('render format datetime', () => {
            expect(renderTemplate('{{date|datetime_format("YYYY")}}', {
                date: '2018-01-02',
            })).toBe('2018')
        })
        it('render format datetime (different format)', () => {
            expect(renderTemplate('{{date|datetime_format("YYYY-MM")}}', {
                date: '2018-01-02',
            })).toBe('2018-01')
        })

        it('render the fallback', () => {
            expect(renderTemplate('Hi {{x|fallback("there")}}', {
                x: 'Alex',
            })).toBe('Hi Alex')

            expect(renderTemplate('Hi {{x|fallback("there")}}', {
                x: '',
            })).toBe('Hi there')

            expect(renderTemplate('Hi {{x|fallback("there")}}', {
                y: 'Alex',
            })).toBe('Hi there')
        })

        it.skip('render relative datetime', () => {
            expect(renderTemplate('{{date|datetime_relative()}}', {
                date: moment().subtract(2, 'days').format(),
            })).toBe('2 days ago')
        })
        it.skip('render relative datetime - without postfix', () => {
            expect(renderTemplate('{{date|datetime_relative(true)}}', {
                date: moment().subtract(2, 'days').format(),
            })).toBe('2 days')
        })
        it.skip('render calendar datetime', () => {
            expect(renderTemplate('{{date|datetime_calendar()}}', {
                date: moment().subtract(1, 'hour').format(),
            })).toBe('Today at ' + moment().subtract(1, 'hour').format('h:mm A'))
        })
        it.skip('render relative calendar - custom', () => {
            expect(renderTemplate('{{date|datetime_calendar(null, {sameDay: "[Td at] LT"})}}', {
                date: moment().subtract(1, 'hour').format(),
            })).toBe('Td at ' + moment().subtract(1, 'hour').format('h:mm A'))
        })
        it.skip('render relative calendar - custom', () => {
            expect(renderTemplate('{{date|datetime_calendar(null, {sameDay: "[Today at] LT zz"})}}', {
                date: moment().subtract(1, 'hour').format(),
            })).toBe('Today at ' + moment().subtract(1, 'hour').format('h:mm A'))
        })
        it('should ignore unknown filters and just render the value', () => {
            expect(renderTemplate('{{x|unknown()}}', {
                x: 123
            })).toBe('123')
        })
        it('should not execute XSS', () => {
            expect(renderTemplate('{{x|datetime_relative(alert(123))}}', {
                x: 123
            })).toBe('{{x|datetime_relative(alert(123))}}')
        })
    })
})
