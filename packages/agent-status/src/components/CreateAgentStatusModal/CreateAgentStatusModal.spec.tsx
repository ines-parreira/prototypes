import { act, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DURATION_OPTIONS } from '../../constants'
import { render } from '../../tests/render.utils'
import { CreateAgentStatusModal } from './CreateAgentStatusModal'

/**
 * Helper to get the hidden select element used by Axiom's Select component
 * Axiom Select uses React Aria which renders a hidden native select for accessibility
 */
function getDurationSelect() {
    const container = screen.getByTestId('hidden-select-container')
    return container.querySelector('select')!
}

describe('CreateAgentStatusModal', () => {
    const defaultProps = {
        isOpen: true,
        onOpenChange: vi.fn(),
        onCreate: vi.fn(),
        isLoading: false,
    }

    const renderCreateAgentStatusModal = (
        props?: Partial<typeof defaultProps>,
    ) => {
        return render(<CreateAgentStatusModal {...defaultProps} {...props} />)
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Rendering', () => {
        it('should render modal when open', () => {
            renderCreateAgentStatusModal()

            expect(
                screen.getByRole('heading', { name: 'Create status' }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Create a new custom agent unavailable status/,
                ),
            ).toBeInTheDocument()
        })

        it('should not render modal when closed', () => {
            renderCreateAgentStatusModal({ isOpen: false })

            expect(
                screen.queryByRole('heading', { name: 'Create status' }),
            ).not.toBeInTheDocument()
        })

        it('should render status name input field', () => {
            renderCreateAgentStatusModal()

            const statusInput = screen.getByPlaceholderText('Lunch break')
            expect(statusInput).toBeInTheDocument()
        })

        it('should render description input field', () => {
            renderCreateAgentStatusModal()

            const descriptionInput = screen.getByPlaceholderText(
                'Use when agents take their lunch break',
            )
            expect(descriptionInput).toBeInTheDocument()
        })

        it('should render duration select', () => {
            renderCreateAgentStatusModal()

            expect(screen.getByText('Status duration')).toBeInTheDocument()
            expect(screen.getAllByText('Unlimited').length).toBeGreaterThan(0)
        })

        it('should render action buttons', () => {
            renderCreateAgentStatusModal()

            expect(
                screen.getByRole('button', { name: /Cancel/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Create status/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Form Interactions', () => {
        it('should allow typing in status name field', async () => {
            const { user } = renderCreateAgentStatusModal()

            const statusInput = screen.getByPlaceholderText('Lunch break')

            await act(() => user.type(statusInput, 'Coffee break'))

            expect(statusInput).toHaveValue('Coffee break')
        })

        it('should allow typing in description field', async () => {
            const { user } = renderCreateAgentStatusModal()

            const descriptionInput = screen.getByPlaceholderText(
                'Use when agents take their lunch break',
            )

            await act(() =>
                user.type(descriptionInput, 'Taking a quick coffee break'),
            )

            expect(descriptionInput).toHaveValue('Taking a quick coffee break')
        })

        it('should allow selecting duration from dropdown', async () => {
            const { user } = renderCreateAgentStatusModal()

            const select = getDurationSelect()

            await act(() => user.selectOptions(select, '15-minutes'))

            expect(select).toHaveValue('15-minutes')
        })

        it('should show all duration options', () => {
            renderCreateAgentStatusModal()

            const select = getDurationSelect()
            const options = select.querySelectorAll('option')

            // Should have options for each duration + empty placeholder
            expect(options.length).toBeGreaterThanOrEqual(
                DURATION_OPTIONS.length,
            )
        })

        it('should enforce max length on status name', async () => {
            const { user } = renderCreateAgentStatusModal()

            const statusInput = screen.getByPlaceholderText(
                'Lunch break',
            ) as HTMLInputElement

            const longName = 'A'.repeat(35)
            await act(() => user.type(statusInput, longName))

            expect(statusInput.value.length).toBe(30)
        })
    })

    describe('Form Validation', () => {
        it('should not call onCreate when status name is empty', async () => {
            const onCreate = vi.fn()
            const { user } = renderCreateAgentStatusModal({ onCreate })

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onCreate).not.toHaveBeenCalled()
        })

        it('should allow submission when status name is filled', async () => {
            const onCreate = vi.fn()
            const { user } = renderCreateAgentStatusModal({ onCreate })

            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, 'Lunch break'))

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onCreate).toHaveBeenCalledWith({
                name: 'Lunch break',
                description: '',
                duration_unit: null,
                duration_value: null,
            })
        })

        it('should disable button when loading', () => {
            renderCreateAgentStatusModal({ isLoading: true })

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            expect(createButton).toBeDisabled()
        })

        it('should not call onCreate for whitespace-only names', async () => {
            const onCreate = vi.fn()
            const { user } = renderCreateAgentStatusModal({ onCreate })

            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, '   '))

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onCreate).not.toHaveBeenCalled()
        })
    })

    describe('Form Submission', () => {
        it('should call onCreate with correct data', async () => {
            const onCreate = vi.fn()
            const { user } = renderCreateAgentStatusModal({ onCreate })

            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, 'Coffee break'))

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onCreate).toHaveBeenCalledWith({
                name: 'Coffee break',
                description: '',
                duration_unit: null,
                duration_value: null,
            })
        })

        it('should call onCreate with selected duration', async () => {
            const onCreate = vi.fn()
            const { user } = renderCreateAgentStatusModal({ onCreate })

            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, 'Short break'))

            const select = getDurationSelect()
            await act(() => user.selectOptions(select, '15-minutes'))

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onCreate).toHaveBeenCalledWith({
                name: 'Short break',
                description: '',
                duration_unit: 'minutes',
                duration_value: 15,
            })
        })

        it('should call onCreate with name and description', async () => {
            const onCreate = vi.fn()
            const { user } = renderCreateAgentStatusModal({ onCreate })

            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, 'Meeting'))

            const descriptionInput = screen.getByPlaceholderText(
                'Use when agents take their lunch break',
            )
            await act(() =>
                user.type(
                    descriptionInput,
                    'Client meeting in conference room',
                ),
            )

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onCreate).toHaveBeenCalledWith({
                name: 'Meeting',
                description: 'Client meeting in conference room',
                duration_unit: null,
                duration_value: null,
            })
        })

        it('should not call onCreate when button is disabled by loading', () => {
            const onCreate = vi.fn()
            renderCreateAgentStatusModal({ onCreate, isLoading: true })

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })

            expect(createButton).toBeDisabled()
            expect(onCreate).not.toHaveBeenCalled()
        })
    })

    describe('Modal Close Behavior', () => {
        it('should call onOpenChange when cancel is clicked', async () => {
            const onOpenChange = vi.fn()
            const { user } = renderCreateAgentStatusModal({ onOpenChange })

            const cancelButton = screen.getByRole('button', { name: /Cancel/i })
            await act(() => user.click(cancelButton))

            expect(onOpenChange).toHaveBeenCalledWith(false)
        })
    })

    describe('Duration Selection', () => {
        it('should have Unlimited selected by default', () => {
            renderCreateAgentStatusModal()

            const select = getDurationSelect() as HTMLSelectElement
            expect(select.value).toBe('unlimited')
        })

        it('should allow selecting each duration option', async () => {
            const { user } = renderCreateAgentStatusModal()

            const select = getDurationSelect()

            for (const option of DURATION_OPTIONS) {
                await act(() => user.selectOptions(select, option.id))
                expect(select).toHaveValue(option.id)
            }
        })

        it('should submit with selected duration', async () => {
            const onCreate = vi.fn()
            const { user } = renderCreateAgentStatusModal({ onCreate })

            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, 'Test'))

            const select = getDurationSelect()
            await act(() => user.selectOptions(select, '4-hours'))

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onCreate).toHaveBeenCalledWith({
                name: 'Test',
                description: '',
                duration_unit: 'hours',
                duration_value: 4,
            })
        })
    })

    describe('Edge Cases', () => {
        it('should handle special characters in name', async () => {
            const onCreate = vi.fn()
            const { user } = renderCreateAgentStatusModal({ onCreate })

            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, 'Break (15min) ☕'))

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onCreate).toHaveBeenCalledWith({
                name: 'Break (15min) ☕',
                description: '',
                duration_unit: null,
                duration_value: null,
            })
        })

        it('should handle exactly 30 characters', async () => {
            const onCreate = vi.fn()
            const { user } = renderCreateAgentStatusModal({ onCreate })

            const exactlyThirtyChars = 'A'.repeat(30)
            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, exactlyThirtyChars))

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onCreate).toHaveBeenCalledWith({
                name: exactlyThirtyChars,
                description: '',
                duration_unit: null,
                duration_value: null,
            })
        })
    })

    describe('Accessibility', () => {
        it('should have proper dialog structure', () => {
            renderCreateAgentStatusModal()

            expect(
                screen.getByRole('heading', { name: 'Create status' }),
            ).toBeInTheDocument()
        })

        it('should mark status field as required', () => {
            renderCreateAgentStatusModal()

            const statusInput = screen.getByPlaceholderText('Lunch break')
            expect(statusInput).toBeRequired()
        })

        it('should have accessible buttons', () => {
            renderCreateAgentStatusModal()

            expect(
                screen.getByRole('button', { name: /Cancel/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Create status/i }),
            ).toBeInTheDocument()
        })
    })
})
