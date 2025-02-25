import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'

import { EmailFormComponent } from '../FormComponents/EmailFormComponent'

// Mock dependencies
jest.mock('launchdarkly-react-client-sdk')

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('state/integrations/selectors', () => ({
    getIntegrationsByTypes: jest.fn(),
}))

type EmailItem = {
    id: number
    email: string
}

jest.mock(
    '../../EmailIntegrationListSelection/EmailIntegrationListSelection',
    () => ({
        EmailIntegrationListSelection: ({
            onSelectionChange,
            emailItems,
        }: {
            selectedIds: number[]
            onSelectionChange: (ids: number[]) => void
            emailItems: EmailItem[]
        }) => (
            <div>
                <p>Email List Selection Component</p>
                <ul>
                    {emailItems.map((item: EmailItem) => (
                        <li key={item.id} data-testid={`email-item-${item.id}`}>
                            {item.email}
                        </li>
                    ))}
                </ul>
                <button onClick={() => onSelectionChange([emailItems[0].id])}>
                    Select Email
                </button>
            </div>
        ),
    }),
)

const mockUseAppSelector = jest.mocked(useAppSelector)
const mockUseFlags = jest.mocked(useFlags)
const mockUpdateValue = jest.fn()

describe('EmailFormComponent', () => {
    const mockEmailIntegrations = [
        { id: 1, meta: { address: 'email1@example.com' } },
        { id: 2, meta: { address: 'email2@example.com' } },
    ]

    const defaultProps = {
        monitoredEmailIntegrations: null,
        updateValue: mockUpdateValue,
    }

    beforeEach(() => {
        mockUseAppSelector.mockReturnValue(mockEmailIntegrations)
        mockUseFlags.mockReturnValue({
            AiAgentChat: false,
        })
        mockUpdateValue.mockClear()
    })

    it('renders the form with default email list and shows required label', () => {
        render(<EmailFormComponent {...defaultProps} isRequired={true} />)

        expect(
            screen.getByText(
                /AI Agent responds to tickets sent to the following email addresses/,
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('email1@example.com')).toBeInTheDocument()
        expect(screen.getByText('email2@example.com')).toBeInTheDocument()
        expect(
            screen.getByText('One or more addresses required.'),
        ).toBeInTheDocument()
    })

    it('displays correct footer message when email is selected', () => {
        const props = {
            ...defaultProps,
            monitoredEmailIntegrations: [
                { id: 1, email: 'email1@example.com' },
            ],
        }

        render(<EmailFormComponent {...props} />)

        expect(
            screen.getByText(
                'Select one or more email addresses for AI Agent to use. It will also reply to contact forms linked to these email addresses.',
            ),
        ).toBeInTheDocument()
    })

    it('calls updateValue when an email integration is selected', () => {
        render(<EmailFormComponent {...defaultProps} />)

        fireEvent.click(screen.getByText('Select Email'))

        expect(mockUpdateValue).toHaveBeenCalledWith(
            'monitoredEmailIntegrations',
            [{ id: 1, email: 'email1@example.com' }],
        )
    })

    it('hides the required label if AiAgentChat feature flag is enabled', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiAgentChat]: true,
        })

        render(<EmailFormComponent {...defaultProps} />)

        expect(
            screen.getByText(
                /AI Agent responds to tickets sent to the following email addresses/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('At least one email is required.'),
        ).not.toBeInTheDocument()
    })

    it('shows an error message when no email is selected and AiAgentChat is disabled and value is required', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiAgentChat]: false,
        })

        render(<EmailFormComponent {...defaultProps} isRequired={true} />)

        expect(
            screen.getByText('One or more addresses required.'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /AI Agent responds to tickets sent to the following email addresses/,
            ),
        ).toBeInTheDocument()
    })
})
