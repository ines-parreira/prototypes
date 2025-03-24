import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import { assumeMock } from 'utils/testing'

import ConfigureCallFlowStep from '../ConfigureCallFlowStep'

jest.mock('pages/common/components/wizard/hooks/useNavigateWizardSteps')

describe('ConfigureCallFlowStep', () => {
    const mockGoToPreviousStep = jest.fn()
    const mockGoToNextStep = jest.fn()
    const useNavigateWizardStepsMock = assumeMock(useNavigateWizardSteps)

    beforeEach(() => {
        useNavigateWizardStepsMock.mockReturnValue({
            goToPreviousStep: mockGoToPreviousStep,
            goToNextStep: mockGoToNextStep,
        })
    })

    const renderComponent = () => render(<ConfigureCallFlowStep />)

    it('should render the component', () => {
        renderComponent()

        expect(screen.getByText('Configure call flow')).toBeInTheDocument()
        expect(screen.getByText('Back')).toBeInTheDocument()
        expect(screen.getByText('Create phone integration')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should call goToPreviousStep when Back button is clicked', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Back'))
        expect(mockGoToPreviousStep).toHaveBeenCalled()
    })
})
