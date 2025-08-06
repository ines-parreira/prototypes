import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { HelpdeskIntegrationOptions } from '../../types'
import { HandoverHelpdeskDropdown } from '../HandoverHelpdeskDropdown'

const mockIntegrationsMapping = jest.fn(() => {
    return jest.requireActual('../../constants').INTEGRATIONS_MAPPING
})

jest.mock('../../constants', () => ({
    ...jest.requireActual('../../constants'),
    get INTEGRATIONS_MAPPING() {
        return mockIntegrationsMapping()
    },
}))

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
            Object.values(mockIntegrationsMapping)
                .filter((integration) => integration.active)
                .forEach((integration) => {
                    // Use getAllByText since Zendesk appears twice (in dropdown and in list)
                    const elements = screen.getAllByText(integration.label)
                    expect(elements.length).toBeGreaterThan(0)
                })
        })
    })

    it('should call onClick when a helpdesk is selected', async () => {
        const originalConstants = jest.requireActual('../../constants')
        mockIntegrationsMapping.mockReturnValue({
            ...originalConstants.INTEGRATIONS_MAPPING,
            intercom: {
                ...originalConstants.INTEGRATIONS_MAPPING.intercom,
                active: true,
            },
        })

        render(
            <HandoverHelpdeskDropdown
                onClick={mockOnClick}
                selectedThirdParty={HelpdeskIntegrationOptions.ZENDESK}
            />,
        )

        // Click to open the dropdown
        fireEvent.click(screen.getByText('arrow_drop_down'))

        // Click on Intercom option to test selecting a different integration
        await waitFor(() => {
            fireEvent.click(screen.getByText('Intercom'))
        })

        // Check if onClick was called with the correct value and context
        expect(mockOnClick).toHaveBeenCalledWith(
            HelpdeskIntegrationOptions.INTERCOM,
            expect.any(Object),
        )

        mockIntegrationsMapping.mockReturnValue(
            originalConstants.INTEGRATIONS_MAPPING,
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

    it('should be disabled when only one integration is active', () => {
        const originalConstants = jest.requireActual('../../constants')
        mockIntegrationsMapping.mockReturnValue(
            originalConstants.INTEGRATIONS_MAPPING,
        )

        render(
            <HandoverHelpdeskDropdown
                onClick={mockOnClick}
                selectedThirdParty={HelpdeskIntegrationOptions.ZENDESK}
            />,
        )

        const selectBox = screen.getByText('Zendesk')

        expect(selectBox.classList).toContain('isGreyed')

        fireEvent.click(screen.getByText('arrow_drop_down'))

        const zendeskElements = screen.getAllByText('Zendesk')
        expect(zendeskElements).toHaveLength(1) // Only the selected label should be visible
    })
})
