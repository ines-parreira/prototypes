import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { mockStore } from 'utils/testing'

import {
    AIAgentPaywallSetup,
    AiAgentPaywallSetupProps,
} from '../AIAgentPaywallSetup'

const defaultProps = {
    onOnboardingWizardClick: jest.fn(),
    isLoading: false,
    isOnUpdateOnboardingWizard: false,
}

const renderComponent = (props: AiAgentPaywallSetupProps = defaultProps) =>
    render(
        <Provider store={mockStore({})}>
            <AIAgentPaywallSetup {...props} />
        </Provider>,
    )

describe('<AIAgentPaywallSetup />', () => {
    it('should render the sales paywall component', () => {
        renderComponent()

        expect(screen.getByText(/Set Up AI Agent/)).toBeInTheDocument()
        expect(screen.queryByText(/Continue Setup/)).not.toBeInTheDocument()
        expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('should display Support tab by default', () => {
        renderComponent()

        expect(screen.getAllByRole('radio')[0]).toBeChecked()
    })

    it('should change image to Sales when the corresponding option is selected', async () => {
        renderComponent()

        await userEvent.click(screen.getByText('Sales'))

        expect(screen.getAllByRole('radio')[1]).toBeChecked()
    })

    it('should render the text to continue on the CTA', () => {
        renderComponent({ ...defaultProps, isOnUpdateOnboardingWizard: true })

        expect(screen.queryByText(/Set Up AI Agent/)).not.toBeInTheDocument()
        expect(screen.getByText(/Continue Setup/)).toBeInTheDocument()
    })

    it('should render the CTA disabled when loading', () => {
        renderComponent({ ...defaultProps, isLoading: true })

        expect(screen.queryByText(/Set Up AI Agent/)).toBeAriaDisabled()
    })
})
