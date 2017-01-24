import expect from 'expect'
import expectImmutable from 'expect-immutable'
import moment from 'moment'
import {renderTemplate} from '../template'
import {formatDatetime} from '../../../../utils'

expect.extend(expectImmutable)

describe('components utils : template', () => {
    describe('renderTemplate', () => {
        /* We reset the moment language with its default value.
         *  Because others tests could edit this setting.
         *  We ensure we use the default value for these tests.
         **/
        before(() => moment.locale('en'))

        it('does not throw error when context is undefined', () => {
            expect(renderTemplate('Hello')).toBe('Hello')
        })

        it('interpolates correctly', () => {
            expect(renderTemplate('Hello {something}', {
                something: 'world'
            })).toBe('Hello world')
        })

        it('interpolates nested object', () => {
            expect(renderTemplate('Hello {somebody.name}, how about a nice {something.name} ?', {
                somebody: {
                    name: 'Michael'
                },
                something: {
                    name: 'cup of tea',
                    temperature: 300
                }
            })).toBe('Hello Michael, how about a nice cup of tea ?')
        })

        it('interpolates nested nested object', () => {
            expect(renderTemplate('Hello {somebody.bestFriend.name}', {
                somebody: {
                    bestFriend: {
                        name: 'Michael'
                    }
                }
            })).toBe('Hello Michael')
        })

        it('interpolates functions', () => {
            expect(renderTemplate('Hello {func()}', {
                func: () => 'world'
            })).toBe('Hello world')
        })

        it('interpolates dates correctly', () => {
            const date = new Date

            expect(renderTemplate('We are the {formatDatetime(date)}', {
                date
            })).toBe(`We are the ${formatDatetime(date)}`)
        })

        it('return passed text without templates if interpolation fails', () => {
            const text = 'Hello {somebody.bestFriend.name}'
            const result = 'Hello '

            expect(renderTemplate(text, {
                somebody: {
                    bestEnemy: {
                        name: 'Michael'
                    }
                }
            })).toBe(result)
        })
    })
})
