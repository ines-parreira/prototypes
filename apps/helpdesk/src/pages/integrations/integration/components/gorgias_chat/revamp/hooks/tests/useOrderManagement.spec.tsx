import type React from 'react'

import { act, renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { IntegrationType } from 'models/integration/types'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { mockStore } from 'utils/testing'

import { useOrderManagement } from '../useOrderManagement'

const mockHandleChatApplicationAutomationSettingsUpdate = jest.fn()

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration', () =>
    jest.fn(),
)

jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings', () =>
    jest.fn(),
)

const mockedUseSelfServiceConfiguration =
    useSelfServiceConfiguration as jest.MockedFunction<
        typeof useSelfServiceConfiguration
    >

const mockedUseApplicationsAutomationSettings =
    useApplicationsAutomationSettings as jest.MockedFunction<
        typeof useApplicationsAutomationSettings
    >

describe('useOrderManagement', () => {
    const defaultIntegration = fromJS({
        id: 1,
        meta: {
            app_id: 'test-app-id',
            shop_name: 'test-shop',
            shop_type: 'shopify',
        },
    })

    const store = mockStore({})

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    )

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: {},
            storeIntegration: { type: IntegrationType.Shopify, id: 1 },
            isFetchPending: false,
        } as any)

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
        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.enabledInSettings).toBe(true)
    })

    it('should return enabledInSettings as false when store is not connected', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: {},
            storeIntegration: null,
            isFetchPending: false,
        } as any)

        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.enabledInSettings).toBe(false)
    })

    it('should return isOrderManagementEnabled based on automation settings', () => {
        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

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

        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isOrderManagementEnabled).toBe(false)
    })

    it('should return isOrderManagementEnabled as false when store is not connected', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: {},
            storeIntegration: null,
            isFetchPending: false,
        } as any)

        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isOrderManagementEnabled).toBe(false)
    })

    it('should return isDisabled as true when store is not connected', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: {},
            storeIntegration: null,
            isFetchPending: false,
        } as any)

        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isDisabled).toBe(true)
    })

    it('should return isDisabled as false when store is connected', () => {
        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isDisabled).toBe(false)
    })

    it('should return isLoading as true when self service configuration is loading', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: null,
            storeIntegration: null,
            isFetchPending: true,
        } as any)

        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when automation settings are loading', () => {
        mockedUseApplicationsAutomationSettings.mockReturnValue({
            applicationsAutomationSettings: {},
            isFetchPending: true,
            handleChatApplicationAutomationSettingsUpdate:
                mockHandleChatApplicationAutomationSettingsUpdate,
        } as any)

        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when all data is loaded', () => {
        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return showStoreRequired as true when store is not connected', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: {},
            storeIntegration: null,
            isFetchPending: false,
        } as any)

        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.showStoreRequired).toBe(true)
    })

    it('should return showStoreRequired as false when store is connected', () => {
        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.showStoreRequired).toBe(false)
    })

    it('should return orderManagementUrl based on shopType and shopName', () => {
        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.orderManagementUrl).toBe(
            '/app/settings/order-management/shopify/test-shop',
        )
    })

    it('should return empty orderManagementUrl when shopType or shopName is missing', () => {
        const integrationWithoutShopInfo = fromJS({
            id: 1,
            meta: {
                app_id: 'test-app-id',
            },
        })

        const { result } = renderHook(
            () =>
                useOrderManagement({
                    integration: integrationWithoutShopInfo,
                }),
            { wrapper },
        )

        expect(result.current.orderManagementUrl).toBe('')
    })

    it('should call handleChatApplicationAutomationSettingsUpdate when handleToggle is called', () => {
        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

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
        const { result } = renderHook(
            () => useOrderManagement({ integration: defaultIntegration }),
            { wrapper },
        )

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

    it('should not call handleChatApplicationAutomationSettingsUpdate when appId is missing', () => {
        const integrationWithoutAppId = fromJS({
            id: 1,
            meta: {
                shop_name: 'test-shop',
                shop_type: 'shopify',
            },
        })

        const { result } = renderHook(
            () =>
                useOrderManagement({
                    integration: integrationWithoutAppId,
                }),
            { wrapper },
        )

        act(() => {
            result.current.handleToggle(true)
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).not.toHaveBeenCalled()
    })
})
