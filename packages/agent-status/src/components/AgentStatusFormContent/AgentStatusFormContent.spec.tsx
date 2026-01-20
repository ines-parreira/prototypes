import { Form } from '@repo/forms'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Modal, ModalSize } from '@gorgias/axiom'

import { DURATION_OPTIONS } from '../../constants'
import type { AgentStatusFormValues } from '../../hooks/useAgentStatusFormDefaults'
import { render } from '../../tests/render.utils'
import { AgentStatusFormContent } from './AgentStatusFormContent'

function renderFormContent(props: {
    isLoading?: boolean
    onCancel?: () => void
    submitButtonText?: string
    description?: string
    defaultValues?: Partial<AgentStatusFormValues>
    onSubmit?: (data: AgentStatusFormValues) => void
}) {
    const {
        isLoading = false,
        onCancel = vi.fn(),
        submitButtonText = 'Submit',
        description,
        defaultValues = {
            name: '',
            description: '',
            durationOption: DURATION_OPTIONS[0],
            customDurationValue: 1,
            customDurationUnit: 'hours',
        },
        onSubmit = vi.fn(),
    } = props

    return render(
        <Modal isOpen={true} onOpenChange={vi.fn()} size={ModalSize.Md}>
            <Form<AgentStatusFormValues>
                defaultValues={defaultValues}
                onValidSubmit={onSubmit}
            >
                <AgentStatusFormContent
                    isLoading={isLoading}
                    onCancel={onCancel}
                    submitButtonText={submitButtonText}
                    description={description}
                />
            </Form>
        </Modal>,
    )
}

describe('AgentStatusFormContent', () => {
    describe('Basic rendering', () => {
        it('should render name and description fields', () => {
            renderFormContent({})

            expect(
                screen.getByPlaceholderText('Lunch break'),
            ).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText(
                    'Use when agents take their lunch break',
                ),
            ).toBeInTheDocument()
        })

        it('should render duration select', () => {
            renderFormContent({})

            const durationSelect = screen.getByTestId('hidden-select-container')
            expect(durationSelect).toBeInTheDocument()
        })

        it('should render submit button with provided text', () => {
            renderFormContent({ submitButtonText: 'Create status' })

            expect(
                screen.getByRole('button', { name: /Create status/i }),
            ).toBeInTheDocument()
        })

        it('should render cancel button', () => {
            renderFormContent({})

            expect(
                screen.getByRole('button', { name: /Cancel/i }),
            ).toBeInTheDocument()
        })

        it('should render description when provided', () => {
            renderFormContent({
                description: 'Create a new custom agent unavailable status',
            })

            expect(
                screen.getByText(
                    /Create a new custom agent unavailable status/i,
                ),
            ).toBeInTheDocument()
        })

        it('should not render description when not provided', () => {
            renderFormContent({ description: undefined })

            expect(
                screen.queryByText(
                    /Create a new custom agent unavailable status/i,
                ),
            ).not.toBeInTheDocument()
        })
    })

    describe('Custom duration fields', () => {
        it('should not show custom duration fields when unlimited is selected', () => {
            renderFormContent({
                defaultValues: {
                    name: '',
                    description: '',
                    durationOption: DURATION_OPTIONS[0], // Unlimited
                },
            })

            expect(
                document.querySelector('#custom-duration-value'),
            ).not.toBeInTheDocument()
        })

        it('should not show custom duration fields when preset option is selected', () => {
            renderFormContent({
                defaultValues: {
                    name: '',
                    description: '',
                    durationOption: DURATION_OPTIONS[1], // 15 minutes
                },
            })

            expect(
                document.querySelector('#custom-duration-value'),
            ).not.toBeInTheDocument()
        })

        it('should show custom duration fields when custom option is selected', () => {
            const customOption = DURATION_OPTIONS[DURATION_OPTIONS.length - 1]
            renderFormContent({
                defaultValues: {
                    name: '',
                    description: '',
                    durationOption: customOption,
                    customDurationValue: 2,
                    customDurationUnit: 'hours',
                },
            })

            expect(
                document.querySelector('#custom-duration-value'),
            ).toBeInTheDocument()
        })
    })

    describe('Button states', () => {
        it('should disable submit button when loading', () => {
            renderFormContent({ isLoading: true, submitButtonText: 'Submit' })

            const submitButton = screen.getByRole('button', { name: /Submit/i })
            expect(submitButton).toBeDisabled()
        })

        it('should not disable cancel button when loading', () => {
            renderFormContent({ isLoading: true })

            const cancelButton = screen.getByRole('button', { name: /Cancel/i })
            expect(cancelButton).not.toBeDisabled()
        })
    })

    describe('User interactions', () => {
        it('should call onCancel when cancel button is clicked', async () => {
            const user = userEvent.setup()
            const onCancel = vi.fn()
            renderFormContent({ onCancel })

            const cancelButton = screen.getByRole('button', { name: /Cancel/i })
            await act(() => user.click(cancelButton))

            expect(onCancel).toHaveBeenCalled()
        })
    })
})
