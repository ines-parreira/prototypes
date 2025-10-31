// sort-imports-ignore
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { fromJS, List } from 'immutable'
import { size } from 'lodash'

import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import { applications as mockApplications } from 'fixtures/applications'
import { channels as mockChannels } from 'fixtures/channels'
import { integrationsState } from 'fixtures/integrations'
import { applicationsQueryKeys as mockApplicationsQueryKeys } from 'models/application/queries'
import { channelsQueryKeys as mockChannelsQueryKeys } from 'models/channel/queries'
import {
    EmailIntegration,
    Integration,
    IntegrationType,
    isPhoneIntegration,
    PhoneIntegration,
    ShopifyIntegration,
} from 'models/integration/types'
import { getChannelBySlug } from 'services/channels'
import { RootState } from 'state/types'

import {
    DEPRECATED_getIntegrations,
    DEPRECATED_getIntegrationsState,
    DEPRECATED_getPhoneIntegrations,
    getActiveEmailChannels,
    getActiveIntegrations,
    getBaseEmailIntegration,
    getChannelByTypeAndAddress,
    getChannelsForSourceType,
    getChannelSignature,
    getCurrentIntegration,
    getEmailChannels,
    getEmailIntegrations,
    getFacebookRedirectUri,
    getForwardingEmailAddress,
    getInactiveEmailChannels,
    getIntegrationByAddress,
    getIntegrationByIdAndType,
    getIntegrationChannel,
    getIntegrations,
    getIntegrationsByAppId,
    getIntegrationsState,
    getIsChatIntegrationStatusError,
    getIsChatIntegrationStatusLoading,
    getMagento2IntegrationByStoreUrl,
    getMessagingAndAppIntegrations,
    getOnboardingIntegrations,
    getOnboardingMeta,
    getSendersForChannel,
    getShopifyIntegrationByShopName,
    getShopifyIntegrationsWithoutFacebook,
    getShowShopifyCheckoutChatBanner,
    getStandardPhoneIntegrations,
} from '../selectors'

jest.mock('api/queryClient', () => ({
    appQueryClient: mockQueryClient({
        cachedData: [
            [mockChannelsQueryKeys.list(), mockChannels],
            [mockApplicationsQueryKeys.list(), mockApplications],
        ],
    }),
}))

const state = {
    integrations: fromJS(integrationsState),
    currentUser: fromJS({
        first_name: 'Steve',
    }),
} as RootState

describe('integrations selectors', () => {
    it('should get deprecated integrations state', () => {
        const integrationsState = DEPRECATED_getIntegrationsState(state)
        expect(integrationsState).toEqual(state.integrations)
    })

    it('should get integrations state', () => {
        const integrationsState = getIntegrationsState(state)
        expect(integrationsState).toEqual(state.integrations.toJS())
    })

    it('should get deprecated integrations', () => {
        const integrations = DEPRECATED_getIntegrations(state)
        const expected =
            DEPRECATED_getIntegrationsState(state).get('integrations')

        expect(integrations).toEqual(expected)
    })

    it('should get integrations', () => {
        const integrations = getIntegrations(state)
        const expected = getIntegrationsState(state).integrations

        expect(integrations).toEqual(expected)
    })

    describe('getMessagingAndAppIntegrations()', () => {
        it('should get messaging and app integrations', () => {
            const messagingIntegrations =
                getMessagingAndAppIntegrations(state).toJS()
            const allIntegrations: Integration[] =
                DEPRECATED_getIntegrations(state).toJS()
            const expected = allIntegrations.filter(
                (integration: Integration) =>
                    [
                        IntegrationType.Email,
                        IntegrationType.Outlook,
                        IntegrationType.Gmail,
                        IntegrationType.Aircall,
                        IntegrationType.Facebook,
                        IntegrationType.Phone,
                        IntegrationType.Twitter,
                        IntegrationType.GorgiasChat,
                    ].includes(integration.type) ||
                    integration.type === IntegrationType.App,
            )

            expect(messagingIntegrations).toEqual(expected)
        })
    })

    describe('getEmailIntegrations()', () => {
        it('should get email integrations', () => {
            const emailIntegrations: EmailIntegration[] =
                getEmailIntegrations(state).toJS()
            const allIntegrations: Integration[] =
                DEPRECATED_getIntegrations(state).toJS()
            const expected = allIntegrations.filter(
                (integration: Integration) =>
                    [IntegrationType.Email, IntegrationType.Gmail].includes(
                        integration.type,
                    ),
            )

            expect(emailIntegrations).toEqual(expected)
        })
    })

    describe('DEPRECATED_getPhoneIntegrations()', () => {
        it('should get phone integrations', () => {
            const phoneIntegrations: PhoneIntegration[] =
                DEPRECATED_getPhoneIntegrations(state).toJS()
            const allIntegrations: Integration[] =
                DEPRECATED_getIntegrations(state).toJS()
            const expected: PhoneIntegration[] =
                allIntegrations.filter(isPhoneIntegration)

            expect(phoneIntegrations).toEqual(expected)
        })
    })

    describe('getBaseEmailIntegration()', () => {
        it('should return the base email integration', () => {
            const baseEmailIntegration = fromJS({
                id: 1,
                type: IntegrationType.Email,
                meta: {
                    address: `asd48sa6d@${
                        window.GORGIAS_STATE?.integrations?.authentication
                            ?.email?.forwarding_email_address || ''
                    }`,
                },
            })

            const result = getBaseEmailIntegration({
                integrations: fromJS({
                    integrations: [baseEmailIntegration],
                }),
            } as RootState)

            expect(result).toEqual(baseEmailIntegration)
        })

        it('should return an empty map because there is no base email integration', () => {
            const baseEmailIntegration = fromJS({
                id: 1,
                type: IntegrationType.Email,
                meta: {
                    address: 'support@mycompany.com',
                },
            })

            const result = getBaseEmailIntegration({
                integrations: fromJS({
                    integrations: [baseEmailIntegration],
                }),
            } as RootState)

            expect(result).toEqual(fromJS({}))
        })
    })

    it('should get channels', () => {
        expect(getEmailChannels(state)).toMatchSnapshot()
    })

    it('should get inactive channels', () => {
        const emailChannels = getInactiveEmailChannels(state).toJS() as {
            isDeactivated: boolean
        }[]
        const inactiveEmailChannels = emailChannels.filter(
            (channel: { isDeactivated: boolean }) => channel.isDeactivated,
        )
        expect(inactiveEmailChannels).toHaveLength(1)
    })

    it('should get active channels', () => {
        const activeEmailChannels = getActiveEmailChannels(state).toJS() as {
            isDeactivated: boolean
        }[]
        const inactiveEmailChannels = activeEmailChannels.filter(
            (channel: { isDeactivated: boolean }) => channel.isDeactivated,
        )
        expect(inactiveEmailChannels).toHaveLength(0)
    })

    it('should get channel by type and address', () => {
        expect(
            getChannelByTypeAndAddress(IntegrationType.Email, '')(state),
        ).toEqual(fromJS({}))
        expect(
            getChannelByTypeAndAddress(
                IntegrationType.Email,
                'support@acme.gorgias.io',
            )(state),
        ).toMatchSnapshot()
    })

    it('should get channels signature', () => {
        expect(
            getChannelSignature(
                IntegrationType.Email,
                'support@acme.gorgias.io',
            )(state),
        ).toMatchSnapshot()
    })

    describe('getIntegrationChannel()', () => {
        it('should return the legacy channel for legacy integrations', () => {
            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: 'email',
                        },
                    ],
                }),
            } as RootState
            expect(getIntegrationChannel(1)(state)).toEqual(
                getChannelBySlug('email'),
            )
        })

        it('should return the new channels for app integrations', () => {
            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: 'app',
                            application_id: mockApplications[0].id,
                        },
                    ],
                }),
            } as RootState
            expect(getIntegrationChannel(1)(state)).toEqual(mockChannels[0])
        })
    })

    describe('getChannelsForSourceType()', () => {
        const state = {
            integrations: fromJS({
                integrations: [
                    {
                        id: 1,
                        type: 'email',
                        name: 'John Doe',
                        meta: { address: 'support@mycompany.com' },
                    },
                    {
                        id: 2,
                        type: 'phone',
                        name: 'John Doe',
                        phoneNumberName: 'John Doe',
                        meta: {
                            phone_number_id: 1,
                        },
                    },
                    {
                        id: 3,
                        type: 'sms',
                        name: 'John Doe',
                        phoneNumberName: 'John Doe',
                        meta: {
                            phone_number_id: 1,
                        },
                    },
                    {
                        id: 4,
                        type: 'whatsapp',
                        name: 'John Doe',
                        phoneNumberName: 'John Doe',
                        meta: {
                            routing: {
                                phone_number: '+123456789',
                            },
                        },
                    },
                    {
                        id: 5,
                        type: 'email',
                        deactivated_datetime:
                            '2023-07-18T17:20:05.655015+00:00',
                        name: 'Deactivated Integration',
                        meta: { address: 'deactivated@email.com' },
                    },
                ],
            }),
            entities: {
                newPhoneNumbers: {
                    1: {
                        phone_number: '+1234567890',
                        phoneNumberName: 'John Doe',
                    },
                },
            },
        } as unknown as RootState

        it('should get active email integrations as channels when source type is email', () => {
            expect(
                getChannelsForSourceType(TicketMessageSourceType.Email)(state),
            ).toEqual(
                fromJS([
                    {
                        preferred: undefined,
                        isDeactivated: false,
                        verified: false,
                        name: state.integrations.getIn([
                            'integrations',
                            '0',
                            'name',
                        ]),
                        address: state.integrations.getIn([
                            'integrations',
                            '0',
                            'meta',
                            'address',
                        ]),
                        isDefault: false,
                        signature: undefined,
                        reconnectUrl: undefined,
                        type: state.integrations.getIn([
                            'integrations',
                            '0',
                            'type',
                        ]),
                        id: 1,
                    },
                    {
                        preferred: undefined,
                        isDeactivated: true,
                        verified: false,
                        name: state.integrations.getIn([
                            'integrations',
                            '4',
                            'name',
                        ]),
                        address: state.integrations.getIn([
                            'integrations',
                            '4',
                            'meta',
                            'address',
                        ]),
                        isDefault: false,
                        signature: undefined,
                        reconnectUrl: undefined,
                        type: state.integrations.getIn([
                            'integrations',
                            '4',
                            'type',
                        ]),
                        id: 5,
                    },
                ]),
            )
        })

        it('should get phone integrations as channels when source type is phone', () => {
            expect(
                getChannelsForSourceType(TicketMessageSourceType.Phone)(state),
            ).toEqual(
                fromJS([
                    {
                        id: state.integrations.getIn([
                            'integrations',
                            '1',
                            'id',
                        ]),
                        type: state.integrations.getIn([
                            'integrations',
                            '1',
                            'type',
                        ]),
                        name: state.integrations.getIn([
                            'integrations',
                            '1',
                            'name',
                        ]),
                        phoneNumberName: state.entities.newPhoneNumbers[1].name,
                        address: state.entities.newPhoneNumbers[1].phone_number,
                        isDeactivated: false,
                        channel: 'phone',
                    },
                ]),
            )
        })

        it('should get SMS integrations as channels when source type is sms', () => {
            expect(
                getChannelsForSourceType(TicketMessageSourceType.Sms)(state),
            ).toEqual(
                fromJS([
                    {
                        id: state.integrations.getIn([
                            'integrations',
                            '2',
                            'id',
                        ]),
                        type: state.integrations.getIn([
                            'integrations',
                            '2',
                            'type',
                        ]),
                        name: state.integrations.getIn([
                            'integrations',
                            '2',
                            'name',
                        ]),
                        phoneNumberName: state.entities.newPhoneNumbers[1].name,
                        address: state.entities.newPhoneNumbers[1].phone_number,
                        isDeactivated: false,
                        channel: 'sms',
                    },
                ]),
            )
        })

        it('should get WhatsApp integrations as channels when source type is whatsapp-message', () => {
            expect(
                getChannelsForSourceType(
                    TicketMessageSourceType.WhatsAppMessage,
                )(state),
            ).toEqual(
                fromJS([
                    {
                        id: state.integrations.getIn([
                            'integrations',
                            '3',
                            'id',
                        ]),
                        type: state.integrations.getIn([
                            'integrations',
                            '3',
                            'type',
                        ]),
                        name: state.integrations.getIn([
                            'integrations',
                            '3',
                            'name',
                        ]),
                        address: state.integrations.getIn([
                            'integrations',
                            '3',
                            'meta',
                            'routing',
                            'phone_number',
                        ]),
                        isDeactivated: false,
                        channel: 'whatsapp-message',
                    },
                ]),
            )
        })
    })

    describe('getShopifyIntegrationsWithoutFacebook()', () => {
        it('should return one integration', () => {
            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: 'shopify',
                        },
                        {
                            id: 2,
                            type: 'shopify',
                        },
                        {
                            id: 3,
                            type: 'facebook',
                            meta: {
                                shopify_integration_ids: [1],
                            },
                        },
                    ],
                }),
            } as RootState

            const shopiFyIntegrations: ShopifyIntegration[] =
                getShopifyIntegrationsWithoutFacebook(state).toJS()
            expect(size(shopiFyIntegrations)).toEqual(1)

            const integration = shopiFyIntegrations[0]
            expect(integration.id).toEqual(2)
        })

        it('should return no integration', () => {
            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: 'shopify',
                        },
                        {
                            id: 2,
                            type: 'shopify',
                        },
                        {
                            id: 3,
                            type: 'facebook',
                            meta: {
                                shopify_integration_ids: [1, 2],
                            },
                        },
                    ],
                }),
            } as RootState

            const res = getShopifyIntegrationsWithoutFacebook(state)
            expect(res.size).toEqual(0)
        })
    })

    describe('getShopifyIntegrationByShopName()', () => {
        it('should return the matching integration', () => {
            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: 'shopify',
                            meta: {
                                shop_name: 'foo',
                            },
                        },
                        {
                            id: 2,
                            type: 'shopify',
                            meta: {
                                shop_name: 'bar',
                            },
                        },
                        {
                            id: 3,
                            type: 'facebook',
                            meta: {
                                shop_name: 'bar',
                            },
                        },
                    ],
                }),
            } as RootState

            const res = getShopifyIntegrationByShopName('bar')(state)
            expect(res.get('id')).toEqual(2)
        })
    })

    describe('getCurrentIntegration()', () => {
        it('should return fromJS({}) because there is no current integration', () => {
            const state = {
                integrations: fromJS({
                    integrations: [{ id: 1 }, { id: 2 }],
                    integration: null,
                }),
            } as RootState

            expect(getCurrentIntegration(state).toJS()).toEqual({})
        })

        it('should return the current integration', () => {
            const currentIntegration = { id: 3 }
            const state = {
                integrations: fromJS({
                    integrations: [{ id: 1 }, { id: 2 }],
                    integration: currentIntegration,
                }),
            } as RootState

            expect(getCurrentIntegration(state).toJS()).toEqual(
                currentIntegration,
            )
        })
    })

    describe('getOnboardingIntegrations()', () => {
        ;[IntegrationType.Facebook].forEach((integrationType) => {
            it(`should return an empty list because there is no integrations in the state (${integrationType})`, () => {
                expect(
                    getOnboardingIntegrations(integrationType)({} as RootState),
                ).toEqual(fromJS([]))
            })

            it(`should return the list of onboarding pages from the state (${integrationType})`, () => {
                const page = { id: 1, name: 'foo' }
                const state = {
                    integrations: fromJS({
                        extra: {
                            [integrationType]: {
                                onboardingIntegrations: { data: [page] },
                            },
                        },
                    }),
                } as RootState

                expect(
                    getOnboardingIntegrations(integrationType)(state).toJS(),
                ).toEqual([page])
            })
        })
    })

    describe('getOnboardingMeta()', () => {
        ;[IntegrationType.Facebook, IntegrationType.Outlook].forEach(
            (integrationType) => {
                it(`should return an empty map because there is no meta in the state (${integrationType})`, () => {
                    expect(
                        getOnboardingMeta(integrationType)({} as RootState),
                    ).toEqual(fromJS({}))
                })

                it('should return the meta of onboarding pages from the state', () => {
                    const meta = { page: 1 }
                    const state = {
                        integrations: fromJS({
                            extra: {
                                [integrationType]: {
                                    onboardingIntegrations: { meta },
                                },
                            },
                        }),
                    } as RootState

                    expect(
                        getOnboardingMeta(integrationType)(state).toJS(),
                    ).toEqual(meta)
                })
            },
        )
    })

    describe('getFacebookRedirectUri()', () => {
        const FAKE_URI = 'https://.../'
        const FAKE_URI_RECONNECT = 'https://.../?reconnect'
        let state: RootState

        beforeEach(() => {
            state = {
                integrations: fromJS({
                    authentication: {
                        facebook: {
                            redirect_uri_reconnect: FAKE_URI_RECONNECT,
                            redirect_uri: FAKE_URI,
                        },
                    },
                }),
            } as RootState
        })

        it('should return the login URI', () => {
            const uri = getFacebookRedirectUri()(state)
            expect(uri).toEqual(FAKE_URI)
        })

        it('should return the reconnect URI', () => {
            const uri = getFacebookRedirectUri(true)(state)
            expect(uri).toEqual(FAKE_URI_RECONNECT)
        })
    })

    describe('getMagento2IntegrationsByStoreUrl()', () => {
        it('should return the matching integration', () => {
            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Shopify,
                            meta: {
                                store_url: 'magento.gorgi.us',
                            },
                        },
                        {
                            id: 2,
                            type: IntegrationType.Magento2,
                            meta: {
                                store_url: 'magento.gorgi.us',
                            },
                        },
                        {
                            id: 3,
                            type: IntegrationType.Magento2,
                            meta: {
                                store_url: 'bar',
                            },
                        },
                    ],
                }),
            } as RootState

            const res =
                getMagento2IntegrationByStoreUrl('magento.gorgi.us')(state)
            expect(res.get('id')).toEqual(2)
        })
    })

    describe('getForwardingEmailAddress()', () => {
        it('should return the forwarding email address of the account', () => {
            const forwardingEmailAddress = 'forward@gorgias.io'

            const state = {
                integrations: fromJS({
                    authentication: {
                        [IntegrationType.Email]: {
                            forwarding_email_address: forwardingEmailAddress,
                        },
                    },
                }),
            } as RootState

            expect(getForwardingEmailAddress(state)).toEqual(
                forwardingEmailAddress,
            )
        })
    })

    it('should get active integrations', () => {
        const integrations = getActiveIntegrations(state)

        const expected = (
            DEPRECATED_getIntegrationsState(state).get(
                'integrations',
            ) as List<any>
        ).filter(
            (integration: Map<any, any>) =>
                !integration.get('deactivated_datetime'),
        )

        expect(integrations).toEqual(expected)
    })

    describe('getIsChatIntegrationStatusLoading()', () => {
        it('should return true if chat status is being fetched', () => {
            const state = {
                integrations: fromJS({
                    state: {
                        loading: {
                            chatStatus: {
                                1: true,
                            },
                        },
                    },
                }),
            } as RootState

            const res = getIsChatIntegrationStatusLoading(1)(state)
            expect(res).toEqual(true)
        })

        it('should return false if chat status finished fetching', () => {
            const state = {
                integrations: fromJS({
                    state: {
                        loading: {
                            chatStatus: {
                                1: false,
                            },
                        },
                    },
                }),
            } as RootState

            const res = getIsChatIntegrationStatusLoading(1)(state)
            expect(res).toEqual(false)
        })
    })

    describe('getIsChatIntegrationStatusError()', () => {
        it('should return false if chat status fetching did not resulted in error', () => {
            const state = {
                integrations: fromJS({
                    state: {
                        error: {
                            chatStatus: {
                                1: false,
                            },
                        },
                    },
                }),
            } as RootState

            const res = getIsChatIntegrationStatusError(1)(state)
            expect(res).toEqual(false)
        })

        it('should return true if chat status fetching resulted in error', () => {
            const state = {
                integrations: fromJS({
                    state: {
                        error: {
                            chatStatus: {
                                1: true,
                            },
                        },
                    },
                }),
            } as RootState

            const res = getIsChatIntegrationStatusError(1)(state)
            expect(res).toEqual(true)
        })
    })

    describe('getIntegrationByIdAndType()', () => {
        it('should return the integration with the given id and type', () => {
            expect(
                getIntegrationByIdAndType(4, IntegrationType.Http)(state),
            ).toEqual(
                expect.objectContaining({
                    id: 4,
                    type: IntegrationType.Http,
                }),
            )
        })
    })

    describe('getSendersForChannel()', () => {
        it('should return the same list as getChannelsForSourceType() for legacy channels', () => {
            expect(getSendersForChannel('email')(state)).toEqual(
                getChannelsForSourceType(TicketMessageSourceType.Email)(
                    state,
                ).toJS(),
            )
            expect(getSendersForChannel('whatsapp-message')(state)).toEqual(
                getChannelsForSourceType(
                    TicketMessageSourceType.WhatsAppMessage,
                )(state).toJS(),
            )
            expect(getSendersForChannel('whatsapp')(state)).toEqual(
                getChannelsForSourceType(TicketChannel.WhatsApp)(state).toJS(),
            )
        })

        it('should return a list of SourceAddress objects for new channels', () => {
            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 123,
                            type: 'app',
                            application_id: '64785607477d0a11fc731bfa',
                            name: 'The Shop',
                            meta: {
                                address: 'theshop',
                            },
                        },
                        {
                            id: 456,
                            type: 'app',
                            application_id: '64785607477d0a11fc731bfa',
                            name: 'Second Shop',
                            meta: {
                                address: 'second-shop',
                            },
                        },
                        {
                            id: 789,
                            type: 'app',
                            application_id: 'not-matching-application-id',
                            name: 'Third Shop',
                            meta: {
                                address: 'third-shop',
                            },
                        },
                    ],
                }),
            } as RootState
            expect(getSendersForChannel('tiktok-shop')(state)).toEqual([
                {
                    address: 'theshop',
                    name: 'The Shop',
                    isDeactivated: false,
                    isDefault: false,
                },
                {
                    address: 'second-shop',
                    name: 'Second Shop',
                    isDeactivated: false,
                    isDefault: false,
                },
            ])
        })
    })

    describe('getIntegrationByAddress()', () => {
        it('should return a matching integration by address', () => {
            const integrationByAddress = getIntegrationByAddress(
                'billing@acme.gorgias.io',
            )(state)
            expect(integrationByAddress).toBeDefined()
            expect(integrationByAddress!.id).toEqual(5)
            expect(integrationByAddress!.type).toEqual('gmail')
        })

        it('should return undefined if nothing matches', () => {
            const integrationByAddress =
                getIntegrationByAddress('invalid-address')(state)
            expect(integrationByAddress).toBeUndefined()
        })
    })

    describe('getIntegrationsByAppId()', () => {
        const state = {
            integrations: fromJS({
                integrations: [
                    {
                        id: 123,
                        type: 'app',
                        application_id: '64785607477d0a11fc731bfa',
                        name: 'The Shop',
                        meta: {
                            address: 'theshop',
                        },
                    },
                    {
                        id: 1234,
                        type: 'app',
                        application_id: 'nope',
                        name: 'Another Shop',
                        meta: {
                            address: 'nope-shop',
                        },
                    },
                ],
            }),
        } as RootState
        expect(
            getIntegrationsByAppId('64785607477d0a11fc731bfa')(state),
        ).toEqual([
            {
                id: 123,
                type: 'app',
                application_id: '64785607477d0a11fc731bfa',
                name: 'The Shop',
                meta: {
                    address: 'theshop',
                },
            },
        ])
    })

    describe('getIntegrationsByAppId()', () => {
        it('should return integrations with ecom type', () => {
            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 123,
                            type: 'ecom',
                            application_id: '64785607477d0a11fc731bfa',
                            name: 'The Shop',
                            meta: {
                                store_uuid: 'uuid',
                            },
                        },
                        {
                            id: 1234,
                            type: 'ecom',
                            application_id: 'nope',
                            name: 'Another Shop',
                            meta: {
                                store_uuid: 'nope uuid',
                            },
                        },
                    ],
                }),
            } as RootState
            expect(
                getIntegrationsByAppId('64785607477d0a11fc731bfa')(state),
            ).toEqual([
                {
                    id: 123,
                    type: 'ecom',
                    application_id: '64785607477d0a11fc731bfa',
                    name: 'The Shop',
                    meta: {
                        store_uuid: 'uuid',
                    },
                },
            ])
        })
    })

    describe('getStandardPhoneIntegrations()', () => {
        it('should return only the standard phone integrations', () => {
            const standardIntegration = {
                id: 1234,
                type: 'phone',
                application_id: 'nope',
                name: 'Test Phone standard',
                meta: {
                    function: 'standard',
                },
            }
            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 123,
                            type: 'app',
                            application_id: '64785607477d0a11fc731bfa',
                            name: 'The Shop',
                            meta: {
                                address: 'theshop',
                            },
                        },
                        standardIntegration,
                        {
                            id: 1235,
                            type: 'phone',
                            application_id: 'nope',
                            name: 'Test Phone IVR',
                            meta: {
                                function: 'ivr',
                            },
                        },
                    ],
                }),
            } as RootState
            const standardPhoneIntegrations =
                getStandardPhoneIntegrations(state)

            const expected = [standardIntegration]
            expect(standardPhoneIntegrations).toEqual(expected)
        })
    })

    describe('getShowShopifyCheckoutChatBanner()', () => {
        it.each`
            stateValue   | expectedValue
            ${undefined} | ${false}
            ${false}     | ${false}
            ${true}      | ${true}
        `(
            'should return $expectedValue if the flag is in state is $stateValue',
            ({ stateValue, expectedValue }) => {
                const state = {
                    integrations: fromJS({
                        extra: {
                            [IntegrationType.GorgiasChat]: {
                                shopifyCheckoutChatBannerVisible: stateValue,
                            },
                        },
                    }),
                } as RootState
                expect(getShowShopifyCheckoutChatBanner(state)).toEqual(
                    expectedValue,
                )
            },
        )
    })
})
