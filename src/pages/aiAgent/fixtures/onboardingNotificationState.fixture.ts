import { OnboardingNotificationState } from 'models/aiAgent/types'

export const getOnboardingNotificationStateFixture = (
    props?: Partial<OnboardingNotificationState>,
): OnboardingNotificationState => ({
    shopName: 'test-shop',
    welcomePageVisitedDatetimes: [],
    testBeforeActivationDatetimes: [],
    firstActivationDatetime: null,
    startAiAgentSetupNotificationReceivedDatetime: null,
    finishAiAgentSetupNotificationReceivedDatetime: null,
    activateAiAgentNotificationReceivedDatetime: null,
    meetAiAgentNotificationReceivedDatetime: null,
    firstAiAgentTicketNotificationReceivedDatetime: null,
    onboardingState: null,
    ...props,
})
