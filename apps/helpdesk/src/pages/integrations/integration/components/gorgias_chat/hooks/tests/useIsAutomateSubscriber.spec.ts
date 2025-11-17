import { renderHook } from '@testing-library/react'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { GorgiasChatIntegration } from 'models/integration/types/gorgiasChat'

import useIsAutomateSubscriber from '../useIsAutomateSubscriber'

jest.mock('hooks/aiAgent/useAiAgentAccess')

const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
    typeof useAiAgentAccess
>

describe('useIsAutomateSubscriber', () => {
    const createIntegration = (
        shopName?: string | null,
        shopType?: string | null,
    ): GorgiasChatIntegration =>
        ({
            meta: {
                shop_name: shopName,
                shop_type: shopType,
            },
        }) as GorgiasChatIntegration

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return true when all conditions are met', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const integration = createIntegration('my-shop', 'shopify')

        const { result } = renderHook(() =>
            useIsAutomateSubscriber(integration),
        )

        expect(result.current).toBe(true)
    })

    it('should return false when hasAccess is false', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        const integration = createIntegration('my-shop', 'shopify')

        const { result } = renderHook(() =>
            useIsAutomateSubscriber(integration),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when shopName is undefined', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const integration = createIntegration(undefined, 'shopify')

        const { result } = renderHook(() =>
            useIsAutomateSubscriber(integration),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when shopType is null', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const integration = createIntegration('my-shop', null)

        const { result } = renderHook(() =>
            useIsAutomateSubscriber(integration),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when shopType is undefined', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const integration = createIntegration('my-shop', undefined)

        const { result } = renderHook(() =>
            useIsAutomateSubscriber(integration),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when shopName is missing and shopType is present', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const integration = createIntegration(undefined, 'shopify')

        const { result } = renderHook(() =>
            useIsAutomateSubscriber(integration),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when shopType is missing and shopName is present', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const integration = createIntegration('my-shop', null)

        const { result } = renderHook(() =>
            useIsAutomateSubscriber(integration),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when integration.meta is undefined', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const integration = {
            meta: undefined,
        } as unknown as GorgiasChatIntegration

        const { result } = renderHook(() =>
            useIsAutomateSubscriber(integration),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when all conditions are missing', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        const integration = createIntegration(undefined, undefined)

        const { result } = renderHook(() =>
            useIsAutomateSubscriber(integration),
        )

        expect(result.current).toBe(false)
    })

    it('should pass shopName to useAiAgentAccess', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const integration = createIntegration('test-shop', 'shopify')

        renderHook(() => useIsAutomateSubscriber(integration))

        expect(mockUseAiAgentAccess).toHaveBeenCalledWith('test-shop')
    })

    it('should pass undefined to useAiAgentAccess when shopName is missing', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        const integration = createIntegration(undefined, 'shopify')

        renderHook(() => useIsAutomateSubscriber(integration))

        expect(mockUseAiAgentAccess).toHaveBeenCalledWith(undefined)
    })
})
