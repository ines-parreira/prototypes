import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PlaygroundActionsModal from './PlaygroundActionsModal'

const mockGetItem = jest.fn()

jest.mock('@repo/hooks', () => ({
    useSessionStorage: jest.fn((key, defaultValue) => {
        const [value, setValue] = React.useState(defaultValue)
        return [value, setValue]
    }),
    useId: jest.fn(() => 'mock-id'),
    useKey: jest.fn(),
}))

jest.mock('pages/common/components/modal/Modal', () => {
    return function MockModal({ children, isOpen, className }: any) {
        if (!isOpen) return null
        return (
            <div className={className} data-testid="modal">
                {children}
            </div>
        )
    }
})

jest.mock('pages/common/components/modal/ModalHeader', () => {
    return function MockModalHeader({ title }: any) {
        return <h2>{title}</h2>
    }
})

jest.mock('pages/common/components/modal/ModalBody', () => {
    return function MockModalBody({ children, className }: any) {
        return <div className={className}>{children}</div>
    }
})

jest.mock('pages/common/components/modal/ModalFooter', () => {
    return function MockModalFooter({ children, className }: any) {
        return <div className={className}>{children}</div>
    }
})

describe('PlaygroundActionsModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetItem.mockReturnValue(null)
    })

    it('should render modal when open', () => {
        render(<PlaygroundActionsModal {...defaultProps} />)

        expect(
            screen.getByText('Enable Actions in test mode?'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'When Actions are triggered in test mode, they use live customer data. This means:',
            ),
        ).toBeInTheDocument()
    })

    it('should display warning list items', () => {
        render(<PlaygroundActionsModal {...defaultProps} />)

        expect(
            screen.getByText('Customer data may be updated or deleted'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Real orders may be modified or cancelled'),
        ).toBeInTheDocument()
        expect(screen.getByText('Changes cannot be undone')).toBeInTheDocument()
    })

    it('should display confirmation checkbox with label', () => {
        render(<PlaygroundActionsModal {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeInTheDocument()
        expect(
            screen.getByText(
                'I understand that enabling Actions in test mode may cause irreversible changes to live customer data.',
            ),
        ).toBeInTheDocument()
    })

    it('should have Enable Actions button disabled initially', () => {
        render(<PlaygroundActionsModal {...defaultProps} />)

        const enableButton = screen.getByRole('button', {
            name: /Enable Actions/i,
        })
        expect(enableButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should enable Enable Actions button when checkbox is checked', async () => {
        render(<PlaygroundActionsModal {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')
        const enableButton = screen.getByRole('button', {
            name: /Enable Actions/i,
        })

        expect(enableButton).toHaveAttribute('aria-disabled', 'true')

        await userEvent.click(checkbox)

        await waitFor(() => {
            expect(enableButton).toHaveAttribute('aria-disabled', 'false')
        })
    })

    it('should call onClose when Cancel button is clicked', async () => {
        render(<PlaygroundActionsModal {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: /Cancel/i })
        await userEvent.click(cancelButton)

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onConfirm when Enable Actions is clicked with checkbox checked', async () => {
        render(<PlaygroundActionsModal {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')
        await userEvent.click(checkbox)

        const enableButton = screen.getByRole('button', {
            name: /Enable Actions/i,
        })
        await userEvent.click(enableButton)

        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not render modal when isOpen is false', () => {
        render(<PlaygroundActionsModal {...defaultProps} isOpen={false} />)

        expect(
            screen.queryByText('Enable Actions in test mode?'),
        ).not.toBeInTheDocument()
    })

    it('should toggle checkbox when clicking on the confirmation text', async () => {
        render(<PlaygroundActionsModal {...defaultProps} />)

        const confirmationText = screen.getByText(
            'I understand that enabling Actions in test mode may cause irreversible changes to live customer data.',
        )
        const checkbox = screen.getByRole('checkbox')

        expect(checkbox).not.toBeChecked()

        await userEvent.click(confirmationText.parentElement!)

        await waitFor(() => {
            expect(checkbox).toBeChecked()
        })
    })

    it('should toggle checkbox state when clicking multiple times', async () => {
        render(<PlaygroundActionsModal {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')

        expect(checkbox).not.toBeChecked()

        await userEvent.click(checkbox)
        await waitFor(() => expect(checkbox).toBeChecked())

        await userEvent.click(checkbox)
        await waitFor(() => expect(checkbox).not.toBeChecked())

        await userEvent.click(checkbox)
        await waitFor(() => expect(checkbox).toBeChecked())
    })

    it('should have correct modal properties', () => {
        render(<PlaygroundActionsModal {...defaultProps} />)

        const modal = screen.getByTestId('modal')
        expect(modal).toBeInTheDocument()
        expect(modal).toHaveClass('PlaygroundActionsModal')
    })
})
