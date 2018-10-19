import {
    getIntegrationsState,
    getIntegrations,
    getEmailIntegrations,
    getChannels,
    getShopifyIntegrationsWithoutChat,
    getShopifyIntegrationsWithoutFacebook,
    getShopifyIntegrationByShopName,
    getChatIntegrationCampaigns,
    getChatIntegrationCampaignById,
    getChannelByTypeAndAddress,
    getChannelSignature,
    getCurrentIntegration,
} from '../selectors'
import {integrationsState} from '../../../fixtures/integrations'
import {fromJS} from 'immutable'

const state = {
    integrations: fromJS(integrationsState),
    currentUser: fromJS({
        'first_name': 'Steve'
    })
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

    it('should get email integrations', () => {
        const integrations = getEmailIntegrations(state)
        const expected = getIntegrations(state).filter(inte => ['email', 'gmail'].includes(inte.get('type', '')))

        expect(integrations.equals(expected)).toEqual(true)
    })

    it('should get channels', () => {
        expect(getChannels(state)).toMatchSnapshot()
    })

    it('should get channel by type and address', () => {
        expect(getChannelByTypeAndAddress()(state)).toEqual(fromJS({}))
        expect(getChannelByTypeAndAddress('email', 'support@acme.gorgias.io')(state)).toMatchSnapshot()
    })

    it('should get channels signature', () => {
        expect(getChannelSignature('email', 'support@acme.gorgias.io')(state)).toMatchSnapshot()
    })

    describe('getShopifyIntegrationsWithoutChat selector', () => {
        it('should return one integration', () => {
            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: 'shopify'
                        },
                        {
                            id: 2,
                            type: 'shopify'
                        },
                        {
                            id: 3,
                            type: 'smooch_inside',
                            meta: {
                                shopify_integration_ids: [1]
                            }
                        }
                    ]
                })
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
                            type: 'shopify'
                        },
                        {
                            id: 2,
                            type: 'shopify'
                        },
                        {
                            id: 3,
                            type: 'smooch_inside',
                            meta: {
                                shopify_integration_ids: [1, 2]
                            }
                        }
                    ]
                })
            }

            const res = getShopifyIntegrationsWithoutChat(state)
            expect(res.size).toEqual(0)
        })
    })

    describe('getShopifyIntegrationsWithoutFacebook', () => {
        it('should return one integration', () => {
            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: 'shopify'
                        },
                        {
                            id: 2,
                            type: 'shopify'
                        },
                        {
                            id: 3,
                            type: 'facebook',
                            meta: {
                                shopify_integration_ids: [1]
                            }
                        }
                    ]
                })
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
                            type: 'shopify'
                        },
                        {
                            id: 2,
                            type: 'shopify'
                        },
                        {
                            id: 3,
                            type: 'facebook',
                            meta: {
                                shopify_integration_ids: [1, 2]
                            }
                        }
                    ]
                })
            }

            const res = getShopifyIntegrationsWithoutFacebook(state)
            expect(res.size).toEqual(0)
        })
    })

    describe('getShopifyIntegrationByShopName selector', () => {
        it('should return the matching integration', () => {
            const state = {
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: 'shopify',
                            meta: {
                                shop_name: 'foo'
                            }
                        },
                        {
                            id: 2,
                            type: 'shopify',
                            meta: {
                                shop_name: 'bar'
                            }
                        },
                        {
                            id: 3,
                            type: 'facebook',
                            meta: {
                                shop_name: 'bar'
                            }
                        }
                    ]
                })
            }

            const res = getShopifyIntegrationByShopName('bar')(state)
            expect(res.get('id')).toEqual(2)
        })
    })

    describe('getChatIntegrationCampaigns selector', () => {
        it('should return the campaigns of the correct chat integration', () => {
            const expectedCampaigns = [{
                name: 'una campagnita'
            }, {
                name: 'una otra campagnita'
            }]

            const state = {
                integrations: fromJS({
                    integrations: [{
                        id: 1,
                        type: 'smooch_inside',
                        meta: {
                            campaigns: [{
                                name: 'some campaign'
                            }, {
                                name: 'another campaign'
                            }]
                        }
                    }, {
                        id: 3,
                        type: 'smooch_inside',
                        meta: {
                            campaigns: expectedCampaigns
                        }
                    }]
                })
            }

            const res = getChatIntegrationCampaigns(3)(state)

            expect(res.toJS()).toEqual(expectedCampaigns)
        })
    })

    describe('getChatIntegrationCampaignById selector', () => {
        it('should return the correct campaign of the correct chat integration', () => {
            const expectedCampaign = {
                name: 'campaign inte 3',
                id: 'una-campagnita-123'
            }

            const state = {
                integrations: fromJS({
                    integrations: [{
                        id: 1,
                        type: 'smooch_inside',
                        meta: {
                            campaigns: [{
                                name: 'campaign inte 1',
                                id: 'una-campagnita-123'
                            }, {
                                name: 'una otra campagnita',
                                id: 'una-otra-campagnita-456'
                            }]
                        }
                    }, {
                        id: 3,
                        type: 'smooch_inside',
                        meta: {
                            campaigns: [expectedCampaign, {
                                name: 'una otra campagnita',
                                id: 'una-otra-campagnita-456'
                            }]
                        }
                    }]
                })
            }

            const res = getChatIntegrationCampaignById(3, 'una-campagnita-123')(state)

            expect(res.toJS()).toEqual(expectedCampaign)
        })
    })

    describe('getCurrentIntegration selector', () => {
        it('should return fromJS({}) because there is no current integration', () => {
            const state = {
                integrations: fromJS({
                    integrations: [{id: 1}, {id: 2}],
                    integration: null
                })
            }

            expect(getCurrentIntegration(state).toJS()).toEqual({})
        })

        it('should return the current integration', () => {
            const currentIntegration = {id: 3}
            const state = {
                integrations: fromJS({
                    integrations: [{id: 1}, {id: 2}],
                    integration: currentIntegration
                })
            }

            expect(getCurrentIntegration(state).toJS()).toEqual(currentIntegration)
        })
    })
})
