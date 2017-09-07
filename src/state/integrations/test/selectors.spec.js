import {
    getIntegrationsState, getIntegrations, getEmailIntegrations, getChannels,
    getShopifyIntegrationsWithoutChat
} from '../selectors'
import {integrationsState} from '../../../fixtures/integrations'
import {fromJS} from 'immutable'

const state = {
    integrations: fromJS(integrationsState),
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
        const channels = getChannels(state)
        const expected = getEmailIntegrations(state).map(inte => {
            let type = inte.get('type')

            if (inte.get('type') === 'gmail') {
                type = 'email'
            }

            return fromJS({
                id: inte.get('id'),
                type,
                name: inte.get('name'),
                address: inte.getIn(['meta', 'address']),
                preferred: inte.getIn(['meta', 'preferred']),
            })
        })
        expect(channels.equals(expected)).toEqual(true)
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
})
