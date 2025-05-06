import 'tests/__mocks__/intersectionObserverMock'

import React from 'react'

import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithRouter } from 'utils/testing'

import { getStoreConfigurationFormValuesFixture } from '../../fixtures/onboardingWizard.fixture'
import { getStoreConfigurationFixture } from '../../fixtures/storeConfiguration.fixtures'
import AiAgentOnboardingWizard from '../AiAgentOnboardingWizard'
import { useAiAgentOnboardingWizard } from '../hooks/useAiAgentOnboardingWizard'

jest.mock('../../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')

jest.mock('../AiAgentOnboardingWizardPersonalize', () => ({
    __esModule: true,
    default: () => <div>Personalize AI Agent </div>,
}))
const QueryClientProvider = mockQueryClientProvider().QueryClientProvider

const mockUseAiAgentStoreConfigurationContext = assumeMock(
    useAiAgentStoreConfigurationContext,
)

jest.mock('../hooks/useAiAgentOnboardingWizard')
const mockUseAiAgentOnboardingWizard = assumeMock(useAiAgentOnboardingWizard)

const mockedUseAiAgentOnboardingWizard = {
    storeFormValues: getStoreConfigurationFormValuesFixture(),
    faqHelpCenters: getHelpCentersResponseFixture.data,
    snippetHelpCenter: null,
    isLoading: false,
    isUpdateWizardSetup: false,
    handleFormUpdate: jest.fn(),
    handleSave: jest.fn(),
    handleAction: jest.fn(),
    updateValue: jest.fn(),
    storeConfiguration: undefined,
}

const mockStore = configureMockStore([thunk])

const defaultState = {}

const renderComponent = () => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider>
                <AiAgentOnboardingWizard />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/new`,
            route: '/shopify/test-shop/ai-agent/new',
        },
    )
}

describe('<AiAgentOnboardingWizard />', () => {
    beforeEach(() => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture(),
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
        mockUseAiAgentOnboardingWizard.mockReturnValue(
            mockedUseAiAgentOnboardingWizard,
        )
    })

    it('should render the component with the correct wizard steps', () => {
        renderComponent()

        expect(screen.getByText('Set up AI Agent')).toBeInTheDocument()
        expect(screen.queryByText('How AI Agent works')).not.toBeInTheDocument()
        expect(
            screen.getAllByText('Personalize AI Agent')[0],
        ).toBeInTheDocument()
    })
})
