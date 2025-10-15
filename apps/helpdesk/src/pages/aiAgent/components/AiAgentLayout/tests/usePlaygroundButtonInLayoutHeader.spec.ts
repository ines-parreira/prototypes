import { assumeMock, renderHook } from '@repo/testing'
import { useLocation, useParams } from 'react-router'

import useAppSelector from 'hooks/useAppSelector'
import { useAiAgentOverviewModeEnabled } from 'pages/aiAgent/Overview/hooks/useAiAgentOverviewModeEnabled'

import { useDisplayPlaygroundButtonInLayoutHeader } from '../usePlaygroundButtonInLayoutHeader'

jest.mock('react-router', () => ({
    useLocation: jest.fn(),
    useParams: jest.fn(),
}))
const mockUseLocation = assumeMock(useLocation) as jest.Mock
const mockUseParams = assumeMock(useParams) as jest.Mock

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('pages/aiAgent/Overview/hooks/useAiAgentOverviewModeEnabled')
const mockUseAiAgentOverviewModeEnabled = assumeMock(
    useAiAgentOverviewModeEnabled,
)

describe('useDisplayPlaygroundButtonInLayoutHeader', () => {
    const mockShopifyIntegration = {
        id: 1,
        name: 'my-shop',
        status: 'active',
    }

    beforeEach(() => {
        mockUseParams.mockReturnValue({
            shopName: 'my-shop',
            shopType: 'shopify',
        })
        mockUseLocation.mockReturnValue({
            pathname: '/app/ai-agent/shopify/my-shop/overview',
        })
        mockUseAppSelector.mockImplementation((selector: any) => {
            if (typeof selector === 'function') {
                return {
                    toJS: () => mockShopifyIntegration,
                }
            }
            return selector
        })
        mockUseAiAgentOverviewModeEnabled.mockReturnValue({
            isAiAgentLiveModeEnabled: true,
            isLoading: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('when on overview page', () => {
        beforeEach(() => {
            mockUseLocation.mockReturnValue({
                pathname: '/app/ai-agent/shopify/my-shop/overview',
                search: '',
                state: undefined,
                hash: '',
            } as any)
        })

        it('should return true when AI agent live mode is enabled', () => {
            mockUseAiAgentOverviewModeEnabled.mockReturnValue({
                isAiAgentLiveModeEnabled: true,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useDisplayPlaygroundButtonInLayoutHeader({
                    shopName: 'my-shop',
                    shopType: 'shopify',
                }),
            )

            expect(result.current).toBe(true)
        })

        it('should return false when AI agent live mode is disabled', () => {
            mockUseAiAgentOverviewModeEnabled.mockReturnValue({
                isAiAgentLiveModeEnabled: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useDisplayPlaygroundButtonInLayoutHeader({
                    shopName: 'my-shop',
                    shopType: 'shopify',
                }),
            )

            expect(result.current).toBe(false)
        })

        it('should return null when AI agent live mode is null (loading)', () => {
            mockUseAiAgentOverviewModeEnabled.mockReturnValue({
                isAiAgentLiveModeEnabled: null,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useDisplayPlaygroundButtonInLayoutHeader({
                    shopName: 'my-shop',
                    shopType: 'shopify',
                }),
            )

            expect(result.current).toBeNull()
        })
    })

    describe('when not on overview page', () => {
        it('should return true when store onboarding is completed and not on test page', () => {
            mockUseLocation.mockReturnValue({
                pathname: '/app/ai-agent/shopify/my-shop/settings',
                search: '',
                state: undefined,
                hash: '',
            } as any)

            const { result } = renderHook(() =>
                useDisplayPlaygroundButtonInLayoutHeader({
                    shopName: 'my-shop',
                    shopType: 'shopify',
                }),
            )

            expect(result.current).toBe(true)
        })

        it('should return false when on test page even if store onboarding is completed', () => {
            mockUseLocation.mockReturnValue({
                pathname: '/app/ai-agent/shopify/my-shop/test',
                search: '',
                state: undefined,
                hash: '',
            } as any)

            const { result } = renderHook(() =>
                useDisplayPlaygroundButtonInLayoutHeader({
                    shopName: 'my-shop',
                    shopType: 'shopify',
                }),
            )

            expect(result.current).toBe(false)
        })

        it('should return false when store onboarding is not completed', () => {
            mockUseLocation.mockReturnValue({
                pathname: '/app/ai-agent/shopify/my-shop/settings',
                search: '',
                state: undefined,
                hash: '',
            } as any)
            mockUseAppSelector.mockImplementation((selector: any) => {
                if (typeof selector === 'function') {
                    return {
                        toJS: () => ({}),
                    }
                }
                return selector
            })

            const { result } = renderHook(() =>
                useDisplayPlaygroundButtonInLayoutHeader({
                    shopName: 'my-shop',
                    shopType: 'shopify',
                }),
            )

            expect(result.current).toBe(false)
        })

        it('should return false when shopName is not provided', () => {
            mockUseLocation.mockReturnValue({
                pathname: '/app/ai-agent/shopify/settings',
                search: '',
                state: undefined,
                hash: '',
            } as any)
            mockUseParams.mockReturnValue({
                shopName: '',
                shopType: 'shopify',
            })

            const { result } = renderHook(() =>
                useDisplayPlaygroundButtonInLayoutHeader({
                    shopName: '',
                    shopType: 'shopify',
                }),
            )

            expect(result.current).toBe(false)
        })

        it('should return false when on test subpage', () => {
            mockUseLocation.mockReturnValue({
                pathname: '/app/ai-agent/shopify/my-shop/test/results',
                search: '',
                state: undefined,
                hash: '',
            } as any)

            const { result } = renderHook(() =>
                useDisplayPlaygroundButtonInLayoutHeader({
                    shopName: 'my-shop',
                    shopType: 'shopify',
                }),
            )

            expect(result.current).toBe(false)
        })

        it('should return false when on opportunities page', () => {
            mockUseLocation.mockReturnValue({
                pathname: '/app/ai-agent/shopify/my-shop/opportunities',
                search: '',
                state: undefined,
                hash: '',
            } as any)

            const { result } = renderHook(() =>
                useDisplayPlaygroundButtonInLayoutHeader({
                    shopName: 'my-shop',
                    shopType: 'shopify',
                }),
            )

            expect(result.current).toBe(false)
        })
    })
})
