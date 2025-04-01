import { renderHook } from '@testing-library/react-hooks'

import { useBillingState } from 'models/billing/queries'
import { useGetOnboardingDataByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingDataByShopName'
import { useFetchChatIntegrationsStatusData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData'
import { useFetchEmailIntegrationsData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchEmailIntegrationsData'
import { useFetchFaqHelpCentersData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchFaqHelpCentersData'

import { useIsGoLiveDisabled } from '../useIsGoLiveDisabled'

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingDataByShopName')
jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData',
)
jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchEmailIntegrationsData',
)
jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchFaqHelpCentersData',
)
jest.mock('models/billing/queries')

describe('useIsGoLiveDisabled', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return { isLoading: true, isDisabled: true } when any API is loading', () => {
        ;(useGetOnboardingDataByShopName as jest.Mock).mockReturnValue({
            data: null,
            isLoading: true,
        })
        ;(useFetchChatIntegrationsStatusData as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false,
        })
        ;(useFetchEmailIntegrationsData as jest.Mock).mockReturnValue({
            data: [],
        })
        ;(useFetchFaqHelpCentersData as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useBillingState as jest.Mock).mockReturnValue({
            data: { current_plans: { automate: { generation: 6 } } },
        })

        const { result } = renderHook(() => useIsGoLiveDisabled('testShop'))
        expect(result.current).toEqual({ isLoading: true, isDisabled: true })
    })

    it('should return isDisabled: true when chat integrations are not installed properly', () => {
        ;(useGetOnboardingDataByShopName as jest.Mock).mockReturnValue({
            data: { chatIntegrationIds: [1], emailIntegrationIds: [1] },
            isLoading: false,
        })
        ;(useFetchChatIntegrationsStatusData as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useFetchEmailIntegrationsData as jest.Mock).mockReturnValue({
            data: [{ id: 1, isVerified: true }],
        })
        ;(useFetchFaqHelpCentersData as jest.Mock).mockReturnValue({
            data: ['faq1'],
            isLoading: false,
        })
        ;(useBillingState as jest.Mock).mockReturnValue({
            data: { current_plans: { automate: { generation: 6 } } },
        })

        const { result } = renderHook(() => useIsGoLiveDisabled('testShop'))

        expect(result.current).toEqual({ isLoading: false, isDisabled: true })
    })

    it('should return isDisabled: false when all conditions are met', () => {
        ;(useGetOnboardingDataByShopName as jest.Mock).mockReturnValue({
            data: { chatIntegrationIds: [1], emailIntegrationIds: [2] },
            isLoading: false,
        })
        ;(useFetchChatIntegrationsStatusData as jest.Mock).mockReturnValue({
            data: [1],
            isLoading: false,
        })
        ;(useFetchEmailIntegrationsData as jest.Mock).mockReturnValue({
            data: [{ id: 2, isVerified: true }],
        })
        ;(useFetchFaqHelpCentersData as jest.Mock).mockReturnValue({
            data: ['faq1'],
            isLoading: false,
        })
        ;(useBillingState as jest.Mock).mockReturnValue({
            data: { current_plans: { automate: { generation: 6 } } },
        })

        const { result } = renderHook(() => useIsGoLiveDisabled('testShop'))
        expect(result.current).toEqual({ isLoading: false, isDisabled: false })
    })

    it('should return isDisabled: true if not on new plan', () => {
        ;(useGetOnboardingDataByShopName as jest.Mock).mockReturnValue({
            data: { chatIntegrationIds: [], emailIntegrationIds: [] },
            isLoading: false,
        })
        ;(useFetchChatIntegrationsStatusData as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useFetchEmailIntegrationsData as jest.Mock).mockReturnValue({
            data: [],
        })
        ;(useFetchFaqHelpCentersData as jest.Mock).mockReturnValue({
            data: ['faq'],
            isLoading: false,
        })
        ;(useBillingState as jest.Mock).mockReturnValue({
            data: { current_plans: { automate: { generation: 5 } } },
        })

        const { result } = renderHook(() => useIsGoLiveDisabled('testShop'))
        expect(result.current).toEqual({ isLoading: false, isDisabled: true })
    })

    it('should handle null shopName gracefully', () => {
        ;(useGetOnboardingDataByShopName as jest.Mock).mockReturnValue({
            data: { chatIntegrationIds: [], emailIntegrationIds: [] },
            isLoading: false,
        })
        ;(useFetchChatIntegrationsStatusData as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useFetchEmailIntegrationsData as jest.Mock).mockReturnValue({
            data: [],
        })
        ;(useFetchFaqHelpCentersData as jest.Mock).mockReturnValue({
            data: ['faq'],
            isLoading: false,
        })
        ;(useBillingState as jest.Mock).mockReturnValue({
            data: { current_plans: { automate: { generation: 6 } } },
        })

        const { result } = renderHook(() => useIsGoLiveDisabled(null))

        expect(result.current).toEqual({ isLoading: false, isDisabled: false })
    })
})
