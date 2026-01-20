import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '../../tests/render.utils'
import { CreateAgentStatusModal } from './CreateAgentStatusModal'

describe('CreateAgentStatusModal', () => {
    const mockOnSubmit = vi.fn()
    const mockOnOpenChange = vi.fn()

    const defaultProps = {
        isOpen: true,
        onOpenChange: mockOnOpenChange,
        onSubmit: mockOnSubmit,
        isLoading: false,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render with "Create status" title', () => {
        render(<CreateAgentStatusModal {...defaultProps} />)

        expect(
            screen.getByRole('heading', { name: /Create status/i }),
        ).toBeInTheDocument()
    })

    it('should render "Create status" button', () => {
        render(<CreateAgentStatusModal {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /Create status/i }),
        ).toBeInTheDocument()
    })

    it('should show description text', () => {
        render(<CreateAgentStatusModal {...defaultProps} />)

        expect(
            screen.getByText(/Create a new custom agent unavailable status/i),
        ).toBeInTheDocument()
    })

    it('should call onSubmit with data', async () => {
        const user = userEvent.setup()
        render(<CreateAgentStatusModal {...defaultProps} />)

        const nameInput = screen.getByPlaceholderText('Lunch break')
        await act(() => user.type(nameInput, 'Coffee Break'))

        const submitButton = screen.getByRole('button', {
            name: /Create status/i,
        })
        await act(() => user.click(submitButton))

        expect(mockOnSubmit).toHaveBeenCalledWith({
            name: 'Coffee Break',
            description: '',
            duration_unit: null,
            duration_value: null,
        })
    })

    it('should disable submit button when loading', () => {
        render(<CreateAgentStatusModal {...defaultProps} isLoading={true} />)

        const submitButton = screen.getByRole('button', {
            name: /Create status/i,
        })
        expect(submitButton).toBeDisabled()
    })

    it('should call onOpenChange when cancel is clicked', async () => {
        const user = userEvent.setup()
        render(<CreateAgentStatusModal {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: /Cancel/i })
        await act(() => user.click(cancelButton))

        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should not submit with empty name', async () => {
        const user = userEvent.setup()
        render(<CreateAgentStatusModal {...defaultProps} />)

        const submitButton = screen.getByRole('button', {
            name: /Create status/i,
        })
        await act(() => user.click(submitButton))

        expect(mockOnSubmit).not.toHaveBeenCalled()
    })
})
