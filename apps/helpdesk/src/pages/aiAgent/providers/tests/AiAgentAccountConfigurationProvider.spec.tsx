import { FeatureFlagKey } from '@repo/feature-flags'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from '@gorgias/helpdesk-queries'

import { useFlag } from 'core/flags'
import { useGetOrCreateAccountConfiguration } from 'hooks/aiAgent/useGetOrCreateAccountConfiguration'
import { getHasAutomate } from 'state/billing/selectors'
import { renderWithRouter } from 'utils/testing'

import { AiAgentAccountConfigurationProvider } from '../AiAgentAccountConfigurationProvider'

jest.mock('hooks/aiAgent/useGetOrCreateAccountConfiguration')

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
                    '1': { id: 1, name: 'help center 1', type: 'faq' },
                    '2': { id: 2, name: 'help center 2', type: 'faq' },
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

jest.mock('core/flags')
const mockUseFlag = jest.mocked(useFlag)

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <AiAgentAccountConfigurationProvider>
                <div data-testid="children" />
            </AiAgentAccountConfigurationProvider>
        </Provider>,
    )

describe('AiAgentAccountConfigurationProvider', () => {
    const mockUseGetOrCreateAccountConfiguration =
        useGetOrCreateAccountConfiguration as jest.MockedFunction<
            typeof useGetOrCreateAccountConfiguration
        >

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseFlag.mockReturnValue(false)
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
        mockUseFlag.mockImplementation(
            (key) => FeatureFlagKey.AIAgentPreviewModeAllowed === key || false,
        )

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
