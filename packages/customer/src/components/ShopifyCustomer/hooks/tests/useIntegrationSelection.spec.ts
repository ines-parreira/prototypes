import { renderHook } from '@repo/testing/vitest'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { vi } from 'vitest'

import {
    mockIntegration,
    mockListIntegrationsHandler,
} from '@gorgias/helpdesk-mocks'

import { server } from '../../../../tests/server'
import { useIntegrationSelection } from '../useIntegrationSelection'

const integrationA = mockIntegration({ id: 1, type: 'shopify' })
const integrationB = mockIntegration({ id: 2, type: 'shopify' })

const mockListIntegrations = mockListIntegrationsHandler(async () =>
    HttpResponse.json({
        data: [integrationA, integrationB],
        meta: { next_cursor: null, prev_cursor: null },
        object: 'list',
        uri: '/api/integrations',
    }),
)

describe('useIntegrationSelection', () => {
    beforeEach(() => {
        server.use(mockListIntegrations.handler)
    })

    it('selects the first filtered integration on initial load', async () => {
        const onStoreChange = vi.fn()

        const { result } = renderHook(() =>
            useIntegrationSelection({
                associatedShopifyCustomerIds: new Set([1, 2]),
                externalIdMap: new Map([
                    [1, 'ext-1'],
                    [2, 'ext-2'],
                ]),
                onStoreChange,
            }),
        )

        await waitFor(() => {
            expect(result.current.selectedIntegration).toMatchObject({ id: 1 })
        })
        expect(onStoreChange).toHaveBeenCalledWith(1)
    })

    it('re-selects the first valid integration when the ticket changes and the previous selection is no longer associated', async () => {
        const onStoreChange = vi.fn()

        const { result, rerender } = renderHook(
            ({
                associatedShopifyCustomerIds,
                externalIdMap,
            }: {
                associatedShopifyCustomerIds: Set<number>
                externalIdMap: Map<number, string>
            }) =>
                useIntegrationSelection({
                    associatedShopifyCustomerIds,
                    externalIdMap,
                    onStoreChange,
                }),
            {
                initialProps: {
                    associatedShopifyCustomerIds: new Set([1]),
                    externalIdMap: new Map([[1, 'customer-1-ext-id']]),
                },
            },
        )

        await waitFor(() => {
            expect(result.current.selectedIntegration).toMatchObject({ id: 1 })
        })

        onStoreChange.mockClear()

        rerender({
            associatedShopifyCustomerIds: new Set([2]),
            externalIdMap: new Map([[2, 'customer-2-ext-id']]),
        })

        await waitFor(() => {
            expect(result.current.selectedIntegration).toMatchObject({ id: 2 })
        })
        expect(onStoreChange).toHaveBeenCalledWith(2)
    })

    it('keeps the current selection when it is still valid after ticket navigation', async () => {
        const onStoreChange = vi.fn()

        const { result, rerender } = renderHook(
            ({
                associatedShopifyCustomerIds,
                externalIdMap,
            }: {
                associatedShopifyCustomerIds: Set<number>
                externalIdMap: Map<number, string>
            }) =>
                useIntegrationSelection({
                    associatedShopifyCustomerIds,
                    externalIdMap,
                    onStoreChange,
                }),
            {
                initialProps: {
                    associatedShopifyCustomerIds: new Set([1]),
                    externalIdMap: new Map([[1, 'customer-1-ext-id']]),
                },
            },
        )

        await waitFor(() => {
            expect(result.current.selectedIntegration).toMatchObject({ id: 1 })
        })

        onStoreChange.mockClear()

        rerender({
            associatedShopifyCustomerIds: new Set([1]),
            externalIdMap: new Map([[1, 'customer-3-ext-id']]),
        })

        expect(result.current.selectedIntegration).toMatchObject({ id: 1 })
        expect(onStoreChange).not.toHaveBeenCalled()
    })

    it('preserves manual store selection within the same ticket', async () => {
        const { result } = renderHook(() =>
            useIntegrationSelection({
                associatedShopifyCustomerIds: new Set([1, 2]),
                externalIdMap: new Map([
                    [1, 'ext-1'],
                    [2, 'ext-2'],
                ]),
            }),
        )

        await waitFor(() => {
            expect(result.current.selectedIntegration).toMatchObject({ id: 1 })
        })

        act(() => {
            result.current.handleStoreChange(integrationB)
        })

        expect(result.current.selectedIntegration).toMatchObject({ id: 2 })
    })

    it('returns no selection and empty filtered list when no integrations are associated', async () => {
        const { result } = renderHook(() =>
            useIntegrationSelection({
                associatedShopifyCustomerIds: new Set(),
                externalIdMap: new Map(),
            }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.selectedIntegration).toBeUndefined()
        expect(result.current.filteredIntegrations).toHaveLength(0)
    })
})
