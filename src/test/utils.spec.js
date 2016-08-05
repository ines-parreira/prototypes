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
                config._d = new Date(config._i);
                /* eslint-enable */
            };
            expect(utils.formatDatetime('test')).toBe('Invalid date')
        })

        it('valid default format', () => {
            expect(utils.formatDatetime('2013-05-10 12:00')).toBe('05/10/2013')
        })

        it('invalid timezone defaults to UTC', () => {
            expect(utils.formatDatetime('2013-05-10 12:00', 'xxx')).toBe('05/10/2013')
        })

        it('iso format - with timezone', () => {
            const time = utils.formatDatetime('2016-06-09T07:30:07+00:00', 'Europe/Paris', 'YYYY-DD-MM HH:mm');
            expect(time).toBe('2016-09-06 09:30');
        })
    })

    describe('validateEmail', () => {
        it('valid email', () => {
            [
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
                'firstname-lastname@example.com'
            ].forEach((address) => expect(utils.validateEmail(address)).toBe(true))
        })

        it('blocks invalid emails', () => {
            [
                'plainaddress',
                '@example.com'
            ].forEach((address) => expect(utils.validateEmail(address)).toBe(false))
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

            const message = utils.lastMessage(messages)

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

            const message = utils.firstMessage(messages)

            expect(message.id).toBe(1)
        })
    })
})
