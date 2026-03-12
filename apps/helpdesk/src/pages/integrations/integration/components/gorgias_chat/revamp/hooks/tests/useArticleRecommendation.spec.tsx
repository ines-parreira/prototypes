import type React from 'react'

import { act, renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { useGetHelpCenter } from 'models/helpCenter/queries'
import { IntegrationType } from 'models/integration/types'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import { mockStore } from 'utils/testing'

import { useArticleRecommendation } from '../useArticleRecommendation'

const mockHandleChatApplicationAutomationSettingsUpdate = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
    () => ({
        useIsArticleRecommendationsEnabledWhileSunset: jest.fn(),
    }),
)

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration', () =>
    jest.fn(),
)

jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings', () =>
    jest.fn(),
)

jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenter: jest.fn(),
}))

const mockedUseIsArticleRecommendationsEnabledWhileSunset =
    useIsArticleRecommendationsEnabledWhileSunset as jest.MockedFunction<
        typeof useIsArticleRecommendationsEnabledWhileSunset
    >

const mockedUseSelfServiceConfiguration =
    useSelfServiceConfiguration as jest.MockedFunction<
        typeof useSelfServiceConfiguration
    >

const mockedUseApplicationsAutomationSettings =
    useApplicationsAutomationSettings as jest.MockedFunction<
        typeof useApplicationsAutomationSettings
    >

const mockedUseGetHelpCenter = useGetHelpCenter as jest.MockedFunction<
    typeof useGetHelpCenter
>

describe('useArticleRecommendation', () => {
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

        mockedUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInSettings: true,
            enabledInStatistics: true,
        })

        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: {
                articleRecommendationHelpCenterId: 123,
            },
            storeIntegration: { type: IntegrationType.Shopify, id: 1 },
            isFetchPending: false,
        } as any)

        mockedUseApplicationsAutomationSettings.mockReturnValue({
            applicationsAutomationSettings: {
                'test-app-id': {
                    articleRecommendation: { enabled: true },
                    orderManagement: { enabled: false },
                    workflows: { enabled: false },
                },
            },
            isFetchPending: false,
            handleChatApplicationAutomationSettingsUpdate:
                mockHandleChatApplicationAutomationSettingsUpdate,
        } as any)

        mockedUseGetHelpCenter.mockReturnValue({
            data: { deleted_datetime: null },
            isError: false,
        } as any)
    })

    it('should return enabledInSettings from useIsArticleRecommendationsEnabledWhileSunset', () => {
        const { result } = renderHook(
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.enabledInSettings).toBe(true)
    })

    it('should return enabledInSettings as false when sunset hook returns false', () => {
        mockedUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInSettings: false,
            enabledInStatistics: false,
        })

        const { result } = renderHook(
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.enabledInSettings).toBe(false)
    })

    it('should return isArticleRecommendationEnabled based on automation settings', () => {
        const { result } = renderHook(
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isArticleRecommendationEnabled).toBe(true)
    })

    it('should return isArticleRecommendationEnabled as false when automation settings say disabled', () => {
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
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isArticleRecommendationEnabled).toBe(false)
    })

    it('should return isArticleRecommendationEnabled as false for Shopify when sunset feature flag disables it', () => {
        mockedUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInSettings: false,
            enabledInStatistics: true,
        })

        const { result } = renderHook(
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isArticleRecommendationEnabled).toBe(false)
    })

    it('should return isDisabled as true when help center is deleted', () => {
        mockedUseGetHelpCenter.mockReturnValue({
            data: { deleted_datetime: '2024-01-01' },
            isError: false,
        } as any)

        const { result } = renderHook(
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isDisabled).toBe(true)
    })

    it('should return isDisabled as true when help center fetch errors', () => {
        mockedUseGetHelpCenter.mockReturnValue({
            data: null,
            isError: true,
        } as any)

        const { result } = renderHook(
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isDisabled).toBe(true)
    })

    it('should return isDisabled as true when no help center is configured', () => {
        mockedUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: {
                articleRecommendationHelpCenterId: null,
            },
            storeIntegration: { type: IntegrationType.Shopify, id: 1 },
            isFetchPending: false,
        } as any)

        const { result } = renderHook(
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isDisabled).toBe(true)
    })

    it('should return isDisabled as false when help center is active', () => {
        const { result } = renderHook(
            () => useArticleRecommendation({ integration: defaultIntegration }),
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
            () => useArticleRecommendation({ integration: defaultIntegration }),
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
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when all data is loaded', () => {
        const { result } = renderHook(
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return showHelpCenterRequired matching isDisabled', () => {
        mockedUseGetHelpCenter.mockReturnValue({
            data: { deleted_datetime: '2024-01-01' },
            isError: false,
        } as any)

        const { result } = renderHook(
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        expect(result.current.showHelpCenterRequired).toBe(true)
        expect(result.current.isDisabled).toBe(true)
    })

    it('should call handleChatApplicationAutomationSettingsUpdate when handleToggle is called', () => {
        const { result } = renderHook(
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        act(() => {
            result.current.handleToggle(true)
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                articleRecommendation: { enabled: true },
            }),
            'Article Recommendation enabled',
        )
    })

    it('should call handleChatApplicationAutomationSettingsUpdate with disabled message when toggling off', () => {
        const { result } = renderHook(
            () => useArticleRecommendation({ integration: defaultIntegration }),
            { wrapper },
        )

        act(() => {
            result.current.handleToggle(false)
        })

        expect(
            mockHandleChatApplicationAutomationSettingsUpdate,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                articleRecommendation: { enabled: false },
            }),
            'Article Recommendation disabled',
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
                useArticleRecommendation({
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
