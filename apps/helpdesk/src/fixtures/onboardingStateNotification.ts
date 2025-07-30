import { OnboardingNotificationState } from 'models/aiAgent/types'
import { getOnboardingNotificationStateFixture } from 'pages/aiAgent/fixtures/onboardingNotificationState.fixture'

export const defaultUseAiAgentOnboardingNotification = {
    isAdmin: true,
    onboardingNotificationState: undefined,
    handleOnSave: jest.fn(),
    handleOnSendOrCancelNotification: jest.fn(),
    handleOnEnablementPostReceivedNotification: jest.fn(),
    handleOnPerformActionPostReceivedNotification: jest.fn(),
    handleOnTriggerActivateAiAgentNotification: jest.fn(),
    handleOnCancelActivateAiAgentNotification: jest.fn(),
    handleOnTriggerTrialRequestNotification: jest.fn(),
    isLoading: false,
    isAiAgentOnboardingNotificationEnabled: true,
}

export const defaultUseAiAgentOnboardingNotificationFixture = (
    props?: Partial<OnboardingNotificationState>,
) => {
    return {
        ...defaultUseAiAgentOnboardingNotification,
        onboardingNotificationState:
            getOnboardingNotificationStateFixture(props),
    }
}
