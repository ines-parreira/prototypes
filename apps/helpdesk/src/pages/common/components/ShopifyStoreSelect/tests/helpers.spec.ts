import { fromJS, List, Map } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-queries'

import type { IntegrationWithDefaultFlag } from '../helpers'
import {
    getDefaultStore,
    normalizeIntegrationsWithDefaultFlagResponse,
    selectNormalizedIntegrations,
} from '../helpers'

describe('getDefaultStore', () => {
    it('should return the id of the default store if it exists', () => {
        const integrations = List([
            Map({ id: 1, default: false }),
            Map({ id: 2, default: true }),
            Map({ id: 3, default: false }),
        ])
        const result = getDefaultStore(integrations)
        expect(result).toBe(2)
    })

    it('should return the id of the first store if no default store exists', () => {
        const integrations = List([
            Map({ id: 1, default: false }),
            Map({ id: 2, default: false }),
            Map({ id: 3, default: false }),
        ])
        const result = getDefaultStore(integrations)
        expect(result).toBe(1)
    })

    it('should return undefined if the integrations list is empty', () => {
        const integrations: List<Map<any, any>> = List()
        const result = getDefaultStore(integrations)
        expect(result).toBeUndefined()
    })
})

describe('normalizeIntegrationsWithDefaultFlagResponse', () => {
    it('should normalize integrations correctly', () => {
        const integrations: IntegrationWithDefaultFlag[] = [
            {
                integration_id: 1,
                integration_type: IntegrationType.Shopify,
                integration_name: 'name1',
                has_customer_data: true,
                default: false,
            },
            {
                integration_id: 2,
                integration_type: IntegrationType.Shopify,
                integration_name: 'name2',
                has_customer_data: false,
                default: true,
            },
        ]

        const expected = [
            {
                id: 1,
                name: 'name1',
                type: 'shopify',
                hasCustomerData: true,
                default: false,
            },
            {
                id: 2,
                name: 'name2',
                type: 'shopify',
                hasCustomerData: false,
                default: true,
            },
        ]

        const result =
            normalizeIntegrationsWithDefaultFlagResponse(integrations)
        expect(result).toEqual(expected)
    })

    it('should return an empty array if input is empty', () => {
        const integrations: IntegrationWithDefaultFlag[] = []
        const result =
            normalizeIntegrationsWithDefaultFlagResponse(integrations)
        expect(result).toEqual([])
    })
})

describe('selectNormalizedIntegrations', () => {
    it('should normalize and convert integrations to immutable data structure', () => {
        const data = {
            data: {
                integrations: [
                    {
                        integration_id: 1,
                        integration_type: 'type1',
                        integration_name: 'name1',
                        has_customer_data: true,
                        default: false,
                    },
                    {
                        integration_id: 2,
                        integration_type: 'type2',
                        integration_name: 'name2',
                        has_customer_data: false,
                        default: true,
                    },
                ],
            },
        }

        const expected = fromJS([
            {
                id: 1,
                name: 'name1',
                type: 'type1',
                hasCustomerData: true,
                default: false,
            },
            {
                id: 2,
                name: 'name2',
                type: 'type2',
                hasCustomerData: false,
                default: true,
            },
        ])

        const result = selectNormalizedIntegrations(data)
        expect(result).toEqual(expected)
    })

    it('should return an empty immutable list if input data is empty', () => {
        const data = { data: { integrations: [] } }
        const expected = fromJS([])
        const result = selectNormalizedIntegrations(data)
        expect(result).toEqual(expected)
    })

    it('should return an empty immutable list if data is empty', () => {
        const data = {}
        const expected = fromJS([])
        const result = selectNormalizedIntegrations(data)
        expect(result).toEqual(expected)
    })
})
