import expect from 'expect'
import moment from 'moment'
import {fromJS} from 'immutable'
import plan from '../fixtures/plan'
import * as utils from '../utils'
import { ContentState } from 'draft-js'

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

    describe('getLastMessage', () => {
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

            const message = utils.getLastMessage(messages) || {}

            expect(message.id).toBe(3)
        })
    })

    describe('getFirstMessage', () => {
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

            const message = utils.getFirstMessage(messages) || {}

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

    describe('usage', () => {
        const _plan = fromJS(plan)

        it('should determine if user has reached min limit', () => {
            expect(utils.hasReachedLimit('min', plan.limits.min - 1, _plan)).toEqual(false)
            expect(utils.hasReachedLimit('min', plan.limits.min, _plan)).toEqual(true)
        })

        it('should determine if user has reached default limit', () => {
            expect(utils.hasReachedLimit('default', plan.free_tickets - 1, _plan)).toEqual(false)
            expect(utils.hasReachedLimit('default', plan.free_tickets, _plan)).toEqual(true)
        })

        it('should determine if user has reached max limit', () => {
            expect(utils.hasReachedLimit('max', plan.limits.max - 1, _plan)).toEqual(false)
            expect(utils.hasReachedLimit('max', plan.limits.max, _plan)).toEqual(true)
        })
    })

    describe('toQueryParams', () => {
        it('should convert object to query params', () => {
            const obj = {
                a: 12,
                c: 14
            }
            expect(utils.toQueryParams(obj)).toEqual('a=12&c=14')
        })
    })

    describe('hasRole', () => {
        it('should determine if user has required role (agent)', () => {
            const user = fromJS({
                roles: [{
                    name: 'agent'
                }]
            })
            expect(utils.hasRole(user, 'agent')).toEqual(true)
            expect(utils.hasRole(user, 'admin')).toEqual(false)
            expect(utils.hasRole(user, 'staff')).toEqual(false)
        })

        it('should determine if user has required role (admin)', () => {
            // as admin
            let user = fromJS({
                roles: [{
                    name: 'admin'
                }]
            })
            expect(utils.hasRole(user, 'agent')).toEqual(true)
            expect(utils.hasRole(user, 'admin')).toEqual(true)

            // as staff
            user = fromJS({
                roles: [{
                    name: 'staff'
                }]
            })
            expect(utils.hasRole(user, 'agent')).toEqual(true)
            expect(utils.hasRole(user, 'admin')).toEqual(true)
        })
    })


    describe('toHTML', () => {
        it('should convert links (www.xxx.com) to html', () => {
            const text = 'Hello there\n\nwww.google.com'
            const contentState = ContentState.createFromText(text)
            expect(utils.convertToHTML(contentState)).toEqual('<div>Hello there</div><br><div><a href="http://www.google.com" class="linkified" target="_blank">www.google.com</a></div>')
        })

        it('should convert links (xxx.com) to html', () => {
            const text = 'Hello there\n\ngoogle.com'
            const contentState = ContentState.createFromText(text)
            expect(utils.convertToHTML(contentState)).toEqual('<div>Hello there</div><br><div><a href="http://google.com" class="linkified" target="_blank">google.com</a></div>')
        })

        it('should convert multiple links to html', () => {
            const text = 'Hey There!\n\nwww.google.com\n\nAnother link: www.gorgias.io'
            const contentState = ContentState.createFromText(text)
            expect(utils.convertToHTML(contentState)).toEqual('<div>Hey There!</div><br><div><a href="http://www.google.com" class="linkified" target="_blank">www.google.com</a></div><br><div>Another link: <a href="http://www.gorgias.io" class="linkified" target="_blank">www.gorgias.io</a></div>')
        })

        it('should NOT convert adjacent links to html correctly (www.xxx.comwww.yyy.com)', () => {
            const text = 'Hey Marie Curie,\nmultiple links: www.facebook.comwww.github.com\n\nThanks for contacting us.'
            const contentState = ContentState.createFromText(text)
            expect(utils.convertToHTML(contentState)).toEqual('<div>Hey Marie Curie,</div><div>multiple links: <a href="http://www.facebook.comwww.github.com" class="linkified" target="_blank">www.facebook.comwww.github.com</a></div><br><div>Thanks for contacting us.</div>')

        })
    })
  
    describe('emoji', () => {
        it('should return same string if twemoji is not loaded', () => {
            expect(utils.emoji('🚀')).toEqual('🚀')

        })
    })
})
