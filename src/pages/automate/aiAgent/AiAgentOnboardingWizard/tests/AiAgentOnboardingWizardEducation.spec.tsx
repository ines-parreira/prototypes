import 'tests/__mocks__/intersectionObserverMock'

import React, {ComponentProps} from 'react'
import {screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {renderWithRouter} from 'utils/testing'
import {AiAgentOnboardingWizardStep} from 'models/aiAgent/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import AiAgentOnboardingWizardStepEducation from '../AiAgentOnboardingWizardEducation'

const mockStore = configureMockStore([thunk])

const defaultState = {}

const renderComponent = (
    props: Partial<ComponentProps<typeof AiAgentOnboardingWizardStepEducation>>
) => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <Wizard steps={[AiAgentOnboardingWizardStep.Education]}>
                <AiAgentOnboardingWizardStepEducation {...props} />
            </Wizard>
        </Provider>
    )
}

describe('<AiAgentOnboardingWizardEducation />', () => {
    it('should render the header and footer correctly', () => {
        renderComponent({})

        expect(screen.getByText('How AI Agent works')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
    })
})
