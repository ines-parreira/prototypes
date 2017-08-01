import moment from 'moment'
import {fromJS} from 'immutable'
import plan from '../fixtures/plan'
import * as utils from '../utils'
import {ContentState} from 'draft-js'
import schemasJSON from '../fixtures/openapi'

describe('global utils', () => {
    describe('formatDatetime', () => {
        /* We reset the moment language with its default value.
         *  Because others tests could edit this setting.
         *  We ensure we use the default value for these tests.
         **/
        beforeAll(() => moment.locale('en'))

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

        it('timestamp input as string', () => {
            expect(utils.formatDatetime('1480695366')).toBe('12/02/2016')
        })

        it('timestamp input as number', () => {
            expect(utils.formatDatetime(1480695366)).toBe('12/02/2016')
        })

        it('timestamp input as string decimal', () => {
            expect(utils.formatDatetime('1318781876.721')).toBe('10/16/2011')
        })

        it('timestamp input as number decimal', () => {
            expect(utils.formatDatetime(1318781876.721)).toBe('10/16/2011')
        })
    })

    describe('getLastMessage', () => {
        it('effective sort', () => {
            const messages = [
                {
                    id: 2,
                    created_datetime: '2017-01-13T18:00:00',
                },
                {
                    id: 3,
                    created_datetime: '2017-01-14T18:00:00',
                },
                {
                    id: 1,
                    created_datetime: '2017-01-12T18:00:00',
                }
            ]

            const message = utils.getLastMessage(messages) || {}

            expect(message.id).toBe(3)
        })
    })

    describe('ticketSourceTypes', () => {
        const messages = [
            {source: {type: 'system-message'}},
            {source: {type: 'system-message'}},
            {},
            {source: {type: 'chat'}},
            {source: {type: 'email'}},
        ]

        const answer = ['system-message', 'chat', 'email']

        expect(utils.ticketSourceTypes(messages)).toEqual(answer)
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
            '-------@example.com',
            'email@example.name',
            'email@example.museum',
            'email@example.co.jp',
            'firstname-lastname@example.com',
        ]

        const incorrect = [
            'plainaddress',
            'hello@example',
            'hello@example.',
            '@example.com',
            'hello@exam ple.com',
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

    describe('is email list', () => {
        const correct = [
            'email@example.com',
            'firstname.lastname@example.com',
            'email@subdomain.example.com',
            'firstname+lastname@example.com',
            'email@123.123.123.123',
            '1234567890@example.com',
            'email@example-one.com',
            '_______@example.com',
            '-------@example.com',
            'email@example.name',
            'email@example.museum',
            'email@example.co.jp',
            'firstname-lastname@example.com',
            'test@dev.exam-ple.com',
            'test@dev.example.com, 1234567890@example.com',
            'test@dev.example.com, 1234567890@example.com,'
        ]

        const incorrect = [
            null,
            undefined,
            '',
            'plainaddress',
            '@example.com',
            'hello@examp le.com',
            ',email@example.com',
            'email@example.com, @example.com,,',
            'email@example.com, @example.com, email@example.com',
            'email@example.com, , email@example.com,',
        ]

        it('detection OK', () => {
            correct.forEach((input) => {
                expect(utils.isEmailList(input)).toBe(true)
            })
        })

        it('detection KO', () => {
            incorrect.forEach((input) => {
                expect(utils.isEmailList(input)).toBe(false)
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
            const text = 'Hey There!\n\nwww.google.com\n\nAnother link: http://www.gorgias.io'
            const contentState = ContentState.createFromText(text)
            expect(utils.convertToHTML(contentState)).toEqual('<div>Hey There!</div><br><div><a href="http://www.google.com" class="linkified" target="_blank">www.google.com</a></div><br><div>Another link: <a href="http://www.gorgias.io" class="linkified" target="_blank">http://www.gorgias.io</a></div>')
        })

        it('should NOT convert adjacent links to html correctly (www.xxx.comwww.yyy.com)', () => {
            const text = 'Hey Marie Curie,\nmultiple links: www.facebook.comwww.github.com\n\nThanks for contacting us.'
            const contentState = ContentState.createFromText(text)
            expect(utils.convertToHTML(contentState)).toEqual('<div>Hey Marie Curie,</div><div>multiple links: <a href="http://www.facebook.comwww.github.com" class="linkified" target="_blank">www.facebook.comwww.github.com</a></div><br><div>Thanks for contacting us.</div>')
        })
    })

    describe('humanize string', () => {
        const inputs = [
            {
                value: '',
                expect: ''
            },
            {
                value: 'ticket',
                expect: 'Ticket'
            },
            {
                value: 'customerOrders',
                expect: 'Customer orders'
            },
            {
                value: 'order_id',
                expect: 'Order id'
            },
            {
                value: 'helper hello',
                expect: 'Helper hello'
            }
        ]

        it('transform OK', () => {
            inputs.forEach((input) => {
                expect(utils.humanizeString(input.value)).toBe(input.expect)
            })
        })
    })

    describe('subdomain', () => {
        const inputs = [
            {
                value: '',
                expect: ''
            },
            {
                value: 'acme',
                expect: 'acme'
            },
            {
                value: 'acme.shopify.com',
                expect: 'acme'
            },
            {
                value: 'http://acme',
                expect: 'acme'
            },
            {
                value: 'http://acme.shopify.com',
                expect: 'acme'
            }
        ]

        it('transform OK', () => {
            inputs.forEach((input) => {
                expect(utils.subdomain(input.value)).toBe(input.expect)
            })
        })
    })

    describe('resolvePropertyName', () => {
        it('should resolve property name', () => {
            expect(utils.resolvePropertyName('Attachment')).toEqual('Attachment')
            expect(utils.resolvePropertyName('Widget')).toEqual('Widget')
            expect(utils.resolvePropertyName('View')).toEqual('View')
            expect(utils.resolvePropertyName('UserSetting')).toEqual('UserSetting')
            expect(utils.resolvePropertyName('UserConnection')).toEqual('UserConnection')
            expect(utils.resolvePropertyName('ViewCount')).toEqual('ViewCount')
            expect(utils.resolvePropertyName('User')).toEqual('User')
            expect(utils.resolvePropertyName('Ticket')).toEqual('Ticket')
            expect(utils.resolvePropertyName('Macro')).toEqual('Macro')
            expect(utils.resolvePropertyName('Account')).toEqual('Account')
            expect(utils.resolvePropertyName('UserAuth')).toEqual('UserAuth')
            expect(utils.resolvePropertyName('IntegrationSmooch')).toEqual('IntegrationSmooch')
            expect(utils.resolvePropertyName('Integration')).toEqual('Integration')
            expect(utils.resolvePropertyName('Role')).toEqual('Role')
            expect(utils.resolvePropertyName('Action')).toEqual('Action')
            expect(utils.resolvePropertyName('UserChannel')).toEqual('UserChannel')
            expect(utils.resolvePropertyName('SourceAddress')).toEqual('SourceAddress')
            expect(utils.resolvePropertyName('IntegrationMapping')).toEqual('IntegrationMapping')
            expect(utils.resolvePropertyName('IntegrationFacebook')).toEqual('IntegrationFacebook')
            expect(utils.resolvePropertyName('Event')).toEqual('Event')
            expect(utils.resolvePropertyName('Tag')).toEqual('Tag')
            expect(utils.resolvePropertyName('Source')).toEqual('Source')
            expect(utils.resolvePropertyName('CustomerRating')).toEqual('CustomerRating')
            expect(utils.resolvePropertyName('IntegrationHTTP')).toEqual('IntegrationHTTP')
            expect(utils.resolvePropertyName('Rule')).toEqual('Rule')

            expect(utils.resolvePropertyName('Message')).toEqual('TicketMessage')
        })
    })

    describe('findProperty', () => {
        const schemas = fromJS(schemasJSON)

        it('should find property (always use ref)', () => {
            expect(utils.findProperty('ticket.tags.name', schemas, true))
                .toEqual(schemas.getIn(['definitions', 'Tag', 'properties', 'name']).toJS())
        })

        it('should find property (not always use ref)', () => {
            expect(utils.findProperty('ticket.requester.id', schemas))
                .toEqual(schemas.getIn(['definitions', 'User', 'properties', 'id']).toJS())
            expect(utils.findProperty('message.source.from.address', schemas))
                .toEqual(schemas.getIn(['definitions', 'SourceAddress', 'properties', 'address']).toJS())
            expect(utils.findProperty('ticket.tags.name', schemas))
                .toEqual(schemas.getIn(['definitions', 'Ticket', 'properties', 'tags']).toJS())
        })
    })


    describe('proxifyImages', () => {
        beforeEach(() => {
            window.IMAGE_PROXY_URL = 'http://proxy-url/'
        })

        it('should not touch html with not img', () => {
            expect(utils.proxifyImages('<span>123</span>')).toMatchSnapshot()
        })

        it('should work with no format', () => {
            expect(utils.proxifyImages('<img src="hello" />')).toMatchSnapshot()
        })

        it('should work with format', () => {
            expect(utils.proxifyImages('<img src="hello" />'), '100x100').toMatchSnapshot()
        })

        it('should raise if IMAGE_PROXY_URL is not defined', () => {
            window.IMAGE_PROXY_URL = ''
            expect(() => utils.proxifyImages('<img src="hello" />')).toThrow()
        })

        it('should work with no src', () => {
            expect(utils.proxifyImages('<img alt="no-src" />')).toMatchSnapshot()
        })

        it('should work with self closing', () => {
            expect(utils.proxifyImages('<br />')).toMatchSnapshot()
        })

        it('should work with richer complex html', () => {
            expect(utils.proxifyImages(`<div class="something">
<i>italic</i><b>bold</b><u>under</u>
<span>xxxxxsp <span>inside <span>inside a span</span></span> </span>
<uknown-tag>11233</uknown-tag>
<img alt="no-src">
<img src="some-image" alt="bla ">
<strong><img src="image2"></strong>
</div>
`)).toMatchSnapshot()
        })
    })

    describe('hoursToSeconds', () => {
        it('should return zero for undefined', () => {
            expect(utils.hoursToSeconds()).toBe(0)
        })

        it('should return zero for non-numbers', () => {
            expect(utils.hoursToSeconds('1')).toBe(0)
        })

        it('should convert hours to seconds', () => {
            expect(utils.hoursToSeconds(2)).toBe(2 * 60 * 60)
        })
    })

    describe('validateWebhookURL', () => {
        it('should not allow http protocol', () => {
            const url = 'http://foobar.com'
            expect(utils.validateWebhookURL(url)).not.toEqual('')
        })

        it('should not allow port specifications', () => {
            const url = 'https://foobar.com:8080'
            expect(utils.validateWebhookURL(url)).not.toEqual('')
        })

        it('should require a TLD', () => {
            const url = 'https://rmq0'
            expect(utils.validateWebhookURL(url)).not.toEqual('')
        })

        it('should not allow .local TLD', () => {
            const url = 'https://foobar.local/'
            expect(utils.validateWebhookURL(url)).not.toEqual('')
        })

        it('should not allow .internal TLD', () => {
            const url = 'https://foobar.internal/'
            expect(utils.validateWebhookURL(url)).not.toEqual('')
        })

        it('should render multiple errors for each error in url', () => {
            const url = 'http://foobar.local'
            expect(utils.validateWebhookURL(url)).toContain('+')
        })
    })
})
