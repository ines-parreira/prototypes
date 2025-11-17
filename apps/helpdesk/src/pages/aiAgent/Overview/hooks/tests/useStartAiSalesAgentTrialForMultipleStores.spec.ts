import { assumeMock } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { upsertStoreConfiguration } from 'models/aiAgent/resources/configuration'
import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

import { useStartAiSalesAgentTrialForMultipleStores } from '../useStartAiSalesAgentTrialForMultipleStores'

jest.mock('models/aiAgent/resources/configuration')
const upsertStoreConfigurationMock = assumeMock(upsertStoreConfiguration)

describe('useStartAiSalesAgentTrialForMultipleStores', () => {
    const storeActivations = {
        store1: {
            configuration: {
                storeName: 'store1',
            },
            support: {
                chat: {
                    isIntegrationMissing: false,
                },
            },
        },
        store2: {
            configuration: {
                storeName: 'store2',
            },
            support: {
                chat: {
                    isIntegrationMissing: true,
                },
            },
        },
    } as unknown as Record<string, StoreActivation>

    it('should call upsertStoreConfiguration for eligible stores', async () => {
        upsertStoreConfigurationMock.mockResolvedValue({
            data: {},
        } as any)

        const { result } = renderHookWithStoreAndQueryClientProvider(
            useStartAiSalesAgentTrialForMultipleStores,
        )

        result.current.mutate({
            accountDomain: 'demo-account',
            storeActivations,
        })

        await waitFor(() => {
            expect(upsertStoreConfigurationMock).toHaveBeenCalledTimes(1)
            expect(upsertStoreConfigurationMock).toHaveBeenCalledWith(
                'demo-account',
                expect.objectContaining({
                    storeName: 'store1',
                    scopes: ['support', 'sales'],
                    salesPersuasionLevel: 'educational',
                    salesDiscountStrategyLevel: 'none',
                }),
            )
        })
    })

    it('should not call upsertStoreConfiguration if all stores are ineligible', async () => {
        const ineligibleStores = {
            store1: {
                configuration: {
                    storeName: 'store1',
                },
                support: {
                    chat: {
                        isIntegrationMissing: true,
                    },
                },
            },
        } as unknown as Record<string, StoreActivation>

        const { result } = renderHookWithStoreAndQueryClientProvider(
            useStartAiSalesAgentTrialForMultipleStores,
        )

        result.current.mutate({
            accountDomain: 'demo-account',
            storeActivations: ineligibleStores,
        })

        await waitFor(() => {
            expect(upsertStoreConfigurationMock).not.toHaveBeenCalled()
        })
    })

    it('should handle mutation failure', async () => {
        upsertStoreConfigurationMock.mockRejectedValue(new Error('test-error'))

        const { result } = renderHookWithStoreAndQueryClientProvider(
            useStartAiSalesAgentTrialForMultipleStores,
        )

        result.current.mutate({
            accountDomain: 'demo-account',
            storeActivations,
        })

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
            expect(upsertStoreConfigurationMock).toHaveBeenCalledTimes(1)
        })
    })
})
