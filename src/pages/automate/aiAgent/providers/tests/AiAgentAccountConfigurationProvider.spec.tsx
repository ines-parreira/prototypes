import {IntegrationType} from '@gorgias/api-queries'
import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {useGetOrCreateAccountConfiguration} from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import {getHasAutomate} from 'state/billing/selectors'
import {renderWithRouter} from 'utils/testing'

import {AiAgentAccountConfigurationProvider} from '../AiAgentAccountConfigurationProvider'

jest.mock('hooks/aiAgent/useGetOrCreateAccountConfiguration')
jest.mock('launchdarkly-react-client-sdk')

const mockStore = configureMockStore([thunk])

const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const defaultState = {
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
jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))
const mockGetHasAutomate = jest.mocked(getHasAutomate)

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <AiAgentAccountConfigurationProvider>
                <div data-testid="children" />
            </AiAgentAccountConfigurationProvider>
        </Provider>
    )

describe('AiAgentAccountConfigurationProvider', () => {
    const mockUseGetOrCreateAccountConfiguration =
        useGetOrCreateAccountConfiguration as jest.MockedFunction<
            typeof useGetOrCreateAccountConfiguration
        >

    beforeEach(() => {
        jest.resetAllMocks()
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: false,
        })
    })

    it('should render if automate and load successs', () => {
        mockGetHasAutomate.mockReturnValue(true)

        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'success',
        } as any)
        renderComponent()

        expect(screen.getByTestId('children')).toBeInTheDocument()
    })

    it('should render if not automate but feature flag and load successs', () => {
        mockGetHasAutomate.mockReturnValue(false)
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: true,
        })
        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'success',
        } as any)
        renderComponent()

        expect(screen.getByTestId('children')).toBeInTheDocument()
    })

    it('should render Loader when accountConfigRetrievalStatus is loading with automate', () => {
        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'loading',
        } as any)
        mockGetHasAutomate.mockReturnValue(true)

        renderComponent()
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should redirect to "/app/automation" when error', () => {
        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'error',
        } as any)
        mockGetHasAutomate.mockReturnValue(false)

        renderComponent()
    })

    it('should redirect to "/app/automation" when not automate and no FF', () => {
        mockGetHasAutomate.mockReturnValue(false)

        mockUseGetOrCreateAccountConfiguration.mockReturnValue({
            status: 'error',
        } as any)

        renderComponent()
    })
})
