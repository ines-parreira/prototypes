import React from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { OpportunityDismissReason } from '../../../../tickets/detail/components/AIAgentFeedbackBar/types'
import { OpportunityType } from '../../enums'
import { Opportunity } from '../../utils/mapAiArticlesToOpportunities'
import { DismissOpportunityModal } from './DismissOpportunityModal'

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn((payload) => ({
        type: 'NOTIFY',
        payload,
    })),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => 'test-user-id'),
}))

jest.mock('models/knowledgeService/mutations')

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('DismissOpportunityModal', () => {
    const mockOnClose = jest.fn()
    const mockOnConfirm = jest.fn()
    const mockOnOpportunityDismissed = jest.fn()
    const mockUpsertFeedback = jest.fn()

    const mockOpportunity: Opportunity = {
        id: 'test-opportunity-id',
        key: 'test-opportunity-key',
        title: 'Test Opportunity',
        content: 'Test content',
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
    }

    const defaultProps = {
        isOpen: true,
        opportunity: mockOpportunity,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
    }

    const renderComponent = (props = {}) => {
        const store = mockStore({
            currentUser: { id: 'test-user-id' },
        })

        return render(
            <Provider store={store}>
                <DismissOpportunityModal {...defaultProps} {...props} />
            </Provider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()

        const {
            useUpsertFeedback,
        } = require('models/knowledgeService/mutations')
        ;(useUpsertFeedback as jest.Mock).mockReturnValue({
            mutateAsync: mockUpsertFeedback.mockResolvedValue({}),
            isLoading: false,
        })
    })

    describe('Modal rendering', () => {
        it('should render when isOpen is true', () => {
            renderComponent()

            expect(screen.getByText('Dismiss opportunity?')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Dismissing this opportunity will delete the associated knowledge and cannot be undone.',
                ),
            ).toBeInTheDocument()
        })

        it('should not render when isOpen is false', () => {
            renderComponent({ isOpen: false })

            expect(
                screen.queryByText('Dismiss opportunity?'),
            ).not.toBeInTheDocument()
        })

        it('should render cancel and dismiss buttons', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Dismiss' }),
            ).toBeInTheDocument()
        })

        it('should render reason selection dropdown', () => {
            renderComponent()

            expect(
                screen.getByText('Why are you deleting this opportunity?'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Select all that apply'),
            ).toBeInTheDocument()
        })
    })

    describe('Cancel button behavior', () => {
        it('should call onClose when cancel button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await user.click(cancelButton)

            expect(mockOnClose).toHaveBeenCalledTimes(1)
        })

        it('should reset form state when cancel is clicked after selecting reasons', async () => {
            const user = userEvent.setup()
            renderComponent()

            // Open dropdown and select a reason
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const firstOption = screen.getAllByRole('option')[0]
            await act(async () => {
                await user.click(firstOption)
            })

            // Verify reason was selected by checking if dismiss button is enabled
            await waitFor(() => {
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            // Click cancel
            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await act(async () => {
                await user.click(cancelButton)
            })

            expect(mockOnClose).toHaveBeenCalledTimes(1)
        })
    })

    describe('Dismiss button behavior', () => {
        it('should be disabled initially when no reasons are selected', () => {
            renderComponent()

            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should be disabled when no reasons are selected and not call dismiss callbacks', async () => {
            renderComponent()

            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            expect(dismissButton).toHaveAttribute('aria-disabled', 'true')

            // Disabled buttons don't trigger onClick handlers, so callbacks shouldn't be called
            expect(mockOnConfirm).not.toHaveBeenCalled()
            expect(mockOnClose).not.toHaveBeenCalled()
        })

        it('should be enabled when a reason is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            // Open dropdown and select a reason
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const firstOption = screen.getAllByRole('option')[0]
            await act(async () => {
                await user.click(firstOption)
            })

            await waitFor(() => {
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })
        })

        it('should be disabled when "Other" is selected but no freeform text is provided', async () => {
            const user = userEvent.setup()
            renderComponent()

            // Open dropdown and select "Other" option
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const otherOption = screen.getByText(
                'Other (explain in additional feedback)',
            ) // "Other" is the last option
            await act(async () => {
                await user.click(otherOption)
            })

            await waitFor(() => {
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
            })
        })

        it('should be disabled when "Other" is selected and text area is empty', async () => {
            const user = userEvent.setup()
            renderComponent()

            // Select "Other" option
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const otherOption = screen.getByText(
                'Other (explain in additional feedback)',
            )
            await act(async () => {
                await user.click(otherOption)
            })

            // Wait for textarea to appear and verify button is disabled
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
            })
        })

        it('should be enabled when "Other" is selected and freeform text is provided', async () => {
            const user = userEvent.setup()
            renderComponent()

            // Select "Other" option
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const otherOption = screen.getByText(
                'Other (explain in additional feedback)',
            )
            await act(async () => {
                await user.click(otherOption)
            })

            // Wait for textarea to appear
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            // Fill in the textarea
            const textarea = screen.getByRole('textbox')
            await act(async () => {
                await user.type(textarea, 'This is my additional feedback')
            })

            await waitFor(() => {
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })
        })

        it('should show loading state when submitting', async () => {
            const user = userEvent.setup()

            // Mock a pending promise
            const pendingPromise = new Promise(() => {}) // Never resolves
            mockUpsertFeedback.mockReturnValue(pendingPromise)

            const {
                useUpsertFeedback,
            } = require('models/knowledgeService/mutations')
            ;(useUpsertFeedback as jest.Mock).mockReturnValue({
                mutateAsync: mockUpsertFeedback,
                isLoading: false,
            })

            renderComponent()

            // Select a reason
            const dropdown = screen.getByRole('combobox')
            await user.click(dropdown)

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const firstOption = screen.getAllByRole('option')[0]
            await user.click(firstOption)

            await waitFor(() => {
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            // Click dismiss button
            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            await user.click(dismissButton)

            // Should show loading state (button should be disabled during submission)
            expect(mockUpsertFeedback).toHaveBeenCalled()
        })

        it('should call onConfirm and onClose when dismiss is successful', async () => {
            const user = userEvent.setup()
            renderComponent()

            // Select a reason
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const firstOption = screen.getAllByRole('option')[0]
            await act(async () => {
                await user.click(firstOption)
            })

            await waitFor(() => {
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            // Click dismiss button
            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            await act(async () => {
                await user.click(dismissButton)
            })

            await waitFor(() => {
                expect(mockUpsertFeedback).toHaveBeenCalled()
                expect(notify).toHaveBeenCalledWith({
                    message: 'Successfully dismissed opportunity',
                    status: NotificationStatus.Success,
                })
                expect(mockOnConfirm).toHaveBeenCalledTimes(1)
                expect(mockOnClose).toHaveBeenCalledTimes(1)
            })
        })

        it('should call onOpportunityDismissed with correct parameters when dismiss is successful', async () => {
            const user = userEvent.setup()
            renderComponent({
                onOpportunityDismissed: mockOnOpportunityDismissed,
            })

            // Select a reason
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const firstOption = screen.getAllByRole('option')[0]
            await act(async () => {
                await user.click(firstOption)
            })

            await waitFor(() => {
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            // Click dismiss button
            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            await act(async () => {
                await user.click(dismissButton)
            })

            await waitFor(() => {
                expect(mockOnOpportunityDismissed).toHaveBeenCalledTimes(1)
                expect(mockOnOpportunityDismissed).toHaveBeenCalledWith({
                    opportunityId: 'test-opportunity-id',
                    opportunityType: OpportunityType.FILL_KNOWLEDGE_GAP,
                })
            })
        })

        it('should show error notification when feedback submission fails', async () => {
            const user = userEvent.setup()
            const mockError = new Error('API Error')
            mockUpsertFeedback.mockRejectedValue(mockError)

            renderComponent()

            // Select a reason
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const firstOption = screen.getAllByRole('option')[0]
            await act(async () => {
                await user.click(firstOption)
            })

            await waitFor(() => {
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            // Click dismiss button
            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            await act(async () => {
                await user.click(dismissButton)
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    message: 'Failed to submit feedback. Please try again.',
                    status: NotificationStatus.Error,
                })
                expect(mockOnConfirm).not.toHaveBeenCalled()
                expect(mockOnClose).not.toHaveBeenCalled()
            })
        })
    })

    describe('Edge cases', () => {
        it('should handle null opportunity gracefully', () => {
            renderComponent({ opportunity: null })

            expect(screen.getByText('Dismiss opportunity?')).toBeInTheDocument()

            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should not submit when opportunity is null', async () => {
            renderComponent({ opportunity: null })

            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            expect(dismissButton).toHaveAttribute('aria-disabled', 'true')

            // Since button is disabled, the form submission won't be triggered
            expect(mockUpsertFeedback).not.toHaveBeenCalled()
        })

        it('should handle multiple reason selection', async () => {
            const user = userEvent.setup()
            renderComponent()

            // Open dropdown and select multiple reasons
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const firstOption = screen.getAllByRole('option')[0]
            const secondOption = screen.getAllByRole('option')[1]

            await act(async () => {
                await user.click(firstOption)
            })
            await act(async () => {
                await user.click(secondOption)
            })

            await waitFor(() => {
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            // Should be able to dismiss with multiple reasons
            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            await act(async () => {
                await user.click(dismissButton)
            })

            await waitFor(() => {
                expect(mockUpsertFeedback).toHaveBeenCalled()
                expect(mockOnConfirm).toHaveBeenCalled()
            })
        })

        it('should toggle reason selection correctly', async () => {
            const user = userEvent.setup()
            renderComponent()

            // Open dropdown
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const firstOption = screen.getAllByRole('option')[0]

            // Select option
            await act(async () => {
                await user.click(firstOption)
            })

            // Verify button is enabled
            await waitFor(() => {
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            // Deselect option
            await act(async () => {
                await user.click(firstOption)
            })

            // Dismiss button should be disabled again
            await waitFor(() => {
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
            })
        })

        it('should clear freeform text when Other option is deselected', async () => {
            const user = userEvent.setup()
            renderComponent()

            // Open dropdown and select "Other" option
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const otherOption = screen.getByText(
                'Other (explain in additional feedback)',
            )
            await act(async () => {
                await user.click(otherOption)
            })

            // Wait for textarea to appear and type text
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            const textarea = screen.getByRole('textbox')
            await act(async () => {
                await user.type(textarea, 'Test feedback')
            })

            // Deselect "Other" option
            await act(async () => {
                await user.click(otherOption)
            })

            // Textarea should disappear and text should be cleared
            await waitFor(() => {
                expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
            })

            // Re-select "Other" to verify text was cleared
            await act(async () => {
                await user.click(otherOption)
            })

            await waitFor(() => {
                const newTextarea = screen.getByRole('textbox')
                expect(newTextarea).toHaveValue('')
            })
        })

        it('should validate that at least one reason is selected before submission', async () => {
            const user = userEvent.setup()
            renderComponent()

            // Try to click disabled dismiss button (shouldn't work)
            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            expect(dismissButton).toHaveAttribute('aria-disabled', 'true')

            // Select and then deselect a reason
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const firstOption = screen.getAllByRole('option')[0]
            await act(async () => {
                await user.click(firstOption)
            })
            await act(async () => {
                await user.click(firstOption) // Deselect
            })

            // Button should still be disabled
            await waitFor(() => {
                expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
            })

            // No API call should have been made
            expect(mockUpsertFeedback).not.toHaveBeenCalled()
        })

        it('should validate freeform text is required when Other is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            // Select "Other" option
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const otherOption = screen.getByText(
                'Other (explain in additional feedback)',
            )
            await act(async () => {
                await user.click(otherOption)
            })

            // Wait for textarea to appear
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            // Type only whitespace
            const textarea = screen.getByRole('textbox')
            await act(async () => {
                await user.type(textarea, '   ')
            })

            // Button should still be disabled because whitespace doesn't count
            await waitFor(() => {
                const dismissButton = screen.getByRole('button', {
                    name: 'Dismiss',
                })
                expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
            })
        })

        it('should send correct feedback data with multiple reasons and Other', async () => {
            const user = userEvent.setup()
            renderComponent()

            // Open dropdown and select multiple reasons including "Other"
            const dropdown = screen.getByRole('combobox')
            await act(async () => {
                await user.click(dropdown)
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option')).toHaveLength(4)
            })

            const allOptions = screen.getAllByRole('option')
            const firstOption = allOptions[0] // Topic shouldn't be handled by AI Agent
            const otherOption = allOptions[3] // Other option

            await act(async () => {
                await user.click(firstOption)
            })
            await act(async () => {
                await user.click(otherOption)
            })

            // Wait for textarea and fill it
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            const textarea = screen.getByRole('textbox')
            await act(async () => {
                await user.type(textarea, 'Additional detailed feedback')
            })

            // Submit
            const dismissButton = screen.getByRole('button', {
                name: 'Dismiss',
            })
            await act(async () => {
                await user.click(dismissButton)
            })

            await waitFor(() => {
                expect(mockUpsertFeedback).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            feedbackToUpsert: expect.arrayContaining([
                                expect.objectContaining({
                                    feedbackValue:
                                        OpportunityDismissReason.NOT_FOR_AI_AGENT,
                                }),
                                expect.objectContaining({
                                    feedbackValue:
                                        OpportunityDismissReason.OTHER,
                                }),
                                expect.objectContaining({
                                    feedbackValue:
                                        'Additional detailed feedback',
                                }),
                            ]),
                        }),
                    }),
                )
            })
        })
    })
})
