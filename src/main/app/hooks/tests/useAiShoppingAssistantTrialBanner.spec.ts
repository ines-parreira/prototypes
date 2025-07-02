import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'

import { AlertBannerTypes, BannerCategories, ContextBanner } from 'AlertBanners'
import { user } from 'fixtures/users'
import { useAtLeastOneStoreHasActiveTrial } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import {
    useStoreActivations,
    useStoreConfigurations,
} from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getStoresEligibleForTrial } from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'
import { getCurrentAutomatePlan } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useAiShoppingAssistantTrialBanner } from '../useAiShoppingAssistantTrialBanner'

// Mock the new useFlag hook instead of the deprecated useFlags
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const mockUseFlag = jest.requireMock('core/flags').useFlag as jest.Mock

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useLocation: jest.fn(),
}))
jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')

const useAtLeastOneStoreHasActiveTrialMock = assumeMock(
    useAtLeastOneStoreHasActiveTrial,
)

const useLocationMock = assumeMock(useLocation)
jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('pages/aiAgent/utils/aiSalesAgentTrialUtils')
const getStoresEligibleForTrialMock = assumeMock(getStoresEligibleForTrial)

jest.mock('pages/aiAgent/Activation/hooks/useActivateAiAgentTrial')
const useActivateAiAgentTrialMock = assumeMock(useActivateAiAgentTrial)

const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockStoreConfigurations = assumeMock(useStoreConfigurations)
const mockedAddBanner = jest.fn<unknown, [ContextBanner]>()
const mockedRemoveBanner = jest.fn()

jest.mock(
    'AlertBanners',
    () =>
        ({
            ...jest.requireActual('AlertBanners'),
            useBanners: () => ({
                addBanner: mockedAddBanner,
                removeBanner: mockedRemoveBanner,
            }),
        }) as Record<string, unknown>,
)

describe('ShoppingAssistantTrialSystemBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStoreActivations.mockReturnValue({
            storeActivations: {},
        } as ReturnType<typeof useStoreActivations>)
        mockStoreConfigurations.mockReturnValue({
            storeConfigurations: {},
        } as ReturnType<typeof useStoreConfigurations>)
        useAtLeastOneStoreHasActiveTrialMock.mockReturnValue(false)

        // Mock the new useFlag hook properly
        mockUseFlag.mockImplementation(
            (flagKey: string, defaultValue: boolean = false) => {
                if (flagKey === 'ai-shopping-assistant-trial-system-banner') {
                    return true
                }
                if (
                    flagKey === 'linear.project_shopping-assistant-trial-revamp'
                ) {
                    return false
                }
                return defaultValue
            },
        )

        getStoresEligibleForTrialMock.mockReturnValue([
            {
                name: 'store1',
                configuration: {
                    salesDeactivatedDatetime: null,
                },
            },
        ] as ReturnType<typeof getStoresEligibleForTrial>)

        // Mock selectors
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return { generation: 5 }
            }
            if (selector === getCurrentUser) {
                return fromJS(user)
            }
            if (selector === getCurrentAccountState) {
                return fromJS({ domain: 'test' }) as Map<string, string>
            }

            return undefined
        })

        useActivateAiAgentTrialMock.mockReturnValue({
            canStartTrial: true,
            canStartTrialFromFeatureFlag: true,
            startTrial: () => {},
            isLoading: false,
            routes: {} as any,
            shopName: 'store1',
        })

        useLocationMock.mockReturnValue({
            pathname: '/sales',
        } as any)
    })

    it('should render', () => {
        renderHook(useAiShoppingAssistantTrialBanner)

        expect(mockedAddBanner).toHaveBeenCalledWith({
            category: BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL,
            instanceId: BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL,
            type: AlertBannerTypes.Info,
            preventDismiss: false,
            message:
                'AI Agent just got even smarter with brand new Shopping Assistant skills, start your exclusive access to a 14-day trial',
            CTA: {
                type: 'action',
                text: 'Get Started',
                onClick: expect.any(Function),
            },
        })
    })

    it('should not render if the system banner feature flag is disabled', () => {
        mockUseFlag.mockImplementation(
            (flagKey: string, defaultValue: boolean = false) => {
                if (flagKey === 'ai-shopping-assistant-trial-system-banner') {
                    return false
                }
                if (
                    flagKey === 'linear.project_shopping-assistant-trial-revamp'
                ) {
                    return false
                }
                return defaultValue
            },
        )

        renderHook(useAiShoppingAssistantTrialBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should not render if the revamp feature flag is enabled', () => {
        mockUseFlag.mockImplementation(
            (flagKey: string, defaultValue: boolean = false) => {
                if (flagKey === 'ai-shopping-assistant-trial-system-banner') {
                    return true
                }
                if (
                    flagKey === 'linear.project_shopping-assistant-trial-revamp'
                ) {
                    return true
                }
                return defaultValue
            },
        )

        renderHook(useAiShoppingAssistantTrialBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should not render if the account is not eligible for any type of trial', () => {
        useActivateAiAgentTrialMock.mockReturnValue({
            canStartTrial: false,
            canStartTrialFromFeatureFlag: false,
            startTrial: () => {},
            isLoading: false,
            routes: {} as any,
            shopName: 'store1',
        })
        renderHook(useAiShoppingAssistantTrialBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should not render if the user is visiting the tickets page', () => {
        useLocationMock.mockReturnValue({
            pathname: '/tickets',
        } as any)
        renderHook(useAiShoppingAssistantTrialBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should not render if one store has an active trial', () => {
        useAtLeastOneStoreHasActiveTrialMock.mockReturnValue(true)
        renderHook(useAiShoppingAssistantTrialBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should remove the banner if the user goes to the tickets or views page', () => {
        renderHook(useAiShoppingAssistantTrialBanner)

        expect(mockedAddBanner).toHaveBeenCalled()

        useLocationMock.mockReturnValue({
            pathname: '/tickets',
        } as any)
        renderHook(useAiShoppingAssistantTrialBanner)

        expect(mockedRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL,
            BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL,
        )
    })

    it('should remove the banner if the user starts a trial', () => {
        renderHook(useAiShoppingAssistantTrialBanner)

        expect(mockedAddBanner).toHaveBeenCalled()

        useAtLeastOneStoreHasActiveTrialMock.mockReturnValue(true)

        renderHook(useAiShoppingAssistantTrialBanner)

        expect(mockedRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL,
            BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL,
        )
    })
})
