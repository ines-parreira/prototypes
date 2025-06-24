import { IntegrationType } from 'models/integration/types'

import { sortStoresByName } from '../StoreManagementProvider.helpers'
import { StoreWithAssignedChannels } from '../types'

describe('StoreManagementProvider.helpers', () => {
    describe('sortStoresByName', () => {
        const mockStores: StoreWithAssignedChannels[] = [
            {
                store: {
                    id: 1,
                    name: 'Zebra Store',
                    type: IntegrationType.Shopify,
                    url: 'www.zebra.com',
                    uri: 'www.zebra.com',
                    meta: {},
                } as any,
                assignedChannels: [],
            },
            {
                store: {
                    id: 2,
                    name: 'Alpha Store',
                    type: IntegrationType.BigCommerce,
                    url: 'www.alpha.com',
                    uri: 'www.alpha.com',
                    meta: {},
                } as any,
                assignedChannels: [],
            },
            {
                store: {
                    id: 3,
                    name: 'Beta Store',
                    type: IntegrationType.Magento2,
                    url: 'www.beta.com',
                    uri: 'www.beta.com',
                    meta: {},
                } as any,
                assignedChannels: [],
            },
        ]

        it('should sort stores in ascending order by name', () => {
            const result = sortStoresByName(mockStores, 'asc')

            expect(result[0].store.name).toBe('Alpha Store')
            expect(result[1].store.name).toBe('Beta Store')
            expect(result[2].store.name).toBe('Zebra Store')
        })

        it('should sort stores in descending order by name', () => {
            const result = sortStoresByName(mockStores, 'desc')

            expect(result[0].store.name).toBe('Zebra Store')
            expect(result[1].store.name).toBe('Beta Store')
            expect(result[2].store.name).toBe('Alpha Store')
        })

        it('should not mutate the original array', () => {
            const originalOrder = mockStores.map((store) => store.store.name)

            sortStoresByName(mockStores, 'asc')

            const afterSortOrder = mockStores.map((store) => store.store.name)
            expect(afterSortOrder).toEqual(originalOrder)
        })

        it('should handle empty array', () => {
            const result = sortStoresByName([], 'asc')

            expect(result).toEqual([])
        })

        it('should handle single store', () => {
            const singleStore = [mockStores[0]]
            const result = sortStoresByName(singleStore, 'asc')

            expect(result).toHaveLength(1)
            expect(result[0].store.name).toBe('Zebra Store')
        })

        it('should handle stores with identical names', () => {
            const identicalNameStores: StoreWithAssignedChannels[] = [
                {
                    store: {
                        id: 1,
                        name: 'Same Name Store',
                        type: IntegrationType.Shopify,
                        url: 'www.store1.com',
                        uri: 'www.store1.com',
                        meta: {},
                    } as any,
                    assignedChannels: [],
                },
                {
                    store: {
                        id: 2,
                        name: 'Same Name Store',
                        type: IntegrationType.BigCommerce,
                        url: 'www.store2.com',
                        uri: 'www.store2.com',
                        meta: {},
                    } as any,
                    assignedChannels: [],
                },
            ]

            const resultAsc = sortStoresByName(identicalNameStores, 'asc')
            const resultDesc = sortStoresByName(identicalNameStores, 'desc')

            expect(resultAsc).toHaveLength(2)
            expect(resultDesc).toHaveLength(2)
            expect(resultAsc[0].store.name).toBe('Same Name Store')
            expect(resultDesc[0].store.name).toBe('Same Name Store')
        })

        it('should handle case-insensitive sorting correctly', () => {
            const caseVariedStores: StoreWithAssignedChannels[] = [
                {
                    store: {
                        id: 1,
                        name: 'apple store',
                        type: IntegrationType.Shopify,
                        url: 'www.apple.com',
                        uri: 'www.apple.com',
                        meta: {},
                    } as any,
                    assignedChannels: [],
                },
                {
                    store: {
                        id: 2,
                        name: 'Banana Store',
                        type: IntegrationType.BigCommerce,
                        url: 'www.banana.com',
                        uri: 'www.banana.com',
                        meta: {},
                    } as any,
                    assignedChannels: [],
                },
            ]

            const result = sortStoresByName(caseVariedStores, 'asc')

            expect(result[0].store.name).toBe('apple store')
            expect(result[1].store.name).toBe('Banana Store')
        })

        it('should handle special characters and numbers in store names', () => {
            const specialCharStores: StoreWithAssignedChannels[] = [
                {
                    store: {
                        id: 1,
                        name: '2nd Store',
                        type: IntegrationType.Shopify,
                        url: 'www.2nd.com',
                        uri: 'www.2nd.com',
                        meta: {},
                    } as any,
                    assignedChannels: [],
                },
                {
                    store: {
                        id: 2,
                        name: '1st Store',
                        type: IntegrationType.BigCommerce,
                        url: 'www.1st.com',
                        uri: 'www.1st.com',
                        meta: {},
                    } as any,
                    assignedChannels: [],
                },
                {
                    store: {
                        id: 3,
                        name: 'Store #3',
                        type: IntegrationType.Magento2,
                        url: 'www.store3.com',
                        uri: 'www.store3.com',
                        meta: {},
                    } as any,
                    assignedChannels: [],
                },
            ]

            const result = sortStoresByName(specialCharStores, 'asc')

            expect(result[0].store.name).toBe('1st Store')
            expect(result[1].store.name).toBe('2nd Store')
            expect(result[2].store.name).toBe('Store #3')
        })
    })
})
