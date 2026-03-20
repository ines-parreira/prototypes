import type React from 'react'

import { act, renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'

import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { mockStore } from 'utils/testing'

import { useOrderManagement } from '../useOrderManagement'

const mockHandleChatApplicationAutomationSettingsUpdate = jest.fn()

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration', () =>
    jest.fn(),
)

jest.mock('pages/automate/common/hooks/useSelfServiceChannels', () => jest.fn())

jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings', () =>
    jest.fn(),
)

const mockedUseSelfServiceConfiguration =
    useSelfServiceConfiguration as jest.MockedFunction<
        typeof useSelfServiceConfiguration
    >

const mockedUseSelfServiceChannels =
    useSelfServiceChannels as jest.MockedFunction<typeof useSelfServiceChannels>

const mockedUseApplicationsAutomationSettings =
    useApplicationsAutomationSettings as jest.MockedFunction<
        typeof useApplicationsAutomationSettings
    >

const defaultParams = { shopName: 'test-shop', shopType: 'shopify' }

const mockChatChannel = {
    type: 'chat',
    value: { meta: { app_id: 'test-app-id' } },
} as any

describe('useOrderManagement', () => {
    const store = mockStore({})

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    )

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: {},
            storeIntegration: { type: 'shopify', id: 1 },
            isFetchPending: false,
        } as any)

        mockedUseSelfServiceChannels.mockReturnValue([mockChatChannel])

        mockedUseApplicationsAutomationSettings.mockReturnValue({
            applicationsAutomationSettings: {
                'test-app-id': {
                    articleRecommendation: { enabled: false },
                    orderManagement: { enabled: true },
                    workflows: { enabled: false },
                },
            },
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate:
                mockHandleChatApplicationAutomationSettingsUpdate,
        } as any)
    })

    it('should return enabledInSettings as true when store is connected', () => {
        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.enabledInSettings).toBe(true)
    })

    it('should return enabledInSettings as false when no store is connected', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: false,
        } as any)

        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.enabledInSettings).toBe(false)
    })

    it('should return isOrderManagementEnabled based on automation settings', () => {
        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.isOrderManagementEnabled).toBe(true)
    })

    it('should return isOrderManagementEnabled as false when automation settings say disabled', () => {
        mockedUseApplicationsAutomationSettings.mockReturnValue({
            applicationsAutomationSettings: {
                'test-app-id': {
                    articleRecommendation: { enabled: false },
                    orderManagement: { enabled: false },
                    workflows: { enabled: false },
                },
            },
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate:
                mockHandleChatApplicationAutomationSettingsUpdate,
        } as any)

        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.isOrderManagementEnabled).toBe(false)
    })

    it('should return isOrderManagementEnabled as false when no chat channel found', () => {
        mockedUseSelfServiceChannels.mockReturnValue([])

        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.isOrderManagementEnabled).toBe(false)
    })

    it('should return isOrderManagementEnabled as false when no store is connected', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: false,
        } as any)

        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.isOrderManagementEnabled).toBe(false)
    })

    it('should return isDisabled as true when no store is connected', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: false,
        } as any)

        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.isDisabled).toBe(true)
    })

    it('should return isDisabled as false when store is connected', () => {
        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.isDisabled).toBe(false)
    })

    it('should return showStoreRequired as true when no store is connected', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: false,
        } as any)

        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.showStoreRequired).toBe(true)
    })

    it('should return showStoreRequired as false when store is connected', () => {
        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.showStoreRequired).toBe(false)
    })

    it('should return the correct orderManagementUrl', () => {
        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.orderManagementUrl).toBe(
            '/app/settings/order-management/shopify/test-shop',
        )
    })

    it('should return isLoading as true when self service configuration is loading', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: true,
        } as any)

        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automation settings are loading', () => {
        mockedUseApplicationsAutomationSettings.mockReturnValue({
            applicationsAutomationSettings: {},
            isFetchPending: true,
            handleChatApplicationAutomationSettingsUpdate:
                mockHandleChatApplicationAutomationSettingsUpdate,
        } as any)

        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when all data is loaded', () => {
        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(false)
    })

    it('should call handleChatApplicationAutomationSettingsUpdate when handleToggle is called with true', () => {
        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        act(() => {
            result.current.handleToggle(true)
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                orderManagement: { enabled: true },
            }),
            'Order Management enabled',
        )
    })

    it('should call handleChatApplicationAutomationSettingsUpdate with disabled message when toggling off', () => {
        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        act(() => {
            result.current.handleToggle(false)
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                orderManagement: { enabled: false },
            }),
            'Order Management disabled',
        )
    })

    it('should not call handleChatApplicationAutomationSettingsUpdate when no chat channel found', () => {
        mockedUseSelfServiceChannels.mockReturnValue([])

        const { result } = renderHook(() => useOrderManagement(defaultParams), {
            wrapper,
        })

        act(() => {
            result.current.handleToggle(true)
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).not.toHaveBeenCalled()
    })
})
