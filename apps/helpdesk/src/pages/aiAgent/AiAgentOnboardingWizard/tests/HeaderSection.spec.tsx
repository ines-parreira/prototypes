import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { AiAgentChannel, DEFAULT_WIZARD_FORM_VALUES } from '../../constants'
import type { WizardFormValues } from '../../types'
import { HeaderSection } from '../HeaderSection'

describe('HeaderSection', () => {
    const mockHandleFormUpdate = jest.fn()

    const renderComponent = (
        enabledChannels: AiAgentChannel[],
        isValid: boolean,
        shouldDisplayValidationIcon?: boolean,
    ) => {
        const wizard: WizardFormValues = {
            ...DEFAULT_WIZARD_FORM_VALUES,
            enabledChannels,
        }
        return render(
            <HeaderSection
                title={AiAgentChannel.Email} // Example channel
                isValid={isValid}
                wizard={wizard}
                handleFormUpdate={mockHandleFormUpdate}
                shouldDisplayValidationIcon={shouldDisplayValidationIcon}
            />,
        )
    }

    it('should render checkbox with correct checked state', () => {
        // Render with the channel in enabledChannels
        renderComponent([AiAgentChannel.Email], true)
        const checkbox = screen.getByRole('checkbox', {
            name: `select-${AiAgentChannel.Email}`,
        })
        expect(checkbox).toBeChecked()
    })

    it('should render checkbox with correct check state, when channels are not selected ', () => {
        // Render without the channel in enabledChannels
        renderComponent([], true)
        const uncheckedCheckbox = screen.getByRole('checkbox', {
            name: `select-${AiAgentChannel.Email}`,
        })

        expect(uncheckedCheckbox).not.toBeChecked()
    })

    it('should call handleFormUpdate when checkbox is checked', () => {
        renderComponent([], true)

        const checkbox = screen.getByRole('checkbox', {
            name: `select-${AiAgentChannel.Email}`,
        })
        fireEvent.click(checkbox)

        expect(mockHandleFormUpdate).toHaveBeenCalledWith({
            wizard: {
                ...DEFAULT_WIZARD_FORM_VALUES,
                enabledChannels: [AiAgentChannel.Email],
            },
        })
    })

    it('should call handleFormUpdate when checkbox is unchecked', () => {
        renderComponent([AiAgentChannel.Email], true)
        const checkedCheckbox = screen.getByRole('checkbox', {
            name: `select-${AiAgentChannel.Email}`,
        })
        fireEvent.click(checkedCheckbox)

        expect(mockHandleFormUpdate).toHaveBeenCalledWith({
            wizard: { ...DEFAULT_WIZARD_FORM_VALUES, enabledChannels: [] },
        })
    })

    it('should render correct validation icon based on isValid prop', () => {
        // Test when isValid is true
        renderComponent([AiAgentChannel.Email], true, true)
        const checkIcon = screen.getByText('check_circle')
        expect(checkIcon).toBeInTheDocument()
        expect(checkIcon).toHaveClass('valid')

        // Test when isValid is false
        renderComponent([AiAgentChannel.Email], false, true)
        const errorIcon = screen.getByText('error')
        expect(errorIcon).toBeInTheDocument()
        expect(errorIcon).toHaveClass('invalid')
    })
})
