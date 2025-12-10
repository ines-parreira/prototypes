import { assumeMock, userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { renderWithRouter } from 'utils/testing'

import AIAutofill from '../AIAutofill'

jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

describe('<AIAutofill/>', () => {
    const defaultProps = {
        value: false,
        onChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render correctly when user has access - shows manage link, enabled checkbox, no upgrade badge', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        renderWithRouter(<AIAutofill {...defaultProps} />)

        // Visual checks - all content is present
        expect(screen.getByText('AI Autofill')).toBeInTheDocument()
        expect(
            screen.getByText(
                /Let AI Agent autofill this ticket field\. Manage/,
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('AI Agent settings')).toBeInTheDocument()

        // Checkbox is enabled
        const checkbox = screen.getByRole('checkbox', {
            name: /Autofill ticket field/,
        })
        expect(checkbox).toBeEnabled()
        expect(checkbox).not.toBeChecked()

        // No upgrade badge
        expect(screen.queryByText(/Upgrade/i)).not.toBeInTheDocument()

        // No "Learn more" text
        expect(
            screen.queryByText(/Learn more about AI Agent/),
        ).not.toBeInTheDocument()
    })

    it('should render correctly when user has no access - shows upgrade badge, learn more link, disabled checkbox', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        renderWithRouter(<AIAutofill {...defaultProps} />)

        // Visual checks - all content is present
        expect(screen.getByText('AI Autofill')).toBeInTheDocument()
        expect(
            screen.getByText(/Let AI Agent autofill this ticket field/),
        ).toBeInTheDocument()

        // Shows upgrade badge with icon
        expect(screen.getByText(/Upgrade/i)).toBeInTheDocument()

        // Shows "Learn more" link text
        expect(
            screen.getByText(/Learn more about AI Agent/),
        ).toBeInTheDocument()

        // Checkbox is disabled
        const checkbox = screen.getByRole('checkbox', {
            name: /Autofill ticket field/,
        })
        expect(checkbox).toBeDisabled()
        expect(checkbox).not.toBeChecked()

        // No "AI Agent settings" text (which is used in the "with access" version)
        expect(screen.queryByText(/AI Agent settings/)).not.toBeInTheDocument()
    })

    it('should call onChange when checkbox is toggled and user has access', async () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        const onChange = jest.fn()
        renderWithRouter(
            <AIAutofill {...defaultProps} onChange={onChange} value={false} />,
        )

        const checkbox = screen.getByRole('checkbox', {
            name: /Autofill ticket field/,
        })

        await userEvent.click(checkbox)

        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith(true)
    })
})
