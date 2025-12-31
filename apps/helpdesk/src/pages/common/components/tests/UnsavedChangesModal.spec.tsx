import { fireEvent, render, screen } from '@testing-library/react'

import UnsavedChangesModal from '../UnsavedChangesModal'

describe('UnsavedChangesModal', () => {
    const defaultProps = {
        onDiscard: jest.fn(),
        onSave: jest.fn(),
        onClose: jest.fn(),
        isOpen: true,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders with default props', () => {
        render(<UnsavedChangesModal {...defaultProps} />)

        screen.getByText('Save changes?')
        expect(
            screen.getByText(
                "Your changes to this page will be lost if you don't save them.",
            ),
        ).toBeInTheDocument()
        screen.getByText('Discard Changes')
        screen.getByText('Back To Editing')
        screen.getByText('Save Changes')
    })

    it('renders with custom title and body', () => {
        const customTitle = 'Custom Title'
        const customBody = 'Custom Body Text'

        render(
            <UnsavedChangesModal
                {...defaultProps}
                title={customTitle}
                body={customBody}
            />,
        )

        screen.getByText(customTitle)
        screen.getByText(customBody)
    })

    it('calls onDiscard when Discard Changes button is clicked', () => {
        render(<UnsavedChangesModal {...defaultProps} />)

        fireEvent.click(screen.getByText('Discard Changes'))
        expect(defaultProps.onDiscard).toHaveBeenCalled()
    })

    it('calls onClose when Back To Editing button is clicked', () => {
        render(<UnsavedChangesModal {...defaultProps} />)

        fireEvent.click(screen.getByText('Back To Editing'))
        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onSave when Save Changes button is clicked', () => {
        render(<UnsavedChangesModal {...defaultProps} />)

        fireEvent.click(screen.getByText('Save Changes'))
        expect(defaultProps.onSave).toHaveBeenCalled()
    })

    it('handles async onSave function', async () => {
        const asyncOnSave = jest
            .fn()
            .mockImplementation(() => Promise.resolve())
        render(<UnsavedChangesModal {...defaultProps} onSave={asyncOnSave} />)

        fireEvent.click(screen.getByText('Save Changes'))
        expect(asyncOnSave).toHaveBeenCalled()
    })

    it('does not render when isOpen is false', () => {
        render(<UnsavedChangesModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByText('Save changes?')).toBeNull()
        expect(
            screen.queryByText(
                "Your changes to this page will be lost if you don't save them.",
            ),
        ).toBeNull()

        expect(screen.queryByText('Discard Changes')).toBeNull()
        expect(screen.queryByText('Back To Editing')).toBeNull()
        expect(screen.queryByText('Save Changes')).toBeNull()
    })

    it('hides Discard Changes button when should show discard button is false', () => {
        render(
            <UnsavedChangesModal
                {...defaultProps}
                shouldShowDiscardButton={false}
            />,
        )

        screen.getByText('Save changes?')

        screen.getByText('Back To Editing')
        screen.getByText('Save Changes')

        expect(screen.queryByText('Discard Changes')).toBeNull()
    })

    it('hides Save Changes button when should show save button is false', () => {
        render(
            <UnsavedChangesModal
                {...defaultProps}
                shouldShowSaveButton={false}
            />,
        )

        screen.getByText('Save changes?')

        screen.getByText('Discard Changes')
        screen.getByText('Back To Editing')

        expect(screen.queryByText('Save Changes')).toBeNull()
    })

    it('renders with custom React node in body', () => {
        const customBody = (
            <div data-testid="custom-body">Custom Body Component</div>
        )
        render(<UnsavedChangesModal {...defaultProps} body={customBody} />)

        screen.getByText('Custom Body Component')
        expect(
            screen.queryByText(
                "Your changes to this page will be lost if you don't save them.",
            ),
        ).toBeNull()
    })
})
