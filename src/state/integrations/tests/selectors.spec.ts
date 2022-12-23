import {fromJS, List} from 'immutable'
import {size} from 'lodash'

import {TicketMessageSourceType} from 'business/types/ticket'

import {RootState} from '../../types'

import {
    getBaseEmailIntegration,
    getChannelByTypeAndAddress,
    getEmailChannels,
    getActiveEmailChannels,
    getChannelSignature,
    getChatIntegrationCampaignById,
    getChatIntegrationCampaigns,
    getCurrentIntegration,
    getEmailIntegrations,
    getFacebookRedirectUri,
    getForwardingEmailAddress,
    DEPRECATED_getIntegrations,
    getIntegrations,
    DEPRECATED_getIntegrationsState,
    getIntegrationsState,
    getMagento2IntegrationByStoreUrl,
    getOnboardingIntegrations,
    getOnboardingMeta,
    getShopifyIntegrationByShopName,
    getShopifyIntegrationsWithoutChat,
    getShopifyIntegrationsWithoutFacebook,
    hasAtLeastOneEmailIntegration,
    getMessagingIntegrations,
    DEPRECATED_getPhoneIntegrations,
    getActiveIntegrations,
    getChannelsForSourceType,
    getIsChatIntegrationStatusLoading,
    getIsChatIntegrationStatusError,
} from '../selectors'
import {integrationsState} from '../../../fixtures/integrations'
import {
    Integration,
    EmailIntegration,
    ShopifyIntegration,
    PhoneIntegration,
    IntegrationType,
    isPhoneIntegration,
} from '../../../models/integration/types'

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

    describe('getMessagingIntegrations()', () => {
        it('should get messaging integrations', () => {
            const messagingIntegrations = getMessagingIntegrations(state).toJS()
            const allIntegrations: Integration[] =
                DEPRECATED_getIntegrations(state).toJS()
            const expected = allIntegrations.filter(
                (integration: Integration) =>
                    [
                        IntegrationType.Email,
                        IntegrationType.Outlook,
                        IntegrationType.Gmail,
                        IntegrationType.Aircall,
                        IntegrationType.SmoochInside,
                        IntegrationType.Smooch,
                        IntegrationType.Facebook,
                        IntegrationType.Phone,
                        IntegrationType.Twitter,
                        IntegrationType.GorgiasChat,
                    ].includes(integration.type)
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
                        integration.type
                    )
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

    it('should get active channels', () => {
        const activeEmailChannels = getActiveEmailChannels(state).toJS() as {
            isDeactivated: boolean
        }[]
        const inactiveEmailChannels = activeEmailChannels.filter(
            (channel: {isDeactivated: boolean}) => channel.isDeactivated
        )
        expect(inactiveEmailChannels).toHaveLength(0)
    })

    it('should get channel by type and address', () => {
        expect(
            getChannelByTypeAndAddress(IntegrationType.Email, '')(state)
        ).toEqual(fromJS({}))
        expect(
            getChannelByTypeAndAddress(
                IntegrationType.Email,
                'support@acme.gorgias.io'
            )(state)
        ).toMatchSnapshot()
    })

    it('should get channels signature', () => {
        expect(
            getChannelSignature(
                IntegrationType.Email,
                'support@acme.gorgias.io'
            )(state)
        ).toMatchSnapshot()
    })

    describe('getChannelsForSourceType()', () => {
        const state = {
            integrations: fromJS({
                integrations: [
                    {
                        id: 1,
                        type: 'email',
                        name: 'John Doe',
                        meta: {address: 'support@mycompany.com'},
                    },
                    {
                        id: 2,
                        type: 'phone',
                        name: 'John Doe',
                        meta: {
                            twilio_phone_number_id: 1,
                        },
                    },
                    {
                        id: 3,
                        type: 'sms',
                        name: 'John Doe',
                        meta: {
                            twilio_phone_number_id: 1,
                        },
                    },
                    {
                        id: 3,
                        type: 'whatsapp',
                        name: 'John Doe',
                        meta: {
                            routing: {
                                phone_number: '+123456789',
                            },
                        },
                    },
                ],
            }),
            entities: {
                phoneNumbers: {
                    1: {
                        phone_number: '+123456789',
                    },
                },
            },
        } as unknown as RootState

        it('should get email integrations as channels when source type is email', () => {
            expect(
                getChannelsForSourceType(TicketMessageSourceType.Email)(state)
            ).toEqual(
                fromJS([
                    {
                        id: 1,
                        type: 'email',
                        name: 'John Doe',
                        address: 'support@mycompany.com',
                        preferred: undefined,
                        signature: undefined,
                        verified: false,
                        isDeactivated: false,
                    },
                ])
            )
        })

        it('should get phone integrations as channels when source type is phone', () => {
            expect(
                getChannelsForSourceType(TicketMessageSourceType.Phone)(state)
            ).toEqual(
                fromJS([
                    {
                        id: 2,
                        type: 'phone',
                        name: 'John Doe',
                        address: '+123456789',
                    },
                ])
            )
        })

        it('should get SMS integrations as channels when source type is sms', () => {
            expect(
                getChannelsForSourceType(TicketMessageSourceType.Sms)(state)
            ).toEqual(
                fromJS([
                    {
                        id: 3,
                        type: 'sms',
                        name: 'John Doe',
                        address: '+123456789',
                    },
                ])
            )
        })

        it('should get WhatsApp integrations as channels when source type is whatsapp-message', () => {
            expect(
                getChannelsForSourceType(
                    TicketMessageSourceType.WhatsAppMessage
                )(state)
            ).toEqual(
                fromJS([
                    {
                        id: 3,
                        type: 'whatsapp',
                        name: 'John Doe',
                        address: '+123456789',
                    },
                ])
            )
        })
    })

    describe('getShopifyIntegrationsWithoutChat()', () => {
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
                            type: 'smooch_inside',
                            meta: {
                                shopify_integration_ids: [1],
                            },
                        },
                    ],
                }),
            } as RootState

            const shopifyIntegrations: ShopifyIntegration[] =
                getShopifyIntegrationsWithoutChat(state).toJS()
            expect(size(shopifyIntegrations)).toEqual(1)

            const integration: ShopifyIntegration = shopifyIntegrations[0]
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
                            type: 'smooch_inside',
                            meta: {
                                shopify_integration_ids: [1, 2],
                            },
                        },
                    ],
                }),
            } as RootState

            const res = getShopifyIntegrationsWithoutChat(state)
            expect(res.size).toEqual(0)
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

    describe('getChatIntegrationCampaigns()', () => {
        it('should return the campaigns of the correct chat integration', () => {
            const expectedCampaigns = [
                {
                    name: 'una campagnita',
                },
                {
                    name: 'una otra campagnita',
                },
            ]

            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: 'smooch_inside',
                            meta: {
                                campaigns: [
                                    {
                                        name: 'some campaign',
                                    },
                                    {
                                        name: 'another campaign',
                                    },
                                ],
                            },
                        },
                        {
                            id: 3,
                            type: 'smooch_inside',
                            meta: {
                                campaigns: expectedCampaigns,
                            },
                        },
                    ],
                }),
            } as RootState

            const res = getChatIntegrationCampaigns(3)(state)

            expect(res.toJS()).toEqual(expectedCampaigns)
        })
    })

    describe('getChatIntegrationCampaignById()', () => {
        it('should return the correct campaign of the correct chat integration', () => {
            const expectedCampaign = {
                name: 'campaign inte 3',
                id: 123,
            }

            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: 'smooch_inside',
                            meta: {
                                campaigns: [
                                    {
                                        name: 'campaign inte 1',
                                        id: 123,
                                    },
                                    {
                                        name: 'una otra campagnita',
                                        id: 456,
                                    },
                                ],
                            },
                        },
                        {
                            id: 3,
                            type: 'smooch_inside',
                            meta: {
                                campaigns: [
                                    expectedCampaign,
                                    {
                                        name: 'una otra campagnita',
                                        id: 456,
                                    },
                                ],
                            },
                        },
                    ],
                }),
            } as RootState

            const res = getChatIntegrationCampaignById(3, 123)(state)

            expect(res.toJS()).toEqual(expectedCampaign)
        })
    })

    describe('getCurrentIntegration()', () => {
        it('should return fromJS({}) because there is no current integration', () => {
            const state = {
                integrations: fromJS({
                    integrations: [{id: 1}, {id: 2}],
                    integration: null,
                }),
            } as RootState

            expect(getCurrentIntegration(state).toJS()).toEqual({})
        })

        it('should return the current integration', () => {
            const currentIntegration = {id: 3}
            const state = {
                integrations: fromJS({
                    integrations: [{id: 1}, {id: 2}],
                    integration: currentIntegration,
                }),
            } as RootState

            expect(getCurrentIntegration(state).toJS()).toEqual(
                currentIntegration
            )
        })
    })

    describe('getOnboardingIntegrations()', () => {
        ;[IntegrationType.Facebook, IntegrationType.Outlook].forEach(
            (integrationType) => {
                it(`should return an empty list because there is no integrations in the state (${integrationType})`, () => {
                    expect(
                        getOnboardingIntegrations(integrationType)(
                            {} as RootState
                        )
                    ).toEqual(fromJS([]))
                })

                it(`should return the list of onboarding pages from the state (${integrationType})`, () => {
                    const page = {id: 1, name: 'foo'}
                    const state = {
                        integrations: fromJS({
                            extra: {
                                [integrationType]: {
                                    onboardingIntegrations: {data: [page]},
                                },
                            },
                        }),
                    } as RootState

                    expect(
                        getOnboardingIntegrations(integrationType)(state).toJS()
                    ).toEqual([page])
                })
            }
        )
    })

    describe('getOnboardingMeta()', () => {
        ;[IntegrationType.Facebook, IntegrationType.Outlook].forEach(
            (integrationType) => {
                it(`should return an empty map because there is no meta in the state (${integrationType})`, () => {
                    expect(
                        getOnboardingMeta(integrationType)({} as RootState)
                    ).toEqual(fromJS({}))
                })

                it('should return the meta of onboarding pages from the state', () => {
                    const meta = {page: 1}
                    const state = {
                        integrations: fromJS({
                            extra: {
                                [integrationType]: {
                                    onboardingIntegrations: {meta},
                                },
                            },
                        }),
                    } as RootState

                    expect(
                        getOnboardingMeta(integrationType)(state).toJS()
                    ).toEqual(meta)
                })
            }
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
                forwardingEmailAddress
            )
        })
    })

    describe('isImportAllowed()', () => {
        const testadress = {address: 'testaddress@email.com'}

        it.each([
            [
                [
                    {
                        type: IntegrationType.Email,
                        meta: {verified: true, ...testadress},
                    },
                ],
                true,
            ],
            [
                [
                    {
                        type: IntegrationType.Gmail,
                        meta: testadress,
                    },
                ],
                true,
            ],
            [
                [
                    {
                        type: IntegrationType.Outlook,
                        meta: testadress,
                    },
                ],
                true,
            ],
            [
                [
                    {
                        type: IntegrationType.Email,
                        meta: {verified: false, ...testadress},
                    },
                ],
                false,
            ],
            [
                [
                    {
                        type: IntegrationType.Email,
                        meta: {
                            verified: true,
                            address: `testadress@${
                                window.GORGIAS_STATE?.integrations
                                    ?.authentication?.email
                                    ?.forwarding_email_address || ''
                            }`,
                        },
                    },
                ],
                false,
            ],
            [
                [
                    {
                        type: IntegrationType.Gmail,
                        deactivated_datetime: 'sometime',
                        meta: testadress,
                    },
                ],
                false,
            ],
        ])(
            'hasAtLeastOneEmailIntegration',
            (integrationsJSON, expectedResult) => {
                const state = {
                    integrations: fromJS({
                        integrations: integrationsJSON,
                    }),
                } as RootState

                expect(hasAtLeastOneEmailIntegration(state)).toBe(
                    expectedResult
                )
            }
        )
    })

    it('should get active and non self-service integrations', () => {
        const integrations = getActiveIntegrations(state)

        const expected = (
            DEPRECATED_getIntegrationsState(state).get(
                'integrations'
            ) as List<any>
        ).filter(
            (integration: Map<any, any>) =>
                !integration.get('deactivated_datetime') &&
                integration.get('type') !== IntegrationType.SelfService
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
})
