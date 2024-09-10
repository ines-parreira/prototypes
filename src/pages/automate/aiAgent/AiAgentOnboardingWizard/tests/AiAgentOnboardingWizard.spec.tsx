import 'tests/__mocks__/intersectionObserverMock'

import React from 'react'
import {screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {mockFlags} from 'jest-launchdarkly-mock'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'
import AiAgentOnboardingWizard from '../AiAgentOnboardingWizard'
import {useAiAgentStoreConfigurationContext} from '../../providers/AiAgentStoreConfigurationContext'
import {getStoreConfigurationFixture} from '../../fixtures/storeConfiguration.fixtures'

jest.mock('../../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

const mockUseAiAgentStoreConfigurationContext = assumeMock(
    useAiAgentStoreConfigurationContext
)

const mockStore = configureMockStore([thunk])

const defaultState = {}

const renderComponent = () => {
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <AiAgentOnboardingWizard />
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/new`,
            route: '/shopify/test-shop/ai-agent/new',
        }
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
        mockFlags({
            [FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]: true,
        })
    })

    it('should render the component with the correct wizard steps', () => {
        renderComponent()

        expect(screen.getByText('Set up AI Agent')).toBeInTheDocument()
        expect(screen.getByText('How AI Agent works')).toBeInTheDocument()
        expect(screen.getByText('Personalize AI Agent')).toBeInTheDocument()
        expect(screen.getByText('Add knowledge')).toBeInTheDocument()
    })

    it('should render the component without educational step when educational step feature flag is false', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]: false,
        })

        renderComponent()

        expect(screen.getByText('Set up AI Agent')).toBeInTheDocument()
        expect(screen.queryByText('How AI Agent works')).not.toBeInTheDocument()
        expect(
            screen.getAllByText('Personalize AI Agent')[0]
        ).toBeInTheDocument()
        expect(screen.getByText('Add knowledge')).toBeInTheDocument()
    })
})
