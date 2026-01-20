import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '../../tests/render.utils'
import type { AgentStatusWithSystem } from '../../types'
import { EditAgentStatusModal } from './EditAgentStatusModal'

function getDurationSelect() {
    const containers = screen.getAllByTestId('hidden-select-container')
    return containers[0].querySelector('select')!
}

const mockStatus: AgentStatusWithSystem = {
    id: '123',
    name: 'Lunch Break',
    description: 'Taking lunch',
    duration_unit: 'minutes',
    duration_value: 30,
    created_datetime: '2024-01-01T00:00:00Z',
    updated_datetime: '2024-01-01T00:00:00Z',
    is_system: false,
}

describe('EditAgentStatusModal', () => {
    const mockOnSubmit = vi.fn()
    const mockOnOpenChange = vi.fn()

    const defaultProps = {
        isOpen: true,
        onOpenChange: mockOnOpenChange,
        status: mockStatus,
        onSubmit: mockOnSubmit,
        isLoading: false,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render with "Edit status" title', () => {
        render(<EditAgentStatusModal {...defaultProps} />)

        expect(
            screen.getByRole('heading', { name: /Edit status/i }),
        ).toBeInTheDocument()
    })

    it('should render "Save changes" button', () => {
        render(<EditAgentStatusModal {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /Save changes/i }),
        ).toBeInTheDocument()
    })

    it('should not show description text', () => {
        render(<EditAgentStatusModal {...defaultProps} />)

        expect(
            screen.queryByText(/Create a new custom agent unavailable status/i),
        ).not.toBeInTheDocument()
    })

    it('should pre-populate form fields with status data', () => {
        render(<EditAgentStatusModal {...defaultProps} />)

        const nameInput = screen.getByPlaceholderText('Lunch break')
        const descriptionInput = screen.getByPlaceholderText(
            'Use when agents take their lunch break',
        )
        const durationSelect = getDurationSelect()

        expect(nameInput).toHaveValue('Lunch Break')
        expect(descriptionInput).toHaveValue('Taking lunch')
        expect(durationSelect.value).toBe('30-minutes')
    })

    it('should call onSubmit with data and status', async () => {
        const user = userEvent.setup()
        render(<EditAgentStatusModal {...defaultProps} />)

        const nameInput = screen.getByPlaceholderText('Lunch break')
        await act(() => user.clear(nameInput))
        await act(() => user.type(nameInput, 'Updated Name'))

        const submitButton = screen.getByRole('button', {
            name: /Save changes/i,
        })
        await act(() => user.click(submitButton))

        expect(mockOnSubmit).toHaveBeenCalledWith(
            {
                name: 'Updated Name',
                description: 'Taking lunch',
                duration_unit: 'minutes',
                duration_value: 30,
            },
            mockStatus,
        )
    })

    it('should disable submit button when loading', () => {
        render(<EditAgentStatusModal {...defaultProps} isLoading={true} />)

        const submitButton = screen.getByRole('button', {
            name: /Save changes/i,
        })
        expect(submitButton).toBeDisabled()
    })

    it('should call onOpenChange when cancel is clicked', async () => {
        const user = userEvent.setup()
        render(<EditAgentStatusModal {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: /Cancel/i })
        await act(() => user.click(cancelButton))

        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should not submit with empty name', async () => {
        const user = userEvent.setup()
        render(<EditAgentStatusModal {...defaultProps} />)

        const nameInput = screen.getByPlaceholderText('Lunch break')
        await act(() => user.clear(nameInput))

        const submitButton = screen.getByRole('button', {
            name: /Save changes/i,
        })
        await act(() => user.click(submitButton))

        expect(mockOnSubmit).not.toHaveBeenCalled()
    })
})
