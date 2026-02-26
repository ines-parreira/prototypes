import type { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'

import { NavigationProvider } from '../../components/NavigationProvider'
import { TicketInfobarTab } from '../../constants'
import { useTicketInfobarNavigation } from '../useTicketInfobarNavigation'

const wrapper = ({ children }: { children: ReactNode }) => (
    <NavigationProvider>{children}</NavigationProvider>
)

describe('useTicketInfobarNavigation', () => {
    it('should return the context when wrapped in a provider', () => {
        const { result } = renderHook(() => useTicketInfobarNavigation(), {
            wrapper,
        })

        expect(result.current).toEqual({
            activeTab: TicketInfobarTab.Customer,
            isExpanded: true,
            isEditShopifyFieldsOpen: false,
            onChangeTab: expect.any(Function),
            onToggle: expect.any(Function),
            onToggleEditShopifyFields: expect.any(Function),
        })
    })

    it('should update the active tab when calling `onChangeTab`', () => {
        const { result } = renderHook(() => useTicketInfobarNavigation(), {
            wrapper,
        })

        expect(result.current.activeTab).toEqual(TicketInfobarTab.Customer)

        act(() => {
            result.current.onChangeTab(TicketInfobarTab.AIFeedback)
        })

        expect(result.current.activeTab).toEqual(TicketInfobarTab.AIFeedback)
    })

    it('should set shopifyIntegrationId when passed via onChangeTab options', () => {
        const { result } = renderHook(() => useTicketInfobarNavigation(), {
            wrapper,
        })

        act(() => {
            result.current.onChangeTab(TicketInfobarTab.Shopify, {
                shopifyIntegrationId: 42,
            })
        })

        expect(result.current.activeTab).toEqual(TicketInfobarTab.Shopify)
        expect(result.current.shopifyIntegrationId).toEqual(42)
    })

    it('should update `isExpanded` when calling `onToggle`', () => {
        const { result } = renderHook(() => useTicketInfobarNavigation(), {
            wrapper,
        })

        expect(result.current.isExpanded).toEqual(true)

        act(() => {
            result.current.onToggle()
        })

        expect(result.current.isExpanded).toEqual(false)
    })
})
