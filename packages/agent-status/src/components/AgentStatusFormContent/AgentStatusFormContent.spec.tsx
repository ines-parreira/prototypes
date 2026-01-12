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
                {
                    name: 'Lunch break',
                    description: '',
                    durationOption: DURATION_OPTIONS.find(
                        (opt) => opt.id === '1-hour',
                    ),
                },
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
                {
                    name: 'Team meeting',
                    description: 'Weekly team sync meeting',
                    durationOption: DURATION_OPTIONS.find(
                        (opt) => opt.id === '4-hours',
                    ),
                },
                expect.anything(),
            )
        })
    })

    describe('Duration Options', () => {
        it('should have Unlimited selected by default', () => {
            renderAgentStatusFormContent()

            const select = getDurationSelect() as HTMLSelectElement
            expect(select.value).toBe('unlimited')
        })

        it('should show all duration options', () => {
            renderAgentStatusFormContent()

            const select = getDurationSelect()
            const options = select.querySelectorAll('option')

            expect(options.length).toBeGreaterThanOrEqual(
                DURATION_OPTIONS.length,
            )

            DURATION_OPTIONS.forEach((option) => {
                const optionElement = Array.from(options).find(
                    (opt) => opt.value === option.id,
                )
                expect(optionElement).toBeDefined()
                expect(optionElement?.textContent).toBe(option.name)
            })
        })

        it('should allow selecting each duration option', async () => {
            const { user } = renderAgentStatusFormContent()

            const select = getDurationSelect()

            for (const option of DURATION_OPTIONS) {
                await act(() => user.selectOptions(select, option.id))
                expect(select).toHaveValue(option.id)
            }
        })
    })

    describe('Accessibility', () => {
        it('should have accessible form labels', () => {
            renderAgentStatusFormContent()

            expect(screen.getByText('Status')).toBeInTheDocument()
            expect(screen.getByText('Description')).toBeInTheDocument()
            expect(screen.getByText('Status duration')).toBeInTheDocument()
        })

        it('should have accessible buttons', () => {
            renderAgentStatusFormContent()

            expect(
                screen.getByRole('button', { name: /Cancel/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Create status/i }),
            ).toBeInTheDocument()
        })

        it('should mark required field appropriately', () => {
            renderAgentStatusFormContent()

            const statusInput = screen.getByPlaceholderText('Lunch break')
            expect(statusInput).toBeRequired()

            const descriptionInput = screen.getByPlaceholderText(
                'Use when agents take their lunch break',
            )
            expect(descriptionInput).not.toBeRequired()
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty status name', async () => {
            const { user, onSubmit } = renderAgentStatusFormContent()

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onSubmit).not.toHaveBeenCalled()
        })

        it('should handle special characters in status name', async () => {
            const { user } = renderAgentStatusFormContent()

            const statusInput = screen.getByPlaceholderText('Lunch break')
            const specialName = 'Break (15min) ☕'
            await act(() => user.type(statusInput, specialName))

            expect(statusInput).toHaveValue(specialName)
        })

        it('should handle exactly max length status name', async () => {
            const { user, onSubmit } = renderAgentStatusFormContent()

            const exactMaxName = 'A'.repeat(VALIDATION.NAME_MAX_LENGTH)
            const statusInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.type(statusInput, exactMaxName))

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })
            await act(() => user.click(createButton))

            expect(onSubmit).toHaveBeenCalledWith(
                {
                    name: exactMaxName,
                    description: '',
                    durationOption: DURATION_OPTIONS[0],
                },
                expect.anything(),
            )
        })
    })
})
