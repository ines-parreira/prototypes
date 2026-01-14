import { Form } from '@repo/forms'
import { act, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Modal, ModalSize, OverlayHeader } from '@gorgias/axiom'

import { DURATION_OPTIONS, VALIDATION } from '../../constants'
import { render } from '../../tests/render.utils'
import { AgentStatusFormContent } from './AgentStatusFormContent'

/**
 * Helper to get the hidden select element used by Axiom's Select component
 */
function getDurationSelect() {
    const container = screen.getByTestId('hidden-select-container')
    return container.querySelector('select')!
}

describe('AgentStatusFormContent', () => {
    const defaultProps = {
        isLoading: false,
        onCancel: vi.fn(),
    }

    const renderAgentStatusFormContent = (
        props?: Partial<typeof defaultProps>,
    ) => {
        const onSubmit = vi.fn()
        const onOpenChange = vi.fn()

        return {
            onSubmit,
            ...render(
                <Modal
                    isOpen={true}
                    onOpenChange={onOpenChange}
                    size={ModalSize.Md}
                >
                    <Form
                        defaultValues={{
                            name: '',
                            description: '',
                            durationOption: DURATION_OPTIONS[0],
                            customDurationUnit: 'minutes',
                            customDurationValue: 1,
                        }}
                        onValidSubmit={onSubmit}
                    >
                        <OverlayHeader title="Test Modal" />
                        <AgentStatusFormContent {...defaultProps} {...props} />
                    </Form>
                </Modal>,
            ),
        }
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Rendering', () => {
        it('should render descriptive text', () => {
            renderAgentStatusFormContent()

            expect(
                screen.getByText(
                    /Create a new custom agent unavailable status/i,
                ),
            ).toBeInTheDocument()
        })

        it('should render status name field with required indicator', () => {
            renderAgentStatusFormContent()

            const statusInput = screen.getByPlaceholderText('Lunch break')
            expect(statusInput).toBeInTheDocument()
            expect(statusInput).toBeRequired()
        })

        it('should render description field', () => {
            renderAgentStatusFormContent()

            const descriptionInput = screen.getByPlaceholderText(
                'Use when agents take their lunch break',
            )
            expect(descriptionInput).toBeInTheDocument()
            expect(descriptionInput).not.toBeRequired()
        })

        it('should render duration select field', () => {
            renderAgentStatusFormContent()

            expect(screen.getByText('Status duration')).toBeInTheDocument()
            const select = getDurationSelect()
            expect(select).toBeInTheDocument()
        })

        it('should render cancel button', () => {
            renderAgentStatusFormContent()

            expect(
                screen.getByRole('button', { name: /Cancel/i }),
            ).toBeInTheDocument()
        })

        it('should render create status button', () => {
            renderAgentStatusFormContent()

            expect(
                screen.getByRole('button', { name: /Create status/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Form Fields', () => {
        it('should allow typing in status name field', async () => {
            const { user } = renderAgentStatusFormContent()

            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, 'Coffee break'))

            expect(statusInput).toHaveValue('Coffee break')
        })

        it('should allow typing in description field', async () => {
            const { user } = renderAgentStatusFormContent()

            const descriptionInput = screen.getByPlaceholderText(
                'Use when agents take their lunch break',
            )
            await act(() => user.type(descriptionInput, 'Quick coffee break'))

            expect(descriptionInput).toHaveValue('Quick coffee break')
        })

        it('should allow selecting duration option', async () => {
            const { user } = renderAgentStatusFormContent()

            const select = getDurationSelect()
            await act(() => user.selectOptions(select, '15-minutes'))

            expect(select).toHaveValue('15-minutes')
        })

        it('should enforce max length on status name', async () => {
            const { user } = renderAgentStatusFormContent()

            const statusInput = screen.getByPlaceholderText(
                'Lunch break',
            ) as HTMLInputElement

            const longName = 'A'.repeat(VALIDATION.NAME_MAX_LENGTH + 10)
            await act(() => user.type(statusInput, longName))

            expect(statusInput.value.length).toBe(VALIDATION.NAME_MAX_LENGTH)
        })
    })

    describe('Button States', () => {
        it('should call onCancel when cancel button is clicked', async () => {
            const onCancel = vi.fn()
            const { user } = renderAgentStatusFormContent({ onCancel })

            const cancelButton = screen.getByRole('button', { name: /Cancel/i })
            await act(() => user.click(cancelButton))

            expect(onCancel).toHaveBeenCalledOnce()
        })

        it('should disable create button when isLoading is true', () => {
            renderAgentStatusFormContent({ isLoading: true })

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            expect(createButton).toBeDisabled()
        })

        it('should enable create button when isLoading is false', () => {
            renderAgentStatusFormContent({ isLoading: false })

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            expect(createButton).not.toBeDisabled()
        })
    })

    describe('Form Submission', () => {
        it('should submit form with status name and duration', async () => {
            const { user, onSubmit } = renderAgentStatusFormContent()

            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, 'Lunch break'))

            const select = getDurationSelect()
            await act(() => user.selectOptions(select, '1-hour'))

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Lunch break',
                    description: '',
                    durationOption: DURATION_OPTIONS.find(
                        (opt) => opt.id === '1-hour',
                    ),
                }),
                expect.anything(),
            )
        })

        it('should submit form with all fields filled', async () => {
            const { user, onSubmit } = renderAgentStatusFormContent()

            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, 'Team meeting'))

            const descriptionInput = screen.getByPlaceholderText(
                'Use when agents take their lunch break',
            )
            await act(() =>
                user.type(descriptionInput, 'Weekly team sync meeting'),
            )

            const select = getDurationSelect()
            await act(() => user.selectOptions(select, '4-hours'))

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Team meeting',
                    description: 'Weekly team sync meeting',
                    durationOption: DURATION_OPTIONS.find(
                        (opt) => opt.id === '4-hours',
                    ),
                }),
                expect.anything(),
            )
        })
    })

    describe('Custom Duration', () => {
        function getCustomValueInput() {
            const inputs = screen.getAllByRole('textbox')
            return inputs.find(
                (input) => input.getAttribute('inputMode') === 'numeric',
            )
        }

        function getUnitSelect() {
            const containers = screen.getAllByTestId('hidden-select-container')
            return containers[1]?.querySelector('select')
        }

        it('should not show custom duration fields by default', () => {
            renderAgentStatusFormContent()

            expect(getCustomValueInput()).toBeUndefined()
            expect(getUnitSelect()).toBeUndefined()
        })

        it('should show custom duration fields when Custom is selected', async () => {
            const { user } = renderAgentStatusFormContent()

            const durationSelect = getDurationSelect()
            await act(() => user.selectOptions(durationSelect, 'custom'))

            expect(getCustomValueInput()).toBeInTheDocument()
            expect(getUnitSelect()).toBeInTheDocument()
        })

        it('should hide custom fields when switching back to preset', async () => {
            const { user } = renderAgentStatusFormContent()

            const durationSelect = getDurationSelect()
            await act(() => user.selectOptions(durationSelect, 'custom'))

            expect(getCustomValueInput()).toBeInTheDocument()

            await act(() => user.selectOptions(durationSelect, 'unlimited'))

            expect(getCustomValueInput()).toBeUndefined()
        })

        it('should submit with custom duration values', async () => {
            const { user, onSubmit } = renderAgentStatusFormContent()

            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, 'Custom break'))

            const durationSelect = getDurationSelect()
            await act(() => user.selectOptions(durationSelect, 'custom'))

            const valueInput = getCustomValueInput()!
            await act(() => user.clear(valueInput))
            await act(() => user.type(valueInput, '45'))

            const unitSelect = getUnitSelect()!
            await act(() => user.selectOptions(unitSelect, 'minutes'))

            const submitButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(submitButton))

            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Custom break',
                    customDurationUnit: 'minutes',
                    customDurationValue: 45,
                }),
                expect.anything(),
            )
        })
    })
})
