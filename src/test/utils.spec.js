import expect from 'expect'
import moment from 'moment'
import * as utils from '../utils'

describe('global utils', () => {
    describe('formatDatetime', () => {
        /* We reset the moment language with its default value.
         *  Because others tests could edit this setting.
         *  We ensure we use the default value for these tests.
         **/
        before(() => moment.locale('en'))

        it('invalid', () => {
            // to disable warning
            moment.createFromInputFallback = function fallback(config) {
                // unreliable string magic, or
                /* eslint-disable */
                config._d = new Date(config._i)
                /* eslint-enable */
            }
            expect(utils.formatDatetime('test')).toBe('Invalid date')
        })

        it('valid default format', () => {
            expect(utils.formatDatetime('2013-05-10 12:00')).toBe('05/10/2013')
        })

        it('invalid timezone defaults to UTC', () => {
            expect(utils.formatDatetime('2013-05-10 12:00', 'xxx')).toBe('05/10/2013')
        })

        it('iso format - with timezone', () => {
            const time = utils.formatDatetime('2016-06-09T07:30:07+00:00', 'Europe/Paris', 'YYYY-DD-MM HH:mm')
            expect(time).toBe('2016-09-06 09:30')
        })
    })

    describe('lastMessage', () => {
        it('effective sort', () => {
            const messages = [
                {
                    id: 2,
                    created_datetime: new Date('2016-01-13')
                },
                {
                    id: 3,
                    created_datetime: new Date('2016-01-14')
                },
                {
                    id: 1,
                    created_datetime: new Date('2016-01-12')
                }
            ]

            const message = utils.lastMessage(messages) || {}

            expect(message.id).toBe(3)
        })
    })

    describe('firstMessage', () => {
        it('effective sort', () => {
            const messages = [
                {
                    id: 2,
                    created_datetime: new Date('2016-01-13')
                },
                {
                    id: 3,
                    created_datetime: new Date('2016-01-14')
                },
                {
                    id: 1,
                    created_datetime: new Date('2016-01-12')
                }
            ]

            const message = utils.firstMessage(messages) || {}

            expect(message.id).toBe(1)
        })
    })

    describe('is email', () => {
        const correct = [
            'email@example.com',
            'firstname.lastname@example.com',
            'email@subdomain.example.com',
            'firstname+lastname@example.com',
            'email@123.123.123.123',
            '1234567890@example.com',
            'email@example-one.com',
            '_______@example.com',
            'email@example.name',
            'email@example.museum',
            'email@example.co.jp',
            'firstname-lastname@example.com',
            'test@localhost'
        ]

        const incorrect = [
            'plainaddress',
            '@example.com'
        ]

        it('detection OK', () => {
            correct.forEach((input) => {
                expect(utils.isEmail(input)).toBe(true)
            })
        })

        it('detection KO', () => {
            incorrect.forEach((input) => {
                expect(utils.isEmail(input)).toBe(false)
            })
        })
    })

    describe('is editable', () => {
        const input = document.createElement('input')
        const select = document.createElement('select')
        const textarea = document.createElement('textarea')

        const notEditable = document.createElement('div')

        it('input', () => {
            expect(utils.isEditable(input)).toBe(true)
        })

        it('select', () => {
            expect(utils.isEditable(select)).toBe(true)
        })

        it('textarea', () => {
            expect(utils.isEditable(textarea)).toBe(true)
        })

        // can't test for contenteditable,
        // jsdom does not support it.

        it('not editable', () => {
            expect(utils.isEditable(notEditable)).toBe(false)
        })
    })
})
