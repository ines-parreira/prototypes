import {renderTemplate} from '../template'

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
    })
})
