import React from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { Opportunity } from 'pages/aiAgent/opportunities/types'
import { ResourceType } from 'pages/aiAgent/opportunities/types'

import { OpportunityDismissReason } from '../../../../tickets/detail/components/AIAgentFeedbackBar/types'
import { OpportunityType } from '../../enums'
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

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('DismissOpportunityModal', () => {
    const mockOnClose = jest.fn()
    const mockOnConfirm = jest.fn()

    const mockOpportunity: Opportunity = {
        id: 'test-opportunity-id',
        key: 'test-opportunity-key',
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
        insight: 'Test Opportunity',
        resources: [
            {
                title: 'Test Opportunity',
                content: 'Test content',
                type: ResourceType.GUIDANCE,
                isVisible: true,
            },
        ],
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
    })

    describe('Modal rendering', () => {
        it('should render knowledge gap modal when isOpen is true', () => {
            renderComponent()

            expect(screen.getByText('Dismiss opportunity?')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Dismissing this knowledge gap opportunity will delete the generated Guidance and cannot be undone.',
                ),
            ).toBeInTheDocument()
        })

        it('should render knowledge conflict modal with correct title and description', () => {
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }
            renderComponent({ opportunity: conflictOpportunity })

            expect(
                screen.getByText('Dismiss knowledge conflict opportunity?'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Dismissing this knowledge conflict cannot be undone.',
                ),
            ).toBeInTheDocument()
        })

        it('should not render when isOpen is false', () => {
            renderComponent({ isOpen: false })

            expect(
                screen.queryByText('Dismiss opportunity?'),
            ).not.toBeInTheDocument()
        })

        it('should render dismiss button', () => {
            renderComponent()

            const dismissButtons = screen.getAllByRole('button', {
                name: 'Dismiss',
                hidden: true,
            })
            expect(dismissButtons.length).toBeGreaterThan(0)
        })

        it('should render 4 checkboxes for knowledge gap opportunities', () => {
            renderComponent()

            expect(
                screen.getByText('Why are you dismissing this opportunity?'),
            ).toBeInTheDocument()

            const checkboxes = screen.getAllByRole('checkbox')
            expect(checkboxes).toHaveLength(4)
            expect(
                screen.getByText("Topic shouldn't be handled by AI"),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Knowledge for this topic already exists'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Opportunity is irrelevant'),
            ).toBeInTheDocument()
            expect(screen.getByText('Other')).toBeInTheDocument()
        })

        it('should render 3 checkboxes for knowledge conflict opportunities', () => {
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }
            renderComponent({ opportunity: conflictOpportunity })

            expect(
                screen.getByText('Why are you dismissing this opportunity?'),
            ).toBeInTheDocument()

            const checkboxes = screen.getAllByRole('checkbox')
            expect(checkboxes).toHaveLength(3)
            expect(
                screen.getByText('Knowledge is intentionally different'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Knowledge items are actually saying the same thing',
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('Other')).toBeInTheDocument()
        })
    })

    describe('Dismiss button behavior', () => {
        it('should be disabled initially when no reasons are selected', () => {
            renderComponent()

            const dismissButton = screen.getAllByRole('button', {
                name: 'Dismiss',
            })[1]
            expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should be enabled when a reason is selected', async () => {
            const user = userEvent.setup({ delay: null })
            renderComponent()

            const firstCheckbox = screen.getAllByRole('checkbox')[0]
            await act(() => user.click(firstCheckbox))

            await waitFor(() => {
                const dismissButton = screen.getAllByRole('button', {
                    name: 'Dismiss',
                })[1]
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })
        })

        it('should be disabled when "Other" is selected and text area is empty for knowledge gaps', async () => {
            const user = userEvent.setup({ delay: null })
            renderComponent()

            const otherCheckbox = screen.getAllByRole('checkbox')[3]
            await act(() => user.click(otherCheckbox))

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
                const dismissButton = screen.getAllByRole('button', {
                    name: 'Dismiss',
                })[1]
                expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
            })
        })

        it('should be disabled when "Other" is selected and text area is empty for knowledge conflicts', async () => {
            const user = userEvent.setup({ delay: null })
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }
            renderComponent({ opportunity: conflictOpportunity })

            const otherCheckbox = screen.getAllByRole('checkbox')[2]
            await act(() => user.click(otherCheckbox))

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
                const dismissButton = screen.getAllByRole('button', {
                    name: 'Dismiss',
                })[1]
                expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
            })
        })

        it('should be enabled when "Other" is selected and freeform text is provided', async () => {
            const user = userEvent.setup({ delay: null })
            renderComponent()

            const otherCheckbox = screen.getAllByRole('checkbox')[3]
            await act(() => user.click(otherCheckbox))

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            const textarea = screen.getByRole('textbox')
            await act(() =>
                user.type(textarea, 'This is my additional feedback'),
            )

            await waitFor(() => {
                const dismissButton = screen.getAllByRole('button', {
                    name: 'Dismiss',
                })[1]
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })
        })

        it('should call onConfirm with feedback data and onClose when dismiss is confirmed', async () => {
            const user = userEvent.setup({ delay: null })
            renderComponent()

            const firstCheckbox = screen.getAllByRole('checkbox')[0]
            await act(() => user.click(firstCheckbox))

            await waitFor(() => {
                const dismissButton = screen.getAllByRole('button', {
                    name: 'Dismiss',
                })[1]
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            const dismissButton = screen.getAllByRole('button', {
                name: 'Dismiss',
            })[1]
            await act(() => user.click(dismissButton))

            expect(mockOnConfirm).toHaveBeenCalledTimes(1)
            expect(mockOnConfirm).toHaveBeenCalledWith(
                expect.objectContaining({
                    feedbackToUpsert: expect.arrayContaining([
                        expect.objectContaining({
                            feedbackValue:
                                OpportunityDismissReason.NOT_FOR_AI_AGENT,
                        }),
                    ]),
                }),
            )
            expect(mockOnClose).toHaveBeenCalledTimes(1)
        })
    })

    describe('Edge cases', () => {
        it('should handle null opportunity gracefully', () => {
            renderComponent({ opportunity: null })

            expect(screen.getByText('Dismiss opportunity?')).toBeInTheDocument()

            const dismissButton = screen.getAllByRole('button', {
                name: 'Dismiss',
            })[1]
            expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should handle multiple reason selection', async () => {
            const user = userEvent.setup({ delay: null })
            renderComponent()

            const firstCheckbox = screen.getAllByRole('checkbox')[0]
            const secondCheckbox = screen.getAllByRole('checkbox')[1]

            await act(() => user.click(firstCheckbox))
            await act(() => user.click(secondCheckbox))

            await waitFor(() => {
                const dismissButton = screen.getAllByRole('button', {
                    name: 'Dismiss',
                })[1]
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            const dismissButton = screen.getAllByRole('button', {
                name: 'Dismiss',
            })[1]
            await act(() => user.click(dismissButton))

            expect(mockOnConfirm).toHaveBeenCalled()
            expect(mockOnConfirm).toHaveBeenCalledWith(
                expect.objectContaining({
                    feedbackToUpsert: expect.arrayContaining([
                        expect.objectContaining({
                            feedbackValue:
                                OpportunityDismissReason.NOT_FOR_AI_AGENT,
                        }),
                        expect.objectContaining({
                            feedbackValue:
                                OpportunityDismissReason.TOPIC_ALREADY_EXISTS,
                        }),
                    ]),
                }),
            )
        })

        it('should toggle reason selection correctly', async () => {
            const user = userEvent.setup({ delay: null })
            renderComponent()

            const firstCheckbox = screen.getAllByRole('checkbox')[0]

            await act(() => user.click(firstCheckbox))

            await waitFor(() => {
                const dismissButton = screen.getAllByRole('button', {
                    name: 'Dismiss',
                })[1]
                expect(dismissButton).not.toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            await act(() => user.click(firstCheckbox))

            await waitFor(() => {
                const dismissButton = screen.getAllByRole('button', {
                    name: 'Dismiss',
                })[1]
                expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
            })
        })

        it('should clear freeform text when Other option is deselected', async () => {
            const user = userEvent.setup({ delay: null })
            renderComponent()

            const otherCheckbox = screen.getAllByRole('checkbox')[3]
            await act(() => user.click(otherCheckbox))

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            const textarea = screen.getByRole('textbox')
            await act(() => user.type(textarea, 'Test feedback'))

            await act(() => user.click(otherCheckbox))

            await waitFor(() => {
                expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
            })

            await act(() => user.click(otherCheckbox))

            await waitFor(() => {
                const newTextarea = screen.getByRole('textbox')
                expect(newTextarea).toHaveValue('')
            })
        })

        it('should validate freeform text is required when Other is selected', async () => {
            const user = userEvent.setup({ delay: null })
            renderComponent()

            const otherCheckbox = screen.getAllByRole('checkbox')[3]
            await act(() => user.click(otherCheckbox))

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            const textarea = screen.getByRole('textbox')
            await act(() => user.type(textarea, '   '))

            await waitFor(() => {
                const dismissButton = screen.getAllByRole('button', {
                    name: 'Dismiss',
                })[1]
                expect(dismissButton).toHaveAttribute('aria-disabled', 'true')
            })
        })

        it('should send correct feedback data with multiple reasons and Other', async () => {
            const user = userEvent.setup({ delay: null })
            renderComponent()

            const firstCheckbox = screen.getAllByRole('checkbox')[0]
            const otherCheckbox = screen.getAllByRole('checkbox')[3]

            await act(() => user.click(firstCheckbox))
            await act(() => user.click(otherCheckbox))

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            const textarea = screen.getByRole('textbox')
            await act(() => user.type(textarea, 'Additional detailed feedback'))

            const dismissButton = screen.getAllByRole('button', {
                name: 'Dismiss',
            })[1]
            await act(() => user.click(dismissButton))

            expect(mockOnConfirm).toHaveBeenCalledWith(
                expect.objectContaining({
                    feedbackToUpsert: expect.arrayContaining([
                        expect.objectContaining({
                            feedbackValue:
                                OpportunityDismissReason.NOT_FOR_AI_AGENT,
                        }),
                        expect.objectContaining({
                            feedbackValue: OpportunityDismissReason.OTHER,
                        }),
                        expect.objectContaining({
                            feedbackValue: 'Additional detailed feedback',
                        }),
                    ]),
                }),
            )
        })
    })
})
