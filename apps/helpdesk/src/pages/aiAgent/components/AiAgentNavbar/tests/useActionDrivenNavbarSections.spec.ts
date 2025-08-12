import { useLocalStorage } from '@repo/hooks'
import { act, assumeMock, renderHook } from '@repo/testing'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { useActionDrivenNavbarSections } from '../useActionDrivenNavbarSections'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useHistory: jest.fn(),
    useLocation: jest.fn(),
}))
const mockUseParams = assumeMock(useParams)
const mockUseHistory = assumeMock(useHistory)
const mockUseLocation = assumeMock(useLocation)

jest.mock('@repo/hooks', () => ({
    useLocalStorage: jest.fn(),
}))
const mockUseLocalStorage = assumeMock(useLocalStorage)

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
const mockUseStoreActivations = assumeMock(useStoreActivations)

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)

describe('useActionDrivenNavbarSections', () => {
    const mockPush = jest.fn()
    const mockReplace = jest.fn()
    const mockSetExpandedSections = jest.fn()

    const mockStoreIntegrations = [
        {
            id: 1,
            name: 'teststore1',
            type: 'shopify',
            meta: {
                shop_name: 'teststore1',
            },
        },
        {
            id: 2,
            name: 'teststore2',
            type: 'shopify',
            meta: {
                shop_name: 'teststore2',
            },
        },
    ]

    const mockStoreActivations = {
        teststore1: {
            support: {
                chat: { enabled: true },
                email: { enabled: false },
            },
            sales: { enabled: false },
            configuration: {
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: '2024-01-01',
            },
        },
        teststore2: {
            support: {
                chat: { enabled: false },
                email: { enabled: true },
            },
            sales: { enabled: true },
            configuration: {
                chatChannelDeactivatedDatetime: '2024-01-01',
                emailChannelDeactivatedDatetime: null,
            },
        },
    }

    const mockNavigationItems = [
        {
            route: '/app/ai-agent/shopify/teststore1/analyze',
            title: 'Analyze',
        },
        {
            route: '/app/ai-agent/shopify/teststore1/train',
            title: 'Train',
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()

        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/app/ai-agent/shopify/teststore1/analyze',
            },
            writable: true,
        })

        mockUseParams.mockReturnValue({
            shopName: 'teststore1',
            shopType: 'shopify',
        })

        mockUseLocation.mockReturnValue({
            pathname: '/app/ai-agent/shopify/teststore1/analyze',
            search: '',
            hash: '',
            state: null,
            key: 'test',
        })

        mockUseHistory.mockReturnValue({
            push: mockPush,
            length: 1,
            action: 'PUSH',
            location: {
                pathname: '/app/ai-agent/shopify/teststore1/analyze',
                search: '',
                hash: '',
                state: null,
            },
            replace: mockReplace,
            go: jest.fn(),
            goBack: jest.fn(),
            goForward: jest.fn(),
            block: jest.fn(),
            listen: jest.fn(),
            createHref: jest.fn(),
        } as any)

        mockUseLocalStorage.mockReturnValue([
            ['analyze', 'train', 'test', 'deploy', 'settings'],
            mockSetExpandedSections,
            jest.fn(),
        ] as any)

        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return mockStoreIntegrations
            }
            return []
        })

        mockUseStoreActivations.mockReturnValue({
            storeActivations: mockStoreActivations as any,
            progressPercentage: 0,
            isFetchLoading: false,
            isSaveLoading: false,
            changeSales: jest.fn(),
            changeSupport: jest.fn(),
            changeChannel: jest.fn(),
            refreshStoreActivations: jest.fn(),
            syncAllStoreActivations: jest.fn(),
            canRefresh: true,
            activation: jest.fn(),
        } as any)

        mockUseAiAgentNavigation.mockReturnValue({
            navigationItems: mockNavigationItems,
            routes: {} as any,
        } as any)
    })

    describe('store selection', () => {
        it('should initialize with current store from URL params', () => {
            const { result } = renderHook(() => useActionDrivenNavbarSections())

            expect(result.current.selectedStore).toBe('teststore1')
            expect(result.current.selectedStoreIntegration).toEqual(
                mockStoreIntegrations[0],
            )
        })

        it('should use store from URL when params are not available', () => {
            mockUseParams.mockReturnValue({})
            Object.defineProperty(window, 'location', {
                value: {
                    pathname: '/app/ai-agent/shopify/teststore2/train',
                },
                writable: true,
            })

            const { result } = renderHook(() => useActionDrivenNavbarSections())

            expect(result.current.selectedStore).toBe('teststore2')
        })

        it('should redirect to first store overview when no store in params', () => {
            Object.defineProperty(window, 'location', {
                value: {
                    pathname: '/app/ai-agent',
                },
                writable: true,
                configurable: true,
            })
            mockUseParams.mockReturnValue({})
            mockUseLocation.mockReturnValue({
                pathname: '/app/ai-agent',
                search: '',
                hash: '',
                state: null,
                key: 'test',
            })

            renderHook(() => useActionDrivenNavbarSections())

            expect(mockReplace).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/teststore1/overview',
            )
        })

        it('should not redirect when store is already in params', () => {
            mockUseParams.mockReturnValue({
                shopName: 'teststore1',
                shopType: 'shopify',
            })

            renderHook(() => useActionDrivenNavbarSections())

            expect(mockReplace).not.toHaveBeenCalled()
        })

        it('should not redirect when no stores are available', () => {
            mockUseParams.mockReturnValue({})
            mockUseLocation.mockReturnValue({
                pathname: '/app/ai-agent',
                search: '',
                hash: '',
                state: null,
                key: 'test',
            })
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getShopifyIntegrationsSortedByName) {
                    return []
                }
                return []
            })

            renderHook(() => useActionDrivenNavbarSections())

            expect(mockReplace).not.toHaveBeenCalled()
        })

        it('should handle store selection and navigation', () => {
            const { result } = renderHook(() => useActionDrivenNavbarSections())

            act(() => {
                result.current.handleStoreSelect('teststore2')
            })

            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/teststore2/analyze',
            )
            expect(mockSetExpandedSections).toHaveBeenCalledWith([
                'analyze',
                'train',
                'test',
                'deploy',
                'settings',
            ])
        })
    })

    describe('store activation status', () => {
        it('should return true when store has active chat channel', () => {
            const { result } = renderHook(() => useActionDrivenNavbarSections())

            const status = result.current.getStoreActivationStatus('teststore1')
            expect(status).toBe(true)
        })

        it('should return true when store has active email or sales channel', () => {
            const { result } = renderHook(() => useActionDrivenNavbarSections())

            const status = result.current.getStoreActivationStatus('teststore2')
            expect(status).toBe(true)
        })

        it('should return false when store has no active channels', () => {
            const { result } = renderHook(() => useActionDrivenNavbarSections())

            const status =
                result.current.getStoreActivationStatus('unknownstore')
            expect(status).toBe(false)
        })
    })

    describe('channel status', () => {
        it('should return true when chat channel is enabled', () => {
            const { result } = renderHook(() => useActionDrivenNavbarSections())

            const status = result.current.getChannelStatus('chat')
            expect(status).toBe(true)
        })

        it('should return false when chat channel is disabled', () => {
            mockUseParams.mockReturnValue({
                shopName: 'teststore2',
                shopType: 'shopify',
            })

            const { result } = renderHook(() => useActionDrivenNavbarSections())

            const status = result.current.getChannelStatus('chat')
            expect(status).toBe(false)
        })

        it('should return true when email channel is enabled', () => {
            mockUseParams.mockReturnValue({
                shopName: 'teststore2',
                shopType: 'shopify',
            })

            const { result } = renderHook(() => useActionDrivenNavbarSections())

            const status = result.current.getChannelStatus('email')
            expect(status).toBe(true)
        })

        it('should return false when no store is selected', () => {
            mockUseParams.mockReturnValue({})
            mockUseLocation.mockReturnValue({
                pathname: '/app/ai-agent',
                search: '',
                hash: '',
                state: null,
                key: 'test',
            })
            Object.defineProperty(window, 'location', {
                value: {
                    pathname: '/app/ai-agent',
                },
                writable: true,
            })
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {} as any,
                progressPercentage: 0,
                isFetchLoading: false,
                isSaveLoading: false,
                changeSales: jest.fn(),
                changeSupport: jest.fn(),
                changeChannel: jest.fn(),
                refreshStoreActivations: jest.fn(),
                syncAllStoreActivations: jest.fn(),
                canRefresh: true,
                activation: jest.fn(),
            } as any)

            const { result } = renderHook(() => useActionDrivenNavbarSections())

            const status = result.current.getChannelStatus('chat')
            expect(status).toBe(false)
        })
    })

    describe('expanded sections', () => {
        it('should initialize with all sections expanded', () => {
            const { result } = renderHook(() => useActionDrivenNavbarSections())

            expect(result.current.expandedSections).toEqual([
                'analyze',
                'train',
                'test',
                'deploy',
                'settings',
            ])
        })

        it('should handle expanded sections change', () => {
            const { result } = renderHook(() => useActionDrivenNavbarSections())

            const newSections = ['analyze', 'train']
            act(() => {
                result.current.handleExpandedSectionsChange(newSections)
            })

            expect(mockSetExpandedSections).toHaveBeenCalledWith(newSections)
        })
    })

    describe('navigation items', () => {
        it('should fetch navigation items for selected store', () => {
            renderHook(() => useActionDrivenNavbarSections())

            expect(mockUseAiAgentNavigation).toHaveBeenCalledWith({
                shopName: 'teststore1',
            })
        })

        it('should return navigation items from hook', () => {
            const { result } = renderHook(() => useActionDrivenNavbarSections())

            expect(result.current.navigationItems).toEqual(mockNavigationItems)
        })
    })

    describe('URL path extraction', () => {
        it('should extract rest of path correctly for navigation', () => {
            Object.defineProperty(window, 'location', {
                value: {
                    pathname:
                        '/app/ai-agent/shopify/teststore1/train/knowledge',
                },
                writable: true,
            })

            const { result } = renderHook(() => useActionDrivenNavbarSections())

            act(() => {
                result.current.handleStoreSelect('teststore2')
            })

            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/teststore2/train/knowledge',
            )
        })

        it('should default to overview when no specific path', () => {
            mockUseParams.mockReturnValue({})
            Object.defineProperty(window, 'location', {
                value: {
                    pathname: '/app/ai-agent',
                },
                writable: true,
            })
            mockUseLocation.mockReturnValue({
                pathname: '/app/ai-agent',
                search: '',
                hash: '',
                state: null,
                key: 'test',
            })

            const { result } = renderHook(() => useActionDrivenNavbarSections())

            act(() => {
                result.current.handleStoreSelect('teststore2')
            })

            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/teststore2/overview',
            )
        })
    })
})
