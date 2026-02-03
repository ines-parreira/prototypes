import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from '../../enums'
import type { Opportunity } from '../../types'
import { ResourceType } from '../../types'
import { DeleteOpportunityModal } from './DeleteOpportunityModal'

describe('DeleteOpportunityModal', () => {
    const mockOnClose = jest.fn()
    const mockOnConfirm = jest.fn()

    const mockOpportunity: Opportunity = {
        id: '1',
        key: 'test_key',
        type: OpportunityType.RESOLVE_CONFLICT,
        resources: [
            {
                title: 'Test Resource',
                content: 'Test content',
                type: ResourceType.ARTICLE,
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

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the modal when open', () => {
        render(<DeleteOpportunityModal {...defaultProps} />)

        expect(
            screen.getByRole('heading', { name: /Delete this content\?/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Deleting this content will remove it from AI Agent’s available knowledge and resolve the conflict/,
            ),
        ).toBeInTheDocument()
    })

    it('should render confirmation checkbox', () => {
        render(<DeleteOpportunityModal {...defaultProps} />)

        expect(
            screen.getByRole('checkbox', {
                name: /I understand this action cannot be undone/i,
            }),
        ).toBeInTheDocument()
    })

    it('should have delete button disabled when checkbox is not checked', () => {
        render(<DeleteOpportunityModal {...defaultProps} />)

        const deleteButton = screen.getByRole('button', { name: /Delete/i })
        expect(deleteButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should enable delete button when checkbox is checked', async () => {
        const user = userEvent.setup()
        render(<DeleteOpportunityModal {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox', {
            name: /I understand this action cannot be undone/i,
        })
        await user.click(checkbox)

        const deleteButton = screen.getByRole('button', { name: /Delete/i })
        expect(deleteButton).not.toHaveAttribute('aria-disabled', 'true')
    })

    describe('handleConfirm', () => {
        it('should not call onConfirm when opportunity is null', async () => {
            const user = userEvent.setup()
            render(
                <DeleteOpportunityModal {...defaultProps} opportunity={null} />,
            )

            const checkbox = screen.getByRole('checkbox', {
                name: /I understand this action cannot be undone/i,
            })
            await user.click(checkbox)

            const deleteButton = screen.getByRole('button', { name: /Delete/i })
            await user.click(deleteButton)

            expect(mockOnConfirm).not.toHaveBeenCalled()
        })

        it('should not call onConfirm when checkbox is not checked', async () => {
            const user = userEvent.setup()
            render(<DeleteOpportunityModal {...defaultProps} />)

            const deleteButton = screen.getByRole('button', { name: /Delete/i })
            await user.click(deleteButton)

            expect(mockOnConfirm).not.toHaveBeenCalled()
        })

        it('should call onConfirm when confirmed', async () => {
            const user = userEvent.setup()
            render(<DeleteOpportunityModal {...defaultProps} />)

            const checkbox = screen.getByRole('checkbox', {
                name: /I understand this action cannot be undone/i,
            })
            await user.click(checkbox)

            const deleteButton = screen.getByRole('button', { name: /Delete/i })
            await user.click(deleteButton)

            await waitFor(() => {
                expect(mockOnConfirm).toHaveBeenCalledTimes(1)
            })
        })
    })

    describe('handleCancel', () => {
        it('should call onClose when modal is closed via escape key', async () => {
            const user = userEvent.setup()
            render(<DeleteOpportunityModal {...defaultProps} />)

            const checkbox = screen.getByRole('checkbox', {
                name: /I understand this action cannot be undone/i,
            })
            await user.click(checkbox)

            expect(checkbox).toBeChecked()

            await user.keyboard('{Escape}')

            await waitFor(() => {
                expect(mockOnClose).toHaveBeenCalledTimes(1)
            })
        })

        it('should reset form when modal is reopened', async () => {
            const user = userEvent.setup()
            const { rerender } = render(
                <DeleteOpportunityModal {...defaultProps} />,
            )

            const checkbox = screen.getByRole('checkbox', {
                name: /I understand this action cannot be undone/i,
            })
            await user.click(checkbox)

            expect(checkbox).toBeChecked()

            rerender(
                <DeleteOpportunityModal {...defaultProps} isOpen={false} />,
            )

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', {
                        name: /Delete knowledge item\?/i,
                    }),
                ).not.toBeInTheDocument()
            })

            rerender(<DeleteOpportunityModal {...defaultProps} isOpen={true} />)

            const checkboxAfterReopen = screen.getByRole('checkbox', {
                name: /I understand this action cannot be undone/i,
            })
            expect(checkboxAfterReopen).not.toBeChecked()
        })
    })

    describe('Modal behavior', () => {
        it('should not render when isOpen is false', () => {
            render(<DeleteOpportunityModal {...defaultProps} isOpen={false} />)

            expect(
                screen.queryByRole('heading', {
                    name: /Delete this content\?/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('should toggle checkbox on click', async () => {
            const user = userEvent.setup()
            render(<DeleteOpportunityModal {...defaultProps} />)

            const checkbox = screen.getByRole('checkbox', {
                name: /I understand this action cannot be undone/i,
            })

            expect(checkbox).not.toBeChecked()

            await user.click(checkbox)
            expect(checkbox).toBeChecked()

            await user.click(checkbox)
            expect(checkbox).not.toBeChecked()
        })
    })
})
