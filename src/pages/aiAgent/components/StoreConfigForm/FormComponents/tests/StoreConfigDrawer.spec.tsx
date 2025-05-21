import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StoreConfigDrawer } from '../StoreConfigDrawer'

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loading...</div>
))

describe('StoreConfigDrawer', () => {
    const defaultProps = {
        open: true,
        title: 'Test Drawer',
        children: <div>Test Content</div>,
        isLoading: false,
        onClose: jest.fn(),
        onSave: jest.fn(),
        onBackdropClick: jest.fn(),
    }

    it('should render drawer with correct title and content', () => {
        render(<StoreConfigDrawer {...defaultProps} />)

        expect(screen.getByText('Test Drawer')).toBeInTheDocument()
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should call onClose when clicking cancel button', async () => {
        render(<StoreConfigDrawer {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: /cancel/i })
        await userEvent.click(cancelButton)

        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should call onSave when clicking save button', async () => {
        render(<StoreConfigDrawer {...defaultProps} />)

        const saveButton = screen.getByRole('button', { name: /save changes/i })
        await userEvent.click(saveButton)

        expect(defaultProps.onSave).toHaveBeenCalled()
    })

    it('should show loading state when isLoading is true', () => {
        render(<StoreConfigDrawer {...defaultProps} isLoading={true} />)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should call onBackdropClick when clicking on backdrop', async () => {
        render(<StoreConfigDrawer {...defaultProps} />)

        // Simulate a click on the backdrop
        const backdrop = document.querySelector('[role="presentation"]')
        if (backdrop) {
            await userEvent.click(backdrop)
        }

        expect(defaultProps.onBackdropClick).toHaveBeenCalled()
    })

    it('should not render the drawer when isOpen is false', () => {
        render(<StoreConfigDrawer {...defaultProps} open={false} />)

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should call onBackdropClick when clicking close button', async () => {
        render(<StoreConfigDrawer {...defaultProps} />)

        const closeButton = screen.getByRole('button', {
            name: 'close edit drawer',
        })
        await userEvent.click(closeButton)

        expect(defaultProps.onBackdropClick).toHaveBeenCalled()
    })
})
