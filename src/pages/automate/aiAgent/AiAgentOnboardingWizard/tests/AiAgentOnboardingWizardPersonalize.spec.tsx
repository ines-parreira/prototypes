import 'tests/__mocks__/intersectionObserverMock'

import React, {ComponentProps} from 'react'
import {screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {mockFlags} from 'jest-launchdarkly-mock'
import {renderWithRouter} from 'utils/testing'
import {AiAgentOnboardingWizardStep} from 'models/aiAgent/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import {FeatureFlagKey} from 'config/featureFlags'
import AiAgentOnboardingWizardStepPersonalize from '../AiAgentOnboardingWizardPersonalize'

const mockStore = configureMockStore([thunk])

const defaultState = {}
const defaultProps = {
    shopType: 'shopify',
    shopName: 'test-shop',
}

const renderComponent = (
    props: Partial<
        ComponentProps<typeof AiAgentOnboardingWizardStepPersonalize>
    >
) => {
    const currentProps = {...defaultProps, ...props}
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <Wizard steps={[AiAgentOnboardingWizardStep.Personalize]}>
                <AiAgentOnboardingWizardStepPersonalize {...currentProps} />
            </Wizard>
        </Provider>
    )
}

describe('<AiAgentOnboardingWizardPersonalize />', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]: true,
        })
    })

    it('should render the header and footer correctly', () => {
        renderComponent({})

        expect(
            screen.getAllByText('Personalize AI Agent')[1]
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Set up AI Agent on at least one channel you want it to respond to.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Back')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
        expect(screen.getByText('Save & Customize Later')).toBeInTheDocument
    })

    it('should render the footer without back button when educational step feature flag is false', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]: false,
        })

        renderComponent({})

        expect(screen.queryByText('Back')).not.toBeInTheDocument()
        expect(screen.queryByText('Save & Customize Later')).not
            .toBeInTheDocument
        expect(
            screen.getAllByText('Personalize AI Agent')[1]
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Set up AI Agent on at least one channel you want it to respond to.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
})
