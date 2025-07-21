import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import VoiceIntegrationOnboarding from '../VoiceIntegrationOnboarding'

jest.mock('../AddPhoneNumberStep', () =>
    jest.fn(({ onCreateNewNumber }) => (
        <div>
            AddPhoneNumberStep
            <button onClick={() => onCreateNewNumber()}>CREATE_BUTTON</button>
        </div>
    )),
)
jest.mock('../ConfigureRoutingBehaviorStep', () =>
    jest.fn(() => <div>ConfigureRoutingBehaviorStep</div>),
)
jest.mock('../VoiceIntegrationOnboardingForm', () =>
    jest.fn(({ children }) => <div>{children}</div>),
)
jest.mock('../VoiceIntegrationOnboardingUnsavedChangesPrompt', () =>
    jest.fn(({ hasNewPhoneNumber }) => (
        <div>
            <div>VoiceIntegrationOnboardingUnsavedChangesPrompt</div>
            <div>
                {hasNewPhoneNumber
                    ? 'has new phone number'
                    : 'no new phone number'}
            </div>
        </div>
    )),
)

describe('VoiceIntegrationOnboarding', () => {
    const renderComponent = () => render(<VoiceIntegrationOnboarding />)

    it('should display both steps in the progress header', () => {
        renderComponent()

        expect(screen.getByText('Add phone number')).toBeInTheDocument()
        expect(
            screen.getByText('Configure routing behavior'),
        ).toBeInTheDocument()
    })

    it('should display first step by default', () => {
        renderComponent()

        expect(screen.getByText('AddPhoneNumberStep')).toBeInTheDocument()
        expect(
            screen.queryByText('ConfigureRoutingBehaviorStep'),
        ).not.toBeInTheDocument()
    })

    it('should render the unsaved changes prompt with correct props when a new phone number is created', () => {
        renderComponent()

        fireEvent.click(screen.getByText('CREATE_BUTTON'))

        expect(
            screen.getByText('VoiceIntegrationOnboardingUnsavedChangesPrompt'),
        ).toBeInTheDocument()
        expect(screen.getByText('has new phone number')).toBeInTheDocument()
    })
})
