import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import useSearch from 'hooks/useSearch'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import { assumeMock } from 'utils/testing'

import AddPhoneNumberStep from '../AddPhoneNumberStep'

jest.mock('hooks/useSearch')
jest.mock('pages/common/components/wizard/hooks/useNavigateWizardSteps')
jest.mock('../VoiceIntegrationOnboardingCancelButton', () => () => (
    <button>Cancel</button>
))

describe('AddPhoneNumberStep', () => {
    const mockGoToNextStep = jest.fn()
    const mockGoToPreviousStep = jest.fn()
    const useNavigateWizardStepsMock = assumeMock(useNavigateWizardSteps)
    const useSearchMock = assumeMock(useSearch)

    beforeEach(() => {
        useNavigateWizardStepsMock.mockReturnValue({
            goToNextStep: mockGoToNextStep,
            goToPreviousStep: mockGoToPreviousStep,
        })
    })

    const renderComponent = () => render(<AddPhoneNumberStep />)

    it('should render the component with phone number id when available', () => {
        useSearchMock.mockReturnValue({ phoneNumberId: '123' })

        renderComponent()

        expect(screen.getByText('Add phone number')).toBeInTheDocument()
        expect(
            screen.getByText('Phone number id 123 selected'),
        ).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should render the component without phone number id when not available', () => {
        useSearchMock.mockReturnValue({ phoneNumberId: undefined })

        renderComponent()

        expect(screen.getByText('Add phone number')).toBeInTheDocument()
        expect(screen.getByText('No phone number id found')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should call goToNextStep when Next button is clicked', () => {
        useSearchMock.mockReturnValue({ phoneNumberId: '123' })

        renderComponent()

        fireEvent.click(screen.getByText('Next'))
        expect(mockGoToNextStep).toHaveBeenCalled()
    })
})
