/* eslint-disable @typescript-eslint/no-unsafe-return */
import { useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { useStoreConfigurationMutation } from 'pages/aiAgent/hooks/useStoreConfigurationMutation'
import { notify } from 'state/notifications/actions'
import type { RootState } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { ConnectedChannelsEmailView } from '../components/ConnectedChannelsEmailView'

jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('state/notifications/actions')
const mockNotify = jest.mocked(notify)

jest.mock('pages/aiAgent/hooks/useStoreConfiguration')
jest.mock('pages/aiAgent/hooks/useStoreConfigurationMutation')
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({
        shopType: 'shopify',
        shopName: 'shopName',
    })),
}))
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)
const mockUseFlag = jest.mocked(useFlag)
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification')
const mockUseAiAgentOnboardingNotification = jest.mocked(
    useAiAgentOnboardingNotification,
)
const mockStore = configureMockStore([thunk])

const defaultState = {
    integrations: fromJS({
        integrations: [],
    }),

    billing: fromJS(billingState),
} as RootState

const mockedStore = mockStore({
    ...defaultState,
})

describe('ConnectedChannelsEmailView', () => {
    beforeEach(() => {
        ;(useStoreConfigurationMutation as jest.Mock).mockReturnValue({
            upsertStoreConfiguration: jest.fn(),
            error: null,
        })

        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
        mockUseAiAgentOnboardingNotification.mockReturnValue({
            isAdmin: true,
            isLoading: false,
            onboardingNotificationState: undefined,
            handleOnSave: jest.fn(),
            handleOnSendOrCancelNotification: jest.fn(),
            handleOnEnablementPostReceivedNotification: jest.fn(),
            handleOnPerformActionPostReceivedNotification: jest.fn(),
            handleOnTriggerActivateAiAgentNotification: jest.fn(),
            handleOnCancelActivateAiAgentNotification: jest.fn(),
            handleOnTriggerTrialRequestNotification: jest.fn(),
            isAiAgentOnboardingNotificationEnabled: true,
        })
        mockUseFlag.mockReturnValue(false)
    })
    it('should show loading spinner when fetching data', () => {
        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration: null,
            isLoading: true,
        })
        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>,
        )
        expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
    it(`should show configuration required warning whenever storeConfiguration is not defined`, () => {
        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration: undefined,
            isLoading: false,
        })
        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>,
        )

        expect(screen.getByText(/warning/i)).toBeInTheDocument()
        expect(
            screen.getByRole('link', {
                name: /configuration required/i,
            }),
        ).toHaveAttribute('href', `/app/ai-agent/shopify/shopName`)
    })

    it('should call upsertStoreConfiguration with correct parameters when enabling AI agent', () => {
        const handleUpsertStoreConfiguration = jest.fn()
        const storeConfiguration = getStoreConfigurationFixture({
            emailChannelDeactivatedDatetime: '2021-09-28T10:00:00Z',
            monitoredEmailIntegrations: [{ id: 1, email: 'test@mail.com' }],
        })
        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration,
            isLoading: false,
        })
        ;(useStoreConfigurationMutation as jest.Mock).mockReturnValue({
            upsertStoreConfiguration: handleUpsertStoreConfiguration,
            error: null,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>,
        )

        fireEvent.click(screen.getByRole('switch', { name: /enable/i }))

        expect(handleUpsertStoreConfiguration).toHaveBeenCalledWith({
            ...storeConfiguration,
            previewModeActivatedDatetime: null,
            previewModeValidUntilDatetime: null,
            emailChannelDeactivatedDatetime: null,
        })
    })

    it('should call upsertStoreConfiguration with correct parameters when disabling AI agent', () => {
        const handleUpsertStoreConfiguration = jest.fn()
        const storeConfiguration = getStoreConfigurationFixture({
            emailChannelDeactivatedDatetime: null,
        })
        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration,
            isLoading: false,
        })
        ;(useStoreConfigurationMutation as jest.Mock).mockReturnValue({
            upsertStoreConfiguration: handleUpsertStoreConfiguration,
            error: null,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>,
        )

        expect(screen.getByRole('switch')).toBeChecked()

        fireEvent.click(screen.getByRole('switch'))

        expect(handleUpsertStoreConfiguration).toHaveBeenCalledWith(
            expect.objectContaining({
                ...storeConfiguration,
                previewModeActivatedDatetime: null,
                emailChannelDeactivatedDatetime: expect.any(String),
            }),
        )
    })

    it('should show enabled state when AI agent is enabled', () => {
        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture({
                emailChannelDeactivatedDatetime: undefined,
            }),
            isLoading: false,
        })
        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>,
        )

        expect(screen.getByText(/enabled/i)).toBeInTheDocument()
    })

    it('should show disabled state when AI agent is disabled', () => {
        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture({
                emailChannelDeactivatedDatetime: '2021-09-28T10:00:00Z',
            }),
            isLoading: false,
        })
        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>,
        )

        expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('should call upsertStoreConfiguration and enable when disabled state', () => {
        const handleUpsertStoreConfiguration = jest.fn()
        const storeConfiguration = getStoreConfigurationFixture({
            monitoredEmailIntegrations: [{ id: 1, email: 'test@mail.com' }],
            emailChannelDeactivatedDatetime: '2021-09-28T10:00:00Z',
        })
        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration,
            isLoading: false,
        })
        ;(useStoreConfigurationMutation as jest.Mock).mockReturnValue({
            upsertStoreConfiguration: handleUpsertStoreConfiguration,
            error: null,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>,
        )

        fireEvent.click(screen.getByRole('switch', { name: /enable/i }))

        expect(handleUpsertStoreConfiguration).toHaveBeenCalledWith({
            ...storeConfiguration,
            previewModeActivatedDatetime: null,
            previewModeValidUntilDatetime: null,
            emailChannelDeactivatedDatetime: null,
        })
    })

    it('should call upsertStoreConfiguration and disable when enabled state', () => {
        const handleUpsertStoreConfiguration = jest.fn()
        const storeConfiguration = getStoreConfigurationFixture({
            emailChannelDeactivatedDatetime: null,
        })
        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration,
            isLoading: false,
        })
        ;(useStoreConfigurationMutation as jest.Mock).mockReturnValue({
            upsertStoreConfiguration: handleUpsertStoreConfiguration,
            error: null,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>,
        )

        expect(screen.getByRole('switch')).toBeChecked()

        fireEvent.click(screen.getByRole('switch'))

        expect(handleUpsertStoreConfiguration).toHaveBeenCalledWith(
            expect.objectContaining({
                ...storeConfiguration,
                previewModeActivatedDatetime: null,
                emailChannelDeactivatedDatetime: expect.any(String),
            }),
        )
    })

    it('should disable toggle when monitoredEmailIntegrations is empty', () => {
        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture({
                monitoredEmailIntegrations: [],
            }),
            isLoading: false,
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>,
        )
        expect(
            screen.getByLabelText(/Enable AI Agent for email/i),
        ).toBeDisabled()
    })

    it('should call updateSettingsAfterAiAgentEnabled when AI agent is disabled', () => {
        const handleUpsertStoreConfiguration = jest.fn()
        const storeConfiguration = getStoreConfigurationFixture({
            emailChannelDeactivatedDatetime: '2021-09-28T10:00:00Z',
            monitoredEmailIntegrations: [{ id: 1, email: 'test@mail.com' }],
        })

        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration,
            isLoading: false,
        })
        ;(useStoreConfigurationMutation as jest.Mock).mockReturnValue({
            upsertStoreConfiguration: handleUpsertStoreConfiguration,
            error: null,
        })
        mockUseFlag.mockReturnValue(true)

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>,
        )

        fireEvent.click(screen.getByRole('switch', { name: /enable/i }))

        expect(handleUpsertStoreConfiguration).toHaveBeenCalledWith(
            expect.objectContaining({
                emailChannelDeactivatedDatetime: null,
            }),
        )
    })

    it('should call updateSettingsAfterAiAgentEnabled when ai agent disabled and AiAgentOnboardingWizard is enabled', async () => {
        const updateSettingsAfterAiAgentEnabled = jest.fn()
        const storeConfiguration = getStoreConfigurationFixture({
            emailChannelDeactivatedDatetime: '2021-09-28T10:00:00Z',
            monitoredEmailIntegrations: [{ id: 1, email: 'test@mail.com' }],
        })
        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration,
            isLoading: false,
        })
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled,
        })

        mockUseFlag.mockReturnValue(true)

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>,
        )

        fireEvent.click(screen.getByRole('switch', { name: /enable/i }))

        await waitFor(() =>
            expect(updateSettingsAfterAiAgentEnabled).toHaveBeenCalledTimes(1),
        )
    })

    it('should throw error when upsertStoreConfiguration fails', async () => {
        const handleUpsertStoreConfiguration = jest.fn()
        const storeConfiguration = getStoreConfigurationFixture({
            emailChannelDeactivatedDatetime: '2021-09-28T10:00:00Z',
            monitoredEmailIntegrations: [{ id: 1, email: 'test@mail.com' }],
        })

        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration,
            isLoading: false,
        })
        ;(useStoreConfigurationMutation as jest.Mock).mockReturnValue({
            upsertStoreConfiguration: handleUpsertStoreConfiguration,
            error: 'error',
        })

        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>,
        )

        fireEvent.click(screen.getByRole('switch', { name: /enable/i }))

        await waitFor(() =>
            expect(mockNotify).toHaveBeenCalledWith({
                message: 'Could not update store configuration',
            }),
        )
    })
})
