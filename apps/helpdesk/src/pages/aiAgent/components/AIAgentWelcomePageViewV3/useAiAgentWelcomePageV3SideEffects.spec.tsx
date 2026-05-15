import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { AiAgentNotificationType } from 'automate/notifications/types'
import { AiAgentOnboardingState } from 'models/aiAgent/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'

import { useAiAgentWelcomePageV3SideEffects } from './useAiAgentWelcomePageV3SideEffects'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentNewOnboardingWizardPaywallPageViewed:
            'ai-agent-new-onboarding-wizard-paywall-page-viewed',
        AiAgentWelcomePageViewed: 'ai-agent-welcome-page-viewed',
        AiAgentWelcomePageCtaClicked: 'ai-agent-welcome-page-cta-clicked',
        TrialLinkPaywallViewed: 'trial-link-paywall-viewed',
    },
}))
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification')
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingState', () => ({
    OnboardingState: {
        Loading: 'loading',
        OnboardingWizard: 'onboardingWizard',
        Onboarded: 'onboarded',
    },
    useAiAgentOnboardingState: jest.fn(),
}))
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('pages/aiAgent/utils/extractShopNameFromUrl')

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>
const mockUseAiAgentOnboardingNotification =
    useAiAgentOnboardingNotification as jest.Mock
const mockUseAiAgentOnboardingState = useAiAgentOnboardingState as jest.Mock
const mockUseTrialAccess = useTrialAccess as jest.Mock
const mockUseAiAgentNavigation = useAiAgentNavigation as jest.Mock
const mockExtractShopNameFromUrl = extractShopNameFromUrl as jest.Mock

const SHOP_NAME = 'my-shop'
const WIZARD_PATH = `/app/ai-agent/shopify/${SHOP_NAME}/onboarding/tone of voice`

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
}))

const handleOnSave = jest.fn()
const handleOnSendOrCancelNotification = jest.fn()
const handleOnPerformActionPostReceivedNotification = jest.fn()

const baseOnboardingNotification = {
    isAdmin: true,
    isLoading: false,
    onboardingNotificationState: undefined,
    handleOnSave,
    handleOnSendOrCancelNotification,
    handleOnPerformActionPostReceivedNotification,
    isAiAgentOnboardingNotificationEnabled: true,
}

const baseTrialAccess = {
    canSeeTrialCTA: false,
    isInAiAgentTrial: false,
    trialType: TrialType.AiAgent,
}

describe('useAiAgentWelcomePageV3SideEffects', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            baseOnboardingNotification,
        )
        mockUseAiAgentOnboardingState.mockReturnValue(OnboardingState.Onboarded)
        mockUseTrialAccess.mockReturnValue(baseTrialAccess)
        mockUseAiAgentNavigation.mockReturnValue({
            routes: { onboardingWizardStep: () => WIZARD_PATH },
        })
        mockExtractShopNameFromUrl.mockReturnValue(SHOP_NAME)
    })

    const renderSideEffects = (storeConfiguration?: object) =>
        renderHook(() =>
            useAiAgentWelcomePageV3SideEffects({
                shopName: SHOP_NAME,
                storeConfiguration: storeConfiguration as never,
            }),
        )

    it('logs the page-view analytics events on mount', () => {
        renderSideEffects()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentNewOnboardingWizardPaywallPageViewed,
            { shopName: SHOP_NAME },
        )
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentWelcomePageViewed,
            { version: 'V3', store: SHOP_NAME },
        )
        expect(mockLogEvent).not.toHaveBeenCalledWith(
            SegmentEvent.TrialLinkPaywallViewed,
            expect.anything(),
        )
    })

    it('fires the TrialLinkPaywallViewed event when canSeeTrialCTA is true', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeTrialCTA: true,
        })

        renderSideEffects()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.TrialLinkPaywallViewed,
            { trialType: TrialType.AiAgent },
        )
    })

    it('navigates to the wizard step and logs the CTA-clicked event on onCtaTransition', () => {
        const { result } = renderSideEffects()

        act(() => {
            result.current.onCtaTransition({ jtbd: 'support' })
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentWelcomePageCtaClicked,
            { version: 'V3', store: SHOP_NAME },
        )
        expect(mockHistoryPush).toHaveBeenCalledWith({
            pathname: WIZARD_PATH,
            search: '?jtbd=support',
        })
    })

    it('appends update_setup=true when re-onboarding (storeConfiguration wizard not yet completed)', () => {
        const { result } = renderSideEffects({
            wizard: { completedDatetime: null },
        })

        act(() => {
            result.current.onCtaTransition({ jtbd: 'support' })
        })

        const pushCall = mockHistoryPush.mock.calls[0]?.[0]
        expect(pushCall?.pathname).toBe(WIZARD_PATH)
        expect(pushCall?.search).toContain('jtbd=support')
        expect(pushCall?.search).toContain('update_setup=true')
    })

    it('auto-redirects to the wizard when the user is on the store page during an active AiAgent trial', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            isInAiAgentTrial: true,
        })
        mockUseAiAgentOnboardingState.mockReturnValue(
            OnboardingState.OnboardingWizard,
        )

        renderSideEffects()

        expect(mockHistoryPush).toHaveBeenCalledWith(
            expect.objectContaining({ pathname: WIZARD_PATH }),
        )
    })

    it('does not auto-redirect when the user is not on the matching store page', () => {
        mockExtractShopNameFromUrl.mockReturnValue('other-shop')
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            isInAiAgentTrial: true,
        })
        mockUseAiAgentOnboardingState.mockReturnValue(
            OnboardingState.OnboardingWizard,
        )

        renderSideEffects()

        expect(mockHistoryPush).not.toHaveBeenCalled()
    })

    it('runs the start-setup notification machinery on mount for an admin', async () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...baseOnboardingNotification,
            onboardingNotificationState: {
                onboardingState: AiAgentOnboardingState.VisitedAiAgent,
                welcomePageVisitedDatetimes: [],
                startAiAgentSetupNotificationReceivedDatetime: null,
            },
        })

        renderSideEffects()

        expect(handleOnSendOrCancelNotification).toHaveBeenCalledWith({
            aiAgentNotificationType: AiAgentNotificationType.MeetAiAgent,
            isCancel: true,
        })
        expect(handleOnSave).toHaveBeenCalledWith(
            expect.objectContaining({
                onboardingState: AiAgentOnboardingState.VisitedAiAgent,
            }),
        )
    })
})
