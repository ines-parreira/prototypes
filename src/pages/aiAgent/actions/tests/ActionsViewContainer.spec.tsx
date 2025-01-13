import {QueryClientProvider} from '@tanstack/react-query'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {AiAgentNotificationType} from 'automate/notifications/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {billingState} from 'fixtures/billing'
import {AiAgentOnboardingState} from 'models/aiAgent/types'
import {IntegrationType} from 'models/integration/constants'
import {
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import {getOnboardingNotificationStateFixture} from 'pages/aiAgent/fixtures/onboardingNotificationState.fixture'
import {useAiAgentOnboardingNotification} from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'

import ActionsViewContainer from '../ActionsViewContainer'
import {actionConfigurationFixture} from '../hooks/tests/actions.fixtures'

jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('../components/ActionsList', () => () => <div>ActionsList</div>)

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(),
}))
jest.mock('models/workflows/queries', () => ({
    useGetStoreWorkflowsConfigurations: jest.fn(),
    useGetWorkflowConfigurationTemplates: jest.fn(),
}))

const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations
)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates
)
const mockUseAiAgentOnboardingNotification = jest.mocked(
    useAiAgentOnboardingNotification
)

const defaultUseAiAgentOnboardingNotification = {
    isAdmin: true,
    onboardingNotificationState: undefined,
    handleOnSave: jest.fn(),
    handleOnSendOrCancelNotification: jest.fn(),
    isLoading: false,
    isAiAgentOnboardingNotificationEnabled: true,
}

const mockStore = configureMockStore([thunk])

const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const defaultState = {
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Email,
                name: 'My email integration',
                meta: {
                    address: MOCK_EMAIL_ADDRESS,
                },
            },
        ],
    }),
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': {id: 1, name: 'help center 1', type: 'faq'},
                    '2': {id: 2, name: 'help center 2', type: 'faq'},
                },
            },
        },
    },
}

const queryClient = mockQueryClient()

const renderComponent = () => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <ActionsViewContainer />
            </QueryClientProvider>
        </Provider>
    )
}

describe('ActionsViewContainer', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
            data: [actionConfigurationFixture],
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>)
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification
        )
        mockFlags({
            [FeatureFlagKey.ActionsUseCaseTemplates]: false,
        })
    })

    it('renders without error', () => {
        renderComponent()
    })

    it('should trigger activate AI agent notification when there are at least 1 action created', () => {
        renderComponent()

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).toHaveBeenCalledWith({
            aiAgentNotificationType: AiAgentNotificationType.ActivateAiAgent,
        })
    })

    it('should not trigger activate AI agent notification when there are no action created', () => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
            data: [],
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>)

        renderComponent()

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).not.toHaveBeenCalled()
    })

    it('should not trigger activate AI agent notification when merchant already fully onboarded', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            onboardingNotificationState: getOnboardingNotificationStateFixture({
                onboardingState: AiAgentOnboardingState.FullyOnboarded,
            }),
        })

        renderComponent()

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).not.toHaveBeenCalled()
    })

    it('should not trigger activate AI agent notification when merchant already activated AI agent previously', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            onboardingNotificationState: getOnboardingNotificationStateFixture({
                onboardingState: AiAgentOnboardingState.Activated,
            }),
        })

        renderComponent()

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).not.toHaveBeenCalled()
    })

    it('should not trigger activate AI agent notification when merchant already received the notification previously', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            onboardingNotificationState: getOnboardingNotificationStateFixture({
                activateAiAgentNotificationReceivedDatetime:
                    '2024-12-01T12:00:00Z',
            }),
        })

        renderComponent()

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).not.toHaveBeenCalled()
    })

    it('should not trigger activate AI agent notification if user is not an admin', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            isAdmin: false,
        })

        renderComponent()

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).not.toHaveBeenCalled()
    })

    it('should not trigger activate AI agent notification if AiAgentOnboardingNotification flag is disable', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            isAiAgentOnboardingNotificationEnabled: false,
        })

        renderComponent()

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).not.toHaveBeenCalled()
    })

    it('should not trigger activate AI agent notification during loading', () => {
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            ...defaultUseAiAgentOnboardingNotification,
            isLoading: true,
        })

        renderComponent()

        expect(
            defaultUseAiAgentOnboardingNotification.handleOnSendOrCancelNotification
        ).not.toHaveBeenCalled()
    })
})
