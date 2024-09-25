/* eslint-disable @typescript-eslint/no-unsafe-return */
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {fireEvent, screen} from '@testing-library/react'
import {Router} from 'react-router-dom'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {billingState} from 'fixtures/billing'
import {RootState} from 'state/types'
import history from 'pages/history'
import {useStoreConfiguration} from 'pages/automate/aiAgent/hooks/useStoreConfiguration'
import {useStoreConfigurationMutation} from 'pages/automate/aiAgent/hooks/useStoreConfigurationMutation'
import {useAiAgentEnabled} from 'pages/automate/aiAgent/hooks/useAiAgentEnabled'
import {ConnectedChannelsEmailView} from '../components/ConnectedChannelsEmailView'

jest.mock('pages/automate/aiAgent/hooks/useStoreConfiguration')
jest.mock('pages/automate/aiAgent/hooks/useStoreConfigurationMutation')
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({
        shopType: 'shopType',
        shopName: 'shopName',
    })),
}))
jest.mock('pages/automate/aiAgent/hooks/useAiAgentEnabled')

const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)
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
            </Router>
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
            </Router>
        )

        expect(screen.getByText(/warning/i)).toBeInTheDocument()
        expect(
            screen.getByRole('link', {
                name: /configuration required/i,
            })
        ).toHaveAttribute('href', `/app/automation/shopType/shopName/ai-agent`)
    })

    it('should call upsertStoreConfiguration with correct parameters when enabling AI agent', () => {
        const handleUpsertStoreConfiguration = jest.fn()
        const storeConfiguration = {
            deactivatedDatetime: '2021-09-28T10:00:00Z',
        }
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
            </Router>
        )

        fireEvent.click(screen.getByRole('switch', {name: /enable/i}))

        expect(handleUpsertStoreConfiguration).toHaveBeenCalledWith({
            ...storeConfiguration,
            trialModeActivatedDatetime: null,
            deactivatedDatetime: null,
        })
    })

    it('should call upsertStoreConfiguration with correct parameters when disabling AI agent', () => {
        const handleUpsertStoreConfiguration = jest.fn()
        const storeConfiguration = {
            deactivatedDatetime: null,
        }
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
            </Router>
        )

        expect(screen.getByRole('switch')).toBeChecked()

        fireEvent.click(screen.getByRole('switch'))

        expect(handleUpsertStoreConfiguration).toHaveBeenCalledWith(
            expect.objectContaining({
                ...storeConfiguration,
                trialModeActivatedDatetime: null,
                deactivatedDatetime: expect.any(String),
            })
        )
    })

    it('should show enabled state when AI agent is enabled', () => {
        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration: {
                deactivatedDatetime: undefined,
            },
            isLoading: false,
        })
        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>
        )

        expect(screen.getByText(/enabled/i)).toBeInTheDocument()
    })

    it('should show disabled state when AI agent is disabled', () => {
        ;(useStoreConfiguration as jest.Mock).mockReturnValue({
            storeConfiguration: {
                deactivatedDatetime: '2021-09-28T10:00:00Z',
            },
            isLoading: false,
        })
        renderWithQueryClientProvider(
            <Router history={history}>
                <Provider store={mockedStore}>
                    <ConnectedChannelsEmailView />
                </Provider>
            </Router>
        )

        expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('should call upsertStoreConfiguration and enable when disabled state', () => {
        const handleUpsertStoreConfiguration = jest.fn()
        const storeConfiguration = {
            deactivatedDatetime: '2021-09-28T10:00:00Z',
        }
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
            </Router>
        )

        fireEvent.click(screen.getByRole('switch', {name: /enable/i}))

        expect(handleUpsertStoreConfiguration).toHaveBeenCalledWith({
            ...storeConfiguration,
            trialModeActivatedDatetime: null,
            deactivatedDatetime: null,
        })
    })

    it('should call upsertStoreConfiguration and disable when enabled state', () => {
        const handleUpsertStoreConfiguration = jest.fn()
        const storeConfiguration = {
            deactivatedDatetime: null,
        }
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
            </Router>
        )

        expect(screen.getByRole('switch')).toBeChecked()

        fireEvent.click(screen.getByRole('switch'))

        expect(handleUpsertStoreConfiguration).toHaveBeenCalledWith(
            expect.objectContaining({
                ...storeConfiguration,
                trialModeActivatedDatetime: null,
                deactivatedDatetime: expect.any(String),
            })
        )
    })
})
