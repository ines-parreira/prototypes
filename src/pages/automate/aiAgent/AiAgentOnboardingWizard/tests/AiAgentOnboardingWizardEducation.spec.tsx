import 'tests/__mocks__/intersectionObserverMock'

import React, {ComponentProps} from 'react'
import {screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {AiAgentOnboardingWizardStep} from 'models/aiAgent/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import AiAgentOnboardingWizardStepEducation from '../AiAgentOnboardingWizardEducation'
import {useAiAgentOnboardingWizard} from '../hooks/useAiAgentOnboardingWizard'
import {getStoreConfigurationFormValuesFixture} from '../../fixtures/onboardingWizard.fixture'

jest.mock('../hooks/useAiAgentOnboardingWizard')
const mockUseAiAgentOnboardingWizard = assumeMock(useAiAgentOnboardingWizard)

const mockedUseAiAgentOnboardingWizard = {
    storeFormValues: getStoreConfigurationFormValuesFixture(),
    faqHelpCenters: getHelpCentersResponseFixture.data,
    snippetHelpCenter: null,
    isLoading: false,
    handleFormUpdate: jest.fn(),
    handleSave: jest.fn(),
    handleAction: jest.fn(),
}

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])

const defaultState = {}

const renderComponent = (
    props: Partial<ComponentProps<typeof AiAgentOnboardingWizardStepEducation>>
) => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <Wizard steps={[AiAgentOnboardingWizardStep.Education]}>
                    <AiAgentOnboardingWizardStepEducation {...props} />
                </Wizard>
            </QueryClientProvider>
        </Provider>
    )
}

describe('<AiAgentOnboardingWizardEducation />', () => {
    beforeEach(() => {
        mockUseAiAgentOnboardingWizard.mockReturnValue(
            mockedUseAiAgentOnboardingWizard
        )
    })

    it('should render the header and footer correctly', () => {
        renderComponent({})

        expect(screen.getByText('How AI Agent works')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should call handleSave with BACK_TO_WELCOME_PAGE when cancel button is clicked', () => {
        renderComponent({})

        userEvent.click(screen.getByText('Cancel'))

        expect(
            mockedUseAiAgentOnboardingWizard.handleSave
        ).toHaveBeenCalledWith({
            redirectTo: 'back_to_empty_state',
        })
    })

    it('should call handleSave with NEXT_STEP when next button is clicked', () => {
        renderComponent({})

        userEvent.click(screen.getByText('Next'))

        expect(
            mockedUseAiAgentOnboardingWizard.handleSave
        ).toHaveBeenCalledWith({
            redirectTo: 'next_step',
            stepName: AiAgentOnboardingWizardStep.Personalize,
        })
    })
})
