import React from 'react'

import { assumeMock } from '@repo/testing'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'

import ConfigureRoutingBehaviorStep from '../ConfigureRoutingBehaviorStep'

jest.mock('pages/common/components/wizard/hooks/useNavigateWizardSteps')
jest.mock('../RoutingTemplateRadioFieldSet', () => ({
    __esModule: true,
    default: () => (
        <div data-testid="routing-template-radio-field-set">
            RoutingTemplateRadioFieldSet
        </div>
    ),
}))
jest.mock('../VoiceIntegrationOnboardingCancelButton', () => ({
    __esModule: true,
    default: () => <button>Cancel</button>,
}))
jest.mock('../../VoiceFormSubmitButton', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
        <button type="submit">{children}</button>
    ),
}))

const useNavigateWizardStepsMock = assumeMock(useNavigateWizardSteps)

describe('ConfigureRoutingBehaviorStep', () => {
    const mockGoToPreviousStep = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        useNavigateWizardStepsMock.mockReturnValue({
            goToPreviousStep: mockGoToPreviousStep,
            goToNextStep: jest.fn(),
        })
    })

    const renderComponent = () => render(<ConfigureRoutingBehaviorStep />)

    it('should render the component with header and description', () => {
        renderComponent()

        expect(
            screen.getByText('Configure routing behavior'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Choose a routing option to get started. You can customize your call routing settings later in the visual flow builder.',
            ),
        ).toBeInTheDocument()
    })

    it('should render RoutingTemplateRadioFieldSet', () => {
        renderComponent()

        expect(
            screen.getByTestId('routing-template-radio-field-set'),
        ).toBeInTheDocument()
    })

    it('should render Back button', () => {
        renderComponent()

        expect(screen.getByText('Back')).toBeInTheDocument()
    })

    it('should render Cancel button', () => {
        renderComponent()

        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should render submit button with correct text', () => {
        renderComponent()

        expect(screen.getByText('Create voice integration')).toBeInTheDocument()
    })

    it('should call goToPreviousStep when Back button is clicked', async () => {
        renderComponent()

        const backButton = screen.getByText('Back')
        await act(async () => {
            await userEvent.click(backButton)
        })
        await waitFor(() =>
            expect(mockGoToPreviousStep).toHaveBeenCalledTimes(1),
        )
    })
})
