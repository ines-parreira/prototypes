import 'tests/__mocks__/intersectionObserverMock'

import React, {ComponentProps} from 'react'
import {screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {renderWithRouter} from 'utils/testing'
import {AiAgentOnboardingWizardStep} from 'models/aiAgent/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import AiAgentOnboardingWizardStepKnowledge from '../AiAgentOnboardingWizardKnowledge'

const mockStore = configureMockStore([thunk])

const defaultState = {}

const renderComponent = (
    props: Partial<ComponentProps<typeof AiAgentOnboardingWizardStepKnowledge>>
) => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <Wizard steps={[AiAgentOnboardingWizardStep.Knowledge]}>
                <AiAgentOnboardingWizardStepKnowledge {...props} />
            </Wizard>
        </Provider>
    )
}

describe('<AiAgentOnboardingWizardKnowledge />', () => {
    it('should render the header and footer correctly', () => {
        renderComponent({})

        expect(
            screen.getByText('Add knowledge to AI Agent')
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'At least one knowledge source is required for AI Agent to reference when replying to customers. You can always add more later.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Back')).toBeInTheDocument()
        expect(screen.getByText('Finish')).toBeInTheDocument()
        expect(screen.getByText('Save & Customize Later')).toBeInTheDocument
    })
})
