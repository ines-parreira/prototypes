import moment from 'moment'
import {fromJS, Map, List} from 'immutable'
import randomstring from 'randomstring'

import * as esprima from 'esprima'
import * as utils from 'utils'
import * as envUtils from 'utils/environment'
import schemasJSON from 'fixtures/openapi.json'
import {Account} from 'state/currentAccount/types'
import {isProduction, isStaging} from 'utils/environment'
import {
    ADMIN_ROLE,
    AGENT_ROLE,
    BASIC_AGENT_ROLE,
    LITE_AGENT_ROLE,
    OBSERVER_AGENT_ROLE,
} from 'config/user'
import {getCode} from 'utils'

jest.mock('utils/environment')
const envVarsMock = envUtils.envVars as envUtils.EnvVars

describe('global utils', () => {
    describe('formatDatetime', () => {
        /* We reset the moment language with its default value.
         *  Because others tests could edit this setting.
         *  We ensure we use the default value for these tests.
         **/
        beforeAll(() => moment.locale('en'))

        it('invalid', () => {
            // disable moment warning
            // https://stackoverflow.com/a/34521624/15449849
            ;(
                moment as unknown as {
                    createFromInputFallback: (config: {
                        _d: Date
                        _i: string
                    }) => void
                }
            ).createFromInputFallback = function fallback(config) {
                // unreliable string magic, or
                config._d = new Date(config._i)
            }
            expect(utils.formatDatetime('test')).toBe('Invalid date')
        })

        it('valid default format', () => {
            expect(utils.formatDatetime('2013-05-10 12:00')).toBe('05/10/2013')
        })

        it('invalid timezone defaults to UTC', () => {
            expect(utils.formatDatetime('2013-05-10 12:00', 'xxx')).toBe(
                '05/10/2013'
            )
        })

        it('iso format - with timezone', () => {
            const time = utils.formatDatetime(
                '2016-06-09T07:30:07+00:00',
                'Europe/Paris',
                'YYYY-DD-MM HH:mm'
            )
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
                },
            ] as utils.Message[]

            const message = utils.getLastMessage(messages) || {}

            expect((message as utils.Message).id).toBe(3)
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
            'test@dev.example.com, 1234567890@example.com,',
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

    describe('isCurrentlyOnTicket', () => {
        it('should be true', () => {
            window.location.pathname = '/app/ticket/'
            expect(utils.isCurrentlyOnTicket()).toBe(true)
            window.location.pathname = '/app/ticket/12'
            expect(utils.isCurrentlyOnTicket(12)).toBe(true)
        })

        it('should be false', () => {
            window.location.pathname = '/app/rules'
            expect(utils.isCurrentlyOnTicket()).toBe(false)
            window.location.pathname = '/app/tickets'
            expect(utils.isCurrentlyOnTicket()).toBe(false)
            window.location.pathname = '/app/ticket/12'
            expect(utils.isCurrentlyOnTicket(13)).toBe(false)
        })
    })

    describe('isCurrentlyOnChatCampaignDetailsPage', () => {
        it('should be true', () => {
            window.location.pathname =
                '/app/settings/channels/gorgias_chat/69/campaigns/04c1b674-8800-4d22-9b8f-e93db01ef5de'
            expect(utils.isCurrentlyOnChatCampaignDetailsPage()).toBe(true)
            window.location.pathname =
                '/app/settings/channels/gorgias_chat/123213213/campaigns/1a9720a2-fdac-4cea-9864-d82860dcd3a3'
            expect(utils.isCurrentlyOnChatCampaignDetailsPage()).toBe(true)
        })

        it('should be false', () => {
            window.location.pathname = '/app/settings/channels/gorgias_chat'
            expect(utils.isCurrentlyOnChatCampaignDetailsPage()).toBe(false)
            window.location.pathname =
                'app/settings/channels/gorgias_chat/67/campaigns'
            expect(utils.isCurrentlyOnChatCampaignDetailsPage()).toBe(false)
            window.location.pathname = '/app/rules'
            expect(utils.isCurrentlyOnChatCampaignDetailsPage()).toBe(false)
            window.location.pathname = '/app/automation/macros/2'
            expect(utils.isCurrentlyOnChatCampaignDetailsPage()).toBe(false)
            window.location.pathname = '/app/ticket/12'
            expect(utils.isCurrentlyOnChatCampaignDetailsPage()).toBe(false)
        })
    })

    describe('isGorgiasSupportAddress', () => {
        it('should find our base gorgias address', () => {
            const gorgiasSupportAddresses = [
                'support@acme.gorgias.io',
                'support@ACmE.gorgias.io',
                'support@acm5678e.gorgias.io',
                'support@ac-meee.gorgias.io',
                'support@ac-meee78.gorgias.io',
            ]

            gorgiasSupportAddresses.forEach((address) => {
                expect(utils.isGorgiasSupportAddress(address)).toEqual(true)
            })
        })

        it('should detect non-gorgias addresses', () => {
            const notGorgiasAddresses = [
                'support@acme.io',
                'support@acme.com',
                'SuppOrT@acme-gorgias.io',
            ]

            notGorgiasAddresses.forEach((address) => {
                expect(utils.isGorgiasSupportAddress(address)).toEqual(false)
            })
        })
    })

    describe('toQueryParams', () => {
        it('should convert object to query params', () => {
            const obj = {
                a: 12,
                c: 14,
            }
            expect(utils.toQueryParams(obj)).toEqual('a=12&c=14')
        })
    })

    describe('hasRole', () => {
        it('should determine if user has required role (observer agent)', () => {
            const user = fromJS({role: {name: OBSERVER_AGENT_ROLE}})
            expect(utils.hasRole(user, OBSERVER_AGENT_ROLE)).toEqual(true)
            expect(utils.hasRole(user, LITE_AGENT_ROLE)).toEqual(false)
            expect(utils.hasRole(user, BASIC_AGENT_ROLE)).toEqual(false)
            expect(utils.hasRole(user, AGENT_ROLE)).toEqual(false)
            expect(utils.hasRole(user, ADMIN_ROLE)).toEqual(false)
        })
        it('should determine if user has required role (agent)', () => {
            const user = fromJS({role: {name: AGENT_ROLE}})
            expect(utils.hasRole(user, OBSERVER_AGENT_ROLE)).toEqual(true)
            expect(utils.hasRole(user, LITE_AGENT_ROLE)).toEqual(true)
            expect(utils.hasRole(user, BASIC_AGENT_ROLE)).toEqual(true)
            expect(utils.hasRole(user, AGENT_ROLE)).toEqual(true)
            expect(utils.hasRole(user, ADMIN_ROLE)).toEqual(false)
        })

        it('should determine if user has required role (admin)', () => {
            const user = fromJS({role: {name: ADMIN_ROLE}})
            expect(utils.hasRole(user, OBSERVER_AGENT_ROLE)).toEqual(true)
            expect(utils.hasRole(user, LITE_AGENT_ROLE)).toEqual(true)
            expect(utils.hasRole(user, BASIC_AGENT_ROLE)).toEqual(true)
            expect(utils.hasRole(user, AGENT_ROLE)).toEqual(true)
            expect(utils.hasRole(user, ADMIN_ROLE)).toEqual(true)
        })
    })

    describe('subdomain', () => {
        const inputs = [
            {
                value: '',
                expect: '',
            },
            {
                value: 'acme',
                expect: 'acme',
            },
            {
                value: 'acme.shopify.com',
                expect: 'acme',
            },
            {
                value: 'http://acme',
                expect: 'acme',
            },
            {
                value: 'http://acme.shopify.com',
                expect: 'acme',
            },
        ]

        it('transform OK', () => {
            inputs.forEach((input) => {
                expect(utils.subdomain(input.value)).toBe(input.expect)
            })
        })
    })

    describe('resolvePropertyName', () => {
        it('should resolve property name', () => {
            expect(utils.resolvePropertyName('Attachment')).toEqual(
                'Attachment'
            )
            expect(utils.resolvePropertyName('Widget')).toEqual('Widget')
            expect(utils.resolvePropertyName('View')).toEqual('View')
            expect(utils.resolvePropertyName('UserSetting')).toEqual(
                'UserSetting'
            )
            expect(utils.resolvePropertyName('UserConnection')).toEqual(
                'UserConnection'
            )
            expect(utils.resolvePropertyName('ViewCount')).toEqual('ViewCount')
            expect(utils.resolvePropertyName('User')).toEqual('User')
            expect(utils.resolvePropertyName('Ticket')).toEqual('Ticket')
            expect(utils.resolvePropertyName('Macro')).toEqual('Macro')
            expect(utils.resolvePropertyName('Account')).toEqual('Account')
            expect(utils.resolvePropertyName('UserAuth')).toEqual('UserAuth')
            expect(utils.resolvePropertyName('IntegrationSmooch')).toEqual(
                'IntegrationSmooch'
            )
            expect(utils.resolvePropertyName('Integration')).toEqual(
                'Integration'
            )
            expect(utils.resolvePropertyName('Role')).toEqual('Role')
            expect(utils.resolvePropertyName('Action')).toEqual('Action')
            expect(utils.resolvePropertyName('UserChannel')).toEqual(
                'UserChannel'
            )
            expect(utils.resolvePropertyName('SourceAddress')).toEqual(
                'SourceAddress'
            )
            expect(utils.resolvePropertyName('Event')).toEqual('Event')
            expect(utils.resolvePropertyName('Tag')).toEqual('Tag')
            expect(utils.resolvePropertyName('Source')).toEqual('Source')
            expect(utils.resolvePropertyName('SatisfactionSurvey')).toEqual(
                'SatisfactionSurvey'
            )
            expect(utils.resolvePropertyName('IntegrationHTTP')).toEqual(
                'IntegrationHTTP'
            )
            expect(utils.resolvePropertyName('Rule')).toEqual('Rule')

            expect(utils.resolvePropertyName('Message')).toEqual(
                'TicketMessage'
            )
        })
    })

    describe('findProperty', () => {
        const schemas = fromJS(schemasJSON) as Map<any, any>

        it('should find property (always use ref)', () => {
            expect(
                utils.findProperty('ticket.tags.name', schemas, true)
            ).toEqual(
                (
                    schemas.getIn([
                        'definitions',
                        'DEPRECATED_Tag',
                        'properties',
                        'name',
                    ]) as Map<any, any>
                ).toJS()
            )
        })

        it('should find property (not always use ref)', () => {
            expect(utils.findProperty('ticket.customer.id', schemas)).toEqual(
                (
                    schemas.getIn([
                        'definitions',
                        'Ticket',
                        'properties',
                        'customer',
                    ]) as Map<any, any>
                ).toJS()
            )
            expect(
                utils.findProperty('message.source.from.address', schemas)
            ).toEqual(
                (
                    schemas.getIn([
                        'definitions',
                        'SourceAddress',
                        'properties',
                        'address',
                    ]) as Map<any, any>
                ).toJS()
            )
            expect(utils.findProperty('ticket.tags.name', schemas)).toEqual(
                (
                    schemas.getIn([
                        'definitions',
                        'Ticket',
                        'properties',
                        'tags',
                    ]) as Map<any, any>
                ).toJS()
            )
        })
    })

    describe('getDefaultOperator', () => {
        const schemas = fromJS(schemasJSON)

        it('should return first operator when there is no default', () => {
            expect(['isEmpty', 'isNotEmpty']).toContain(
                utils.getDefaultOperator('ticket.snooze_datetime', schemas)
            )
            expect(['eq', 'neq']).toContain(
                utils.getDefaultOperator('ticket.language', schemas)
            )
            expect(['eq', 'neq']).toContain(
                utils.getDefaultOperator('ticket.channel', schemas)
            )
        })

        it('should return default operator', () => {
            expect(
                utils.getDefaultOperator('ticket.created_datetime', schemas)
            ).toBe('gteTimedelta')
            expect(utils.getDefaultOperator('ticket.tags', schemas)).toBe(
                'containsAll'
            )
        })
    })

    describe('replaceAttachmentURL', () => {
        beforeAll(() => {
            window.GORGIAS_STATE.currentAccount = {
                domain: 'acme',
            } as Account
        })

        it('should replace attachment url for production environment', () => {
            ;(isProduction as jest.Mock).mockReturnValueOnce(true)

            expect(
                utils.replaceAttachmentURL(
                    'https://uploads.gorgias.io/foo/bar.pdf'
                )
            ).toBe(
                'https://acme.gorgias.com/api/attachment/download/foo/bar.pdf'
            )
        })

        it('should replace attachment url for staging environment', () => {
            ;(isStaging as jest.Mock).mockReturnValueOnce(true)

            expect(
                utils.replaceAttachmentURL(
                    'https://uploads.gorgias.xyz/foo/bar.pdf'
                )
            ).toBe(
                'https://acme.gorgias.xyz/api/attachment/download/foo/bar.pdf'
            )
        })

        // TODO: add back in after 'gorgis.us' bucket is fixed to not use the 'development' path
        // it('should replace attachment url for development environment', () => {
        //     ;(isDevelopment as jest.Mock).mockReturnValueOnce(true)
        //
        //     expect(
        //         utils.replaceAttachmentURL(
        //             'https://uploads.gorgi.us/foo/bar.pdf'
        //         )
        //     ).toBe(
        //         'https://acme.gorgias.docker/api/attachment/download/foo/bar.pdf'
        //     )
        // })
    })

    describe('proxifyImages', () => {
        beforeEach(() => {
            window.IMAGE_PROXY_URL = 'http://proxy-url/'
            window.IMAGE_PROXY_SIGN_KEY = 'test-key'
        })

        it('should not touch html with not img', () => {
            expect(utils.proxifyImages('<span>123</span>')).toMatchSnapshot()
        })

        it('should work with no format', () => {
            expect(
                utils.proxifyImages('<img src="http://gorgias.io/hello" />')
            ).toMatchSnapshot()
        })

        it('should work with format', () => {
            expect(
                utils.proxifyImages(
                    '<img src="http://gorgias.io/hello" />',
                    '100x100'
                )
            ).toMatchSnapshot()
        })

        it('should raise if IMAGE_PROXY_URL is not defined', () => {
            window.IMAGE_PROXY_URL = ''
            expect(() => utils.proxifyImages('<img src="hello" />')).toThrow()
        })

        it('should work with no src', () => {
            expect(
                utils.proxifyImages('<img alt="no-src" />')
            ).toMatchSnapshot()
        })

        it('should work with direct image', () => {
            expect(
                utils.proxifyImages('<img src="http://gorgias.io/image.jpg" />')
            ).toMatchSnapshot()
        })

        it('should work with pathname', () => {
            expect(
                utils.proxifyImages(
                    '<img src="http://gorgias.io/test/x.jpg" />'
                )
            ).toMatchSnapshot()
        })

        it('should work with search query but not uri-encode it', () => {
            expect(
                utils.proxifyImages(
                    '<img src="http://gorgias.io/test/x.jpg?x=123&y=456#123" />'
                )
            ).toMatchSnapshot()
        })

        it('should work with self closing', () => {
            expect(utils.proxifyImages('<br />')).toMatchSnapshot()
        })

        it('should work with richer complex html', () => {
            expect(
                utils.proxifyImages(`<div class="something">
<i>italic</i><b>bold</b><u>under</u>
<span>xxxxxsp <span>inside <span>inside a span</span></span> </span>
<uknown-tag>11233</uknown-tag>
<img alt="no-src">
<img src="http://some-image" alt="bla ">
<strong><img src="https://image2"></strong>
</div>
`)
            ).toMatchSnapshot()
        })

        it('should not proxify a proxified image', () => {
            expect(
                utils.proxifyImages(
                    `<img src="${window.IMAGE_PROXY_URL}http://gorgias.io/hello" />`
                )
            ).toMatchSnapshot()
        })
    })

    describe('validateWebhookURL', () => {
        it('should not allow http protocol', () => {
            const url = 'http://foobar.com'
            expect(utils.validateWebhookURL(url)).not.toBe(null)
        })

        it('should not allow port specifications', () => {
            const url = 'https://foobar.com:8080'
            expect(utils.validateWebhookURL(url)).not.toBe(null)
        })

        it.each([443, 80, 81, 89, 8080, 8081, 8089])(
            'should allow web port',
            (port) => {
                const url = `https://foobar.com:${port}`
                expect(utils.validateWebhookURL(url, true)).toBe(null)
            }
        )

        it.each([22, 123, 442, 79, 90, 801, 180, 8099, 18080, 1e6])(
            'should not allow port (even though web ports are allowed)',
            (port) => {
                const url = `https://foobar.com:${port}`
                expect(utils.validateWebhookURL(url, true)).toBe(
                    'Port not allowed'
                )
            }
        )

        it('should require a TLD', () => {
            const url = 'https://rmq0'
            expect(utils.validateWebhookURL(url)).not.toBe(null)
        })

        it('should require a TLD except if the url is made with an IPv6 address', () => {
            const url = 'https://[fe00:4860:4860::8888]'
            expect(utils.validateWebhookURL(url)).toBe(null)
        })

        it('should not allow .local TLD', () => {
            const url = 'https://foobar.local/'
            expect(utils.validateWebhookURL(url)).not.toBe(null)
        })

        it('should not allow .internal TLD', () => {
            const url = 'https://foobar.internal/'
            expect(utils.validateWebhookURL(url)).not.toBe(null)
        })

        it('should not allow private address', () => {
            let url = 'https://[fd00:4860:4860::8888]'
            expect(utils.validateWebhookURL(url)).not.toBe(null)
            url = 'https://10.3.2.1'
            expect(utils.validateWebhookURL(url)).not.toBe(null)
            url = 'https://127.0.0.1'
            expect(utils.validateWebhookURL(url)).not.toBe(null)
            url = 'https://172.21.1.0'
            expect(utils.validateWebhookURL(url)).not.toBe(null)
            url = 'https://192.168.2.1'
            expect(utils.validateWebhookURL(url)).not.toBe(null)
        })
    })

    describe('getLanguageDisplayName', () => {
        it('should return the display name correctly from the locale name', () => {
            ;[
                ['en', 'English'],
                ['en-US', 'English (United States)'],
                ['ca', 'Catalan'],
                ['de', 'German'],
            ].forEach(([lang, displayName]) => {
                expect(utils.getLanguageDisplayName(lang)).toEqual(displayName)
            })
        })
    })

    describe('errorToChildren', () => {
        it('should return null with no data', () => {
            expect(utils.errorToChildren({})).toEqual(null)
        })

        it('should return parsed markup', () => {
            const error = {
                response: {
                    data: {
                        error: {
                            data: {
                                hello: ['world'],
                                receiver: ['Missing data', 'Invalid value'],
                            },
                        },
                    },
                },
            }

            expect(utils.errorToChildren(error)).toMatch(
                '<li>Hello: world</li><li>Receiver: Missing data</li><li>Receiver: Invalid value</li>'
            )
        })

        it('should work with (deeply) nested error payloads', () => {
            const error = {
                response: {
                    data: {
                        error: {
                            data: {
                                hello: ['world'],
                                some: {
                                    nested_field: [
                                        'Invalid value',
                                        'Try again',
                                    ],
                                    and_more: {
                                        nested_data: ['Not good.'],
                                    },
                                },
                            },
                        },
                    },
                },
            }

            expect(utils.errorToChildren(error)).toMatch(
                '<li>Hello: world</li><li>Nested Field: Invalid value</li><li>Nested Field: Try again</li><li>Nested Data: Not good.</li>'
            )
        })

        it('should return sanitized markup', () => {
            const error = {
                response: {
                    data: {
                        error: {
                            data: {
                                item: [
                                    'malicious <img onerror=alert(496) src>',
                                ],
                            },
                        },
                    },
                },
            }

            expect(utils.errorToChildren(error)).toMatch(
                '<li>Item: malicious <img src /></li>'
            )
        })
    })

    describe('compactInteger', () => {
        it('should round to k', () => {
            expect(utils.compactInteger(1100)).toEqual('1k')
        })

        it('should round to k with 1 digit', () => {
            expect(utils.compactInteger(1100, 1)).toEqual('1.1k')
        })

        it('should round to k with 2 digits', () => {
            expect(utils.compactInteger(1150, 2)).toEqual('1.15k')
        })

        it('should round to T', () => {
            expect(utils.compactInteger(1100000000000)).toEqual('1T')
        })

        it('should round to T with 1 digit', () => {
            expect(utils.compactInteger(1100000000000, 1)).toEqual('1.1T')
        })

        it('should round to T with 2 digits', () => {
            expect(utils.compactInteger(1150000000000, 2)).toEqual('1.15T')
        })
    })

    describe('lightenDarkenColor()', () => {
        it.each([
            ['work without #', 'dedede', 20],
            ['work with #', '#dedede', 20],
            ['not lighten white', 'ffffff', 20],
            ['not darken black', '000000', -20],
            ['darken non black color', 'dedede', -20],
            ['lighten non white color', 'dedede', 20],
        ])('should %s', (_, color, amt) => {
            expect(utils.lightenDarkenColor(color, amt)).toMatchSnapshot()
        })

        it.each([
            ['00ff00', -20],
            ['0000ff', -20],
        ])('should work with leading zeros', (color, amt) => {
            expect(utils.lightenDarkenColor(color, amt)).toMatchSnapshot()
        })
    })

    describe('makeGetPlainJS()', () => {
        const state = {
            object: fromJS({
                users: [
                    {id: 1, name: 'Homer'},
                    {id: 2, name: 'Marge'},
                ],
            }) as Map<any, any>,
            list: fromJS([
                {id: 3, name: 'Lisa'},
                {id: 4, name: 'Bart'},
            ]) as List<any>,
        }
        const selectorFromMap = (s: typeof state) => s.object || fromJS({})
        const selectorFromList = (s: typeof state) => s.list || fromJS({})

        it('should return plain js object from an Immutable Map collection', () => {
            const getDataToJS = utils.makeGetPlainJS(selectorFromMap)
            const data = getDataToJS(state)
            expect(data).toMatchSnapshot()
        })

        it('should return plain js object from an Immutable List collection', () => {
            const getDataToJS = utils.makeGetPlainJS(selectorFromList)
            const data = getDataToJS(state)
            expect(data).toMatchSnapshot()
        })
    })

    describe('assetsUrl()', () => {
        beforeEach(() => {
            envVarsMock.GORGIAS_ASSETS_URL = 'https://gorgias-assets/web-app'
        })

        it('should build asset URLs from a given path', () => {
            expect(utils.assetsUrl('/some-image.jpg')).toBe(
                'https://gorgias-assets/web-app/assets/some-image.jpg'
            )
        })

        it('returns a relative path if GORGIAS_ASSETS_URL env var is undefined', () => {
            envVarsMock.GORGIAS_ASSETS_URL = undefined

            expect(utils.assetsUrl('/some-image.jpg')).toBe(
                '/assets/some-image.jpg'
            )
        })

        it('returns a relative path if GORGIAS_ASSETS_URL env var is not a valid URL', () => {
            envVarsMock.GORGIAS_ASSETS_URL = '//'

            expect(utils.assetsUrl('/some-image.jpg')).toBe(
                '/assets/some-image.jpg'
            )
        })

        it('properly joins paths when all parts contain leading and trailing slashes', () => {
            expect(utils.assetsUrl('/some-image.jpg')).toBe(
                'https://gorgias-assets/web-app/assets/some-image.jpg'
            )
        })

        it('properly joins paths when the parts have no leading or trailing slashes', () => {
            expect(utils.assetsUrl('some-image.jpg')).toBe(
                'https://gorgias-assets/web-app/assets/some-image.jpg'
            )
        })
    })

    describe('castGorgiasVideosForUnsupportedSources()', () => {
        it('should properly cast videos to hyperlinks and text', () => {
            const randomBaseUrls = [
                'http://example.com/',
                'https://youtube.com/watch?v=',
                'https://gorgias.com',
            ]
            const randomUrls = Array.from(
                {length: 10},
                () =>
                    `${
                        randomBaseUrls[
                            Math.floor(Math.random() * randomBaseUrls.length)
                        ]
                    }${randomstring.generate()}`
            )

            const dataset: {
                rawHtml: string
                expectedHtmlHyperLinks: string
                expectedHtmlNoHyperLinks: string
            }[] = [
                // [video]
                {
                    rawHtml: `<figure><div class="gorgias-video-container" data-video-src="${randomUrls[0]}"></div></figure>`,
                    expectedHtmlHyperLinks: `<div><a href="${randomUrls[0]}">${randomUrls[0]}</a></div>`,
                    expectedHtmlNoHyperLinks: `<div>${randomUrls[0]}</div>`,
                },
                // [video] [video]
                {
                    rawHtml: `<figure><div class="gorgias-video-container" data-video-src="${randomUrls[0]}"></div></figure><div><br></div><figure><div class="gorgias-video-container" data-video-src="${randomUrls[1]}"></div></figure>`,
                    expectedHtmlHyperLinks: `<div><a href="${randomUrls[0]}">${randomUrls[0]}</a></div><div><br></div><div><a href="${randomUrls[1]}">${randomUrls[1]}</a></div>`,
                    expectedHtmlNoHyperLinks: `<div>${randomUrls[0]}</div><div><br></div><div>${randomUrls[1]}</div>`,
                },
                // [video] [video] using the real `style="display:inline-block;margin:0"` generated by drafjs.
                {
                    rawHtml: `<figure style="display:inline-block;margin:0"><div class="gorgias-video-container" data-video-src="${randomUrls[0]}"></div></figure><div><br></div><figure style="display:inline-block;margin:0"><div class="gorgias-video-container" data-video-src="${randomUrls[1]}"></div></figure>`,
                    expectedHtmlHyperLinks: `<div><a href="${randomUrls[0]}">${randomUrls[0]}</a></div><div><br></div><div><a href="${randomUrls[1]}">${randomUrls[1]}</a></div>`,
                    expectedHtmlNoHyperLinks: `<div>${randomUrls[0]}</div><div><br></div><div>${randomUrls[1]}</div>`,
                },
                // [text] [video] [image] [text] [video] [link] [text] [space] [image]
                {
                    rawHtml: `<div>text1</div><figure style="display:inline-block;margin:0"><div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div></figure><div><a href="https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm" target="_blank">https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm</a></div><div>text2</div><figure style="display:inline-block;margin:0"><div class="gorgias-video-container" data-video-src="https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm" width="600"></div></figure><div>test3beforespaces</div><div><br></div><div><br></div><div>tests4afterspaces</div><div><br></div><figure style="display:inline-block;margin:0"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmcdHNojpj5mzs9E-WWvoyLJ6Bqul4t8zlxVS5Kwa3X0Vgy6jLr8VUaxVMIWE1ain5ttk&usqp=CAU" width="400" style="max-width: 100%"></figure><div><br></div>`,
                    expectedHtmlHyperLinks:
                        '<div>text1</div><div><a href="https://www.youtube.com/watch?v=4sLFpe-xbhk">https://www.youtube.com/watch?v=4sLFpe-xbhk</a></div><div><a href="https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm" target="_blank">https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm</a></div><div>text2</div><div><a href="https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm">https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm</a></div><div>test3beforespaces</div><div><br></div><div><br></div><div>tests4afterspaces</div><div><br></div><figure style="display:inline-block;margin:0"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmcdHNojpj5mzs9E-WWvoyLJ6Bqul4t8zlxVS5Kwa3X0Vgy6jLr8VUaxVMIWE1ain5ttk&usqp=CAU" width="400" style="max-width: 100%"></figure><div><br></div>',
                    expectedHtmlNoHyperLinks:
                        '<div>text1</div><div>https://www.youtube.com/watch?v=4sLFpe-xbhk</div><div><a href="https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm" target="_blank">https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm</a></div><div>text2</div><div>https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm</div><div>test3beforespaces</div><div><br></div><div><br></div><div>tests4afterspaces</div><div><br></div><figure style="display:inline-block;margin:0"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmcdHNojpj5mzs9E-WWvoyLJ6Bqul4t8zlxVS5Kwa3X0Vgy6jLr8VUaxVMIWE1ain5ttk&usqp=CAU" width="400" style="max-width: 100%"></figure><div><br></div>',
                },
                // [text] [link] [image] [video]
                {
                    rawHtml: `<div>toto</div><div><a href="https://fdfd.com" class="linkified" target="_blank">https://fdfd.com</a></div><div><br></div><figure style="display:inline-block;margin:0"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmcdHNojpj5mzs9E-WWvoyLJ6Bqul4t8zlxVS5Kwa3X0Vgy6jLr8VUaxVMIWE1ain5ttk&usqp=CAU" width="400" style="max-width: 100%"></figure><div>ff</div><div><br></div><figure style="display:inline-block;margin:0"><div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div></figure><div><br></div>`,
                    expectedHtmlHyperLinks: `<div>toto</div><div><a href="https://fdfd.com" class="linkified" target="_blank">https://fdfd.com</a></div><div><br></div><figure style="display:inline-block;margin:0"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmcdHNojpj5mzs9E-WWvoyLJ6Bqul4t8zlxVS5Kwa3X0Vgy6jLr8VUaxVMIWE1ain5ttk&usqp=CAU" width="400" style="max-width: 100%"></figure><div>ff</div><div><br></div><div><a href="https://www.youtube.com/watch?v=4sLFpe-xbhk">https://www.youtube.com/watch?v=4sLFpe-xbhk</a></div><div><br></div>`,
                    expectedHtmlNoHyperLinks: `<div>toto</div><div><a href="https://fdfd.com" class="linkified" target="_blank">https://fdfd.com</a></div><div><br></div><figure style="display:inline-block;margin:0"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmcdHNojpj5mzs9E-WWvoyLJ6Bqul4t8zlxVS5Kwa3X0Vgy6jLr8VUaxVMIWE1ain5ttk&usqp=CAU" width="400" style="max-width: 100%"></figure><div>ff</div><div><br></div><div>https://www.youtube.com/watch?v=4sLFpe-xbhk</div><div><br></div>`,
                },
            ]

            for (const data of dataset) {
                expect(
                    utils.castGorgiasVideosForUnsupportedSources({
                        html: data.rawHtml,
                        hyperlinksSupported: true,
                    })
                ).toEqual(data.expectedHtmlHyperLinks)

                expect(
                    utils.castGorgiasVideosForUnsupportedSources({
                        html: data.rawHtml,
                        hyperlinksSupported: false,
                    })
                ).toEqual(data.expectedHtmlNoHyperLinks)
            }
        })
    })

    describe('extractGorgiasVideoDivFromHtmlContent()', () => {
        it('should properly extract', () => {
            const dataset: {
                rawHtml: string
                expectedHtmlFinal: string
                expectedVideoUrls: string[]
            }[] = [
                {
                    rawHtml: `<p>hello</p><a href="#">here</a>`,
                    expectedHtmlFinal: `<p>hello</p><a href="#">here</a>`,
                    expectedVideoUrls: [],
                },
                {
                    rawHtml: `<p>hello<div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div></p><a href="#">here</a>`,
                    expectedHtmlFinal: `<p>hello</p><a href="#">here</a>`,
                    expectedVideoUrls: [
                        'https://www.youtube.com/watch?v=4sLFpe-xbhk',
                    ],
                },
                {
                    rawHtml: `<p>hello<div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div></p><a href="#">here</a><div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk2" width="600"></div>`,
                    expectedHtmlFinal: `<p>hello</p><a href="#">here</a>`,
                    expectedVideoUrls: [
                        'https://www.youtube.com/watch?v=4sLFpe-xbhk',
                        'https://www.youtube.com/watch?v=4sLFpe-xbhk2',
                    ],
                },
                // Extra space produced by draftjs because ending by a video should be removed.
                {
                    rawHtml: `<p>hello</p><div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div><div><br /></div>`,
                    expectedHtmlFinal: `<p>hello</p>`,
                    expectedVideoUrls: [
                        'https://www.youtube.com/watch?v=4sLFpe-xbhk',
                    ],
                },
                // Extra space made on purpose by the agent (not ending by a video) should NOT be removed.
                {
                    rawHtml: `<div>A</div><div><br /></div>`,
                    expectedHtmlFinal: `<div>A</div><div><br /></div>`,
                    expectedVideoUrls: [],
                },
            ]

            for (const data of dataset) {
                expect(
                    utils.extractGorgiasVideoDivFromHtmlContent(data.rawHtml)
                ).toEqual({
                    htmlCleaned: data.expectedHtmlFinal,
                    videoUrls: data.expectedVideoUrls,
                })
            }
        })
    })

    describe('extractUrlsFromString()', () => {
        it('should extract all urls', () => {
            const youtubeUrl = 'https://www.youtube.com/watch?v=4sLFpe-xbhk'
            const vimeoUrl = 'https://vimeo.com/1231231231'

            const string = `first video ${youtubeUrl}\nsecond video ${vimeoUrl}`

            expect(utils.extractUrlsFromString(string)).toEqual([
                youtubeUrl,
                vimeoUrl,
            ])
        })
    })

    describe('fixVideoUrlForReactPlayer()', () => {
        it('should properly extract', () => {
            const dataset: {
                rawUrl: string
                expectedUrl: string
            }[] = [
                {
                    rawUrl: `https://www.dailymotion.com/video/x2m3vyr?playlist=x7juyaf`,
                    expectedUrl: `https://www.dailymotion.com/video/x2m3vyr`,
                },
                {
                    rawUrl: `https://www.dailymotion.com/video/x2m3vyr?playlist=x7juyaf&anotherunknowstuff=rr`,
                    expectedUrl: `https://www.dailymotion.com/video/x2m3vyr?playlist=x7juyaf&anotherunknowstuff=rr`,
                },
                {
                    rawUrl: `https://www.google.com/`,
                    expectedUrl: `https://www.google.com/`,
                },
                {
                    rawUrl: `https://www.dailymotion.com/video/x2m3vyr`,
                    expectedUrl: `https://www.dailymotion.com/video/x2m3vyr`,
                },
                {
                    rawUrl: `https://www.youtube.com/watch?v=4sLFpe-xbhk`,
                    expectedUrl: `https://www.youtube.com/watch?v=4sLFpe-xbhk`,
                },
            ]

            for (const data of dataset) {
                expect(utils.fixVideoUrlForReactPlayer(data.rawUrl)).toEqual(
                    data.expectedUrl
                )
            }
        })
    })

    describe('isDomain()', () => {
        it('should validate domain correctly', () => {
            const dataset: {
                input: string
                output: boolean
            }[] = [
                {
                    input: `www.dailymotion.com`,
                    output: true,
                },
                {
                    input: `dailymotion.com`,
                    output: true,
                },
                {
                    input: `dailymotion.co.uk`,
                    output: true,
                },
                {
                    input: `sub.dailymotion.co.uk`,
                    output: true,
                },
                {
                    input: `https://www.dailymotion.com`,
                    output: false,
                },
                {
                    input: `1`,
                    output: false,
                },
            ]

            for (const data of dataset) {
                expect(utils.isDomain(data.input)).toEqual(data.output)
            }
        })
    })

    describe('isTouchEvent()', () => {
        it('should return true', () => {
            const event = new TouchEvent('touchstart')

            expect(utils.isTouchEvent(event)).toEqual(true)
        })

        it('should return false', () => {
            const event = new MouseEvent('mousemove')

            expect(utils.isTouchEvent(event)).toEqual(false)
        })
    })

    describe('getCode', () => {
        it('should return the generated code for a valid AST', () => {
            const script =
                "containsAll(ticket.tags.name, [\n    '😍 heart',\n    'refund'\n]) && eq(ticket.assignee_team.id, 1) && eq(ticket.channel, 'chat') && gteTimedelta(ticket.created_datetime, '1d') && gteTimedelta(ticket.closed_datetime, '1d') && eq(ticket.messages.integration_id, 5) && isEmpty(ticket.snooze_datetime) && eq(ticket.status, 'open')"
            const ast = esprima.parseScript(script)
            const code = getCode(ast)
            expect(code).toBe(script)
        })
    })
})
