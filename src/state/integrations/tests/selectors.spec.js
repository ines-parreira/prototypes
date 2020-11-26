import {fromJS} from 'immutable'

import {
    EMAIL_INTEGRATION_TYPE,
    FACEBOOK_INTEGRATION_TYPE,
    GMAIL_INTEGRATION_TYPE,
    MAGENTO2_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../constants/integration.ts'

import {
    getBaseEmailIntegration,
    getChannelByTypeAndAddress,
    getChannels,
    getChannelSignature,
    getChatIntegrationCampaignById,
    getChatIntegrationCampaigns,
    getCurrentIntegration,
    getEmailIntegrations,
    getFacebookRedirectUri,
    getForwardingEmailAddress,
    getIntegrations,
    getIntegrationsState,
    getMagento2IntegrationByStoreUrl,
    getOnboardingIntegrations,
    getOnboardingMeta,
    getShopifyIntegrationByShopName,
    getShopifyIntegrationsWithoutChat,
    getShopifyIntegrationsWithoutFacebook,
    hasAtLeastOneEmailIntegration,
    getMessagingIntegrations,
} from '../selectors.ts'
import {integrationsState} from '../../../fixtures/integrations.ts'

const state = {
    integrations: fromJS(integrationsState),
    currentUser: fromJS({
        first_name: 'Steve',
    }),
}

describe('integrations selectors', () => {
    it('should get integrations state', () => {
        const integrations = getIntegrationsState(state)
        expect(integrations.equals(state.integrations)).toEqual(true)
    })

    it('should get integrations', () => {
        const integrations = getIntegrations(state)
        const expected = getIntegrationsState(state).get('integrations')

        expect(integrations.equals(expected)).toEqual(true)
    })

    describe('getMessagingIntegrations()', () => {
        it('should get messaging integrations', () => {
            const integrations = getMessagingIntegrations(state)
            const expected = getIntegrations(state).filter((inte) =>
                [
                    'email',
                    'outlook',
                    'gmail',
                    'aircall',
                    'smooch_inside',
                    'smooch',
                    'facebook',
                ].includes(inte.get('type', ''))
            )

            expect(integrations.equals(expected)).toEqual(true)
        })
    })

    describe('getEmailIntegrations()', () => {
        it('should get email integrations', () => {
            const integrations = getEmailIntegrations(state)
            const expected = getIntegrations(state).filter((inte) =>
                ['email', 'gmail'].includes(inte.get('type', ''))
            )

            expect(integrations.equals(expected)).toEqual(true)
        })
    })

    describe('getBaseEmailIntegration()', () => {
        it('should return the base email integration', () => {
            const baseEmailIntegration = fromJS({
                id: 1,
                type: EMAIL_INTEGRATION_TYPE,
                meta: {
                    address: `asd48sa6d@${window.EMAIL_FORWARDING_DOMAIN}`,
                },
            })

            const result = getBaseEmailIntegration({
                integrations: fromJS({
                    integrations: [baseEmailIntegration],
                }),
            })

            expect(result).toEqual(baseEmailIntegration)
        })

        it('should return an empty map because there is no base email integration', () => {
            const baseEmailIntegration = fromJS({
                id: 1,
                type: EMAIL_INTEGRATION_TYPE,
                meta: {
                    address: 'support@mycompany.com',
                },
            })

            const result = getBaseEmailIntegration({
                integrations: fromJS({
                    integrations: [baseEmailIntegration],
                }),
            })

            expect(result).toEqual(fromJS({}))
        })
    })

    it('should get channels', () => {
        expect(getChannels(state)).toMatchSnapshot()
    })

    it('should get channel by type and address', () => {
        expect(getChannelByTypeAndAddress()(state)).toEqual(fromJS({}))
        expect(
            getChannelByTypeAndAddress(
                'email',
                'support@acme.gorgias.io'
            )(state)
        ).toMatchSnapshot()
    })

    it('should get channels signature', () => {
        expect(
            getChannelSignature('email', 'support@acme.gorgias.io')(state)
        ).toMatchSnapshot()
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
            }

            const res = getShopifyIntegrationsWithoutChat(state)
            expect(res.size).toEqual(1)

            const integration = res.first()
            expect(integration.get('id')).toEqual(2)
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
            }

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
            }

            const res = getShopifyIntegrationsWithoutFacebook(state)
            expect(res.size).toEqual(1)

            const integration = res.first()
            expect(integration.get('id')).toEqual(2)
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
            }

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
            }

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
            }

            const res = getChatIntegrationCampaigns(3)(state)

            expect(res.toJS()).toEqual(expectedCampaigns)
        })
    })

    describe('getChatIntegrationCampaignById()', () => {
        it('should return the correct campaign of the correct chat integration', () => {
            const expectedCampaign = {
                name: 'campaign inte 3',
                id: 'una-campagnita-123',
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
                                        id: 'una-campagnita-123',
                                    },
                                    {
                                        name: 'una otra campagnita',
                                        id: 'una-otra-campagnita-456',
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
                                        id: 'una-otra-campagnita-456',
                                    },
                                ],
                            },
                        },
                    ],
                }),
            }

            const res = getChatIntegrationCampaignById(
                3,
                'una-campagnita-123'
            )(state)

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
            }

            expect(getCurrentIntegration(state).toJS()).toEqual({})
        })

        it('should return the current integration', () => {
            const currentIntegration = {id: 3}
            const state = {
                integrations: fromJS({
                    integrations: [{id: 1}, {id: 2}],
                    integration: currentIntegration,
                }),
            }

            expect(getCurrentIntegration(state).toJS()).toEqual(
                currentIntegration
            )
        })
    })

    describe('getOnboardingIntegrations()', () => {
        ;[FACEBOOK_INTEGRATION_TYPE, OUTLOOK_INTEGRATION_TYPE].forEach(
            (integrationType) => {
                it(`should return an empty list because there is no integrations in the state (${integrationType})`, () => {
                    expect(
                        getOnboardingIntegrations(integrationType)({})
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
                    }

                    expect(
                        getOnboardingIntegrations(integrationType)(state).toJS()
                    ).toEqual([page])
                })
            }
        )
    })

    describe('getOnboardingMeta()', () => {
        ;[FACEBOOK_INTEGRATION_TYPE, OUTLOOK_INTEGRATION_TYPE].forEach(
            (integrationType) => {
                it(`should return an empty map because there is no meta in the state (${integrationType})`, () => {
                    expect(getOnboardingMeta(integrationType)({})).toEqual(
                        fromJS({})
                    )
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
                    }

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
        let state

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
            }
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
                            type: SHOPIFY_INTEGRATION_TYPE,
                            meta: {
                                store_url: 'magento.gorgi.us',
                            },
                        },
                        {
                            id: 2,
                            type: MAGENTO2_INTEGRATION_TYPE,
                            meta: {
                                store_url: 'magento.gorgi.us',
                            },
                        },
                        {
                            id: 3,
                            type: MAGENTO2_INTEGRATION_TYPE,
                            meta: {
                                store_url: 'bar',
                            },
                        },
                    ],
                }),
            }

            const res = getMagento2IntegrationByStoreUrl('magento.gorgi.us')(
                state
            )
            expect(res.get('id')).toEqual(2)
        })
    })

    describe('getForwardingEmailAddress()', () => {
        it('should return the forwarding email address of the account', () => {
            const forwardingEmailAddress = 'forward@gorgias.io'

            const state = {
                integrations: fromJS({
                    authentication: {
                        [EMAIL_INTEGRATION_TYPE]: {
                            forwarding_email_address: forwardingEmailAddress,
                        },
                    },
                }),
            }

            expect(getForwardingEmailAddress(state)).toEqual(
                forwardingEmailAddress
            )
        })
    })

    describe('hasAtLeastOneEmailIntegration()', () => {
        const testadress = {address: 'testaddress@email.com'}

        it.each([
            [
                [
                    {
                        type: EMAIL_INTEGRATION_TYPE,
                        meta: {verified: true, ...testadress},
                    },
                ],
                true,
            ],
            [
                [
                    {
                        type: GMAIL_INTEGRATION_TYPE,
                        meta: testadress,
                    },
                ],
                true,
            ],
            [
                [
                    {
                        type: OUTLOOK_INTEGRATION_TYPE,
                        meta: testadress,
                    },
                ],
                true,
            ],
            [
                [
                    {
                        type: EMAIL_INTEGRATION_TYPE,
                        meta: {verified: false, ...testadress},
                    },
                ],
                false,
            ],
            [
                [
                    {
                        type: EMAIL_INTEGRATION_TYPE,
                        meta: {
                            verified: true,
                            address: `testadress@${window.EMAIL_FORWARDING_DOMAIN}`,
                        },
                    },
                ],
                false,
            ],
            [
                [
                    {
                        type: GMAIL_INTEGRATION_TYPE,
                        deactivated_datetime: 'sometime',
                        meta: testadress,
                    },
                ],
                false,
            ],
        ])(
            'At least one email integration exists',
            (integrationsJSON, expectedResult) => {
                const state = {
                    integrations: fromJS({
                        integrations: integrationsJSON,
                    }),
                }

                expect(hasAtLeastOneEmailIntegration(state)).toBe(
                    expectedResult
                )
            }
        )
    })
})
