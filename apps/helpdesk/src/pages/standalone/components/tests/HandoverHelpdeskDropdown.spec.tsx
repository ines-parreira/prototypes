import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { INTEGRATIONS_MAPPING } from '../../constants'
import { HelpdeskIntegrationOptions } from '../../types'
import { HandoverHelpdeskDropdown } from '../HandoverHelpdeskDropdown'

describe('HandoverHelpdeskDropdown', () => {
    const mockOnClick = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with zendesk selected by default', () => {
        render(
            <HandoverHelpdeskDropdown
                onClick={mockOnClick}
                selectedThirdParty={HelpdeskIntegrationOptions.ZENDESK}
            />,
        )

        expect(screen.getByText('Zendesk')).toBeInTheDocument()
    })

    it('should render with selected helpdesk when selectedThirdParty is provided', () => {
        render(
            <HandoverHelpdeskDropdown
                onClick={mockOnClick}
                selectedThirdParty={HelpdeskIntegrationOptions.ZENDESK}
            />,
        )

        expect(screen.getByText('Zendesk')).toBeInTheDocument()
    })

    it('should open dropdown on click', async () => {
        render(
            <HandoverHelpdeskDropdown
                onClick={mockOnClick}
                selectedThirdParty={HelpdeskIntegrationOptions.ZENDESK}
            />,
        )

        // Click to open the dropdown
        fireEvent.click(screen.getByText('arrow_drop_down'))

        // Wait for the dropdown to open
        await waitFor(() => {
            // Check if all helpdesk options are rendered
            Object.values(INTEGRATIONS_MAPPING)
                .filter((integration) => integration.active)
                .forEach((integration) => {
                    // Use getAllByText since Zendesk appears twice (in dropdown and in list)
                    const elements = screen.getAllByText(integration.label)
                    expect(elements.length).toBeGreaterThan(0)
                })
        })
    })

    it('should call onClick when a helpdesk is selected', async () => {
        render(
            <HandoverHelpdeskDropdown
                onClick={mockOnClick}
                selectedThirdParty={HelpdeskIntegrationOptions.ZENDESK}
            />,
        )

        // Click to open the dropdown
        fireEvent.click(screen.getByText('arrow_drop_down'))

        // Click on a helpdesk option
        await waitFor(() => {
            fireEvent.click(screen.getAllByText('Zendesk')[1])
        })

        // Check if onClick was called with the correct value and context
        expect(mockOnClick).toHaveBeenCalledWith(
            HelpdeskIntegrationOptions.ZENDESK,
            expect.any(Object),
        )
    })

    it('should display error when provided', () => {
        const errorMessage = 'Please select a helpdesk'
        render(
            <HandoverHelpdeskDropdown
                onClick={mockOnClick}
                selectedThirdParty={HelpdeskIntegrationOptions.ZENDESK}
                hasError={true}
                error={errorMessage}
            />,
        )

        expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
})
