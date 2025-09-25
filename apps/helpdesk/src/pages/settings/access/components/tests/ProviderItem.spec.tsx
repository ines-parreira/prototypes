import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ProviderItem from '../ProviderItem'

describe('ProviderItem', () => {
    const mockOnDelete = jest.fn()
    const mockOnEdit = jest.fn()

    const defaultProps = {
        onDelete: mockOnDelete,
        onEdit: mockOnEdit,
        providerId: 'test-provider-123',
        providerName: 'Test Provider',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Default rendering and interactions', () => {
        let editButton: HTMLElement
        let removeButton: HTMLElement

        beforeEach(() => {
            render(<ProviderItem {...defaultProps} />)
            editButton = screen.getByRole('button', { name: /edit/i })
            removeButton = screen.getByRole('button', { name: /remove/i })
        })

        it('renders all expected elements', () => {
            expect(screen.getByText('Test Provider SSO')).toBeInTheDocument()
            expect(screen.getByText('🔒')).toBeInTheDocument()
            expect(editButton).toBeInTheDocument()
            expect(removeButton).toBeInTheDocument()
        })

        it('has accessible button labels and enabled state by default', () => {
            expect(editButton).toHaveAccessibleName('Edit')
            expect(removeButton).toHaveAccessibleName('Remove')
            expect(editButton).toHaveAttribute('aria-disabled', 'false')
            expect(removeButton).toHaveAttribute('aria-disabled', 'false')
        })

        it('maintains focus order between buttons', () => {
            editButton.focus()
            expect(editButton).toHaveFocus()

            removeButton.focus()
            expect(removeButton).toHaveFocus()
        })

        it('calls handlers with correct providerId when buttons are clicked', async () => {
            const user = userEvent.setup()

            await user.click(editButton)
            expect(mockOnEdit).toHaveBeenCalledWith('test-provider-123')
            expect(mockOnEdit).toHaveBeenCalledTimes(1)

            await user.click(removeButton)
            expect(mockOnDelete).toHaveBeenCalledWith('test-provider-123')
            expect(mockOnDelete).toHaveBeenCalledTimes(1)
        })
    })

    describe('Disabled state', () => {
        it('disables both buttons and prevents handler calls when disabled=true', async () => {
            const user = userEvent.setup()
            render(<ProviderItem {...defaultProps} disabled={true} />)

            const editButton = screen.getByRole('button', { name: /edit/i })
            const removeButton = screen.getByRole('button', { name: /remove/i })

            expect(editButton).toHaveAttribute('aria-disabled', 'true')
            expect(removeButton).toHaveAttribute('aria-disabled', 'true')

            await user.click(editButton)
            await user.click(removeButton)

            expect(mockOnEdit).not.toHaveBeenCalled()
            expect(mockOnDelete).not.toHaveBeenCalled()
        })

        it('enables both buttons when disabled=false', () => {
            render(<ProviderItem {...defaultProps} disabled={false} />)

            const editButton = screen.getByRole('button', { name: /edit/i })
            const removeButton = screen.getByRole('button', { name: /remove/i })

            expect(editButton).toHaveAttribute('aria-disabled', 'false')
            expect(removeButton).toHaveAttribute('aria-disabled', 'false')
        })
    })

    describe('Different provider names', () => {
        it.each([
            ['empty name', '', /SSO$/],
            [
                'special characters',
                'Test-Provider_123 & Co.',
                'Test-Provider_123 & Co. SSO',
            ],
            [
                'long name',
                'Very Long Provider Name That Might Cause Layout Issues',
                'Very Long Provider Name That Might Cause Layout Issues SSO',
            ],
        ])('handles %s', (_, providerName, expectedText) => {
            render(
                <ProviderItem {...defaultProps} providerName={providerName} />,
            )
            expect(screen.getByText(expectedText)).toBeInTheDocument()
        })
    })

    describe('Different provider IDs', () => {
        it.each([
            ['numeric ID', '12345', 'Edit'],
            ['UUID format', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Remove'],
        ])(
            'passes correct providerId for %s',
            async (_, providerId, buttonName) => {
                const user = userEvent.setup()
                render(
                    <ProviderItem {...defaultProps} providerId={providerId} />,
                )

                const button = screen.getByRole('button', {
                    name: new RegExp(buttonName, 'i'),
                })
                await user.click(button)

                const expectedHandler =
                    buttonName === 'Edit' ? mockOnEdit : mockOnDelete
                expect(expectedHandler).toHaveBeenCalledWith(providerId)
            },
        )
    })
})
