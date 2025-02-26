import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { EmailIntegrationListSelection } from './EmailIntegrationListSelection'

const mockEmailItems = [
    { email: 'default@example.com', id: 1, isDefault: true, isDisabled: false },
    { email: 'user@example.com', id: 2, isDefault: false, isDisabled: false },
    {
        email: 'disabled@example.com',
        id: 3,
        isDefault: false,
        isDisabled: true,
    },
]

describe('EmailIntegrationListSelection', () => {
    it('should render correctly', () => {
        render(
            <EmailIntegrationListSelection
                onSelectionChange={jest.fn()}
                selectedIds={[]}
                emailItems={mockEmailItems}
                hasError={false}
            />,
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should add a new email ID when selected', () => {
        const mockOnSelectionChange = jest.fn()

        render(
            <EmailIntegrationListSelection
                onSelectionChange={mockOnSelectionChange}
                selectedIds={[]}
                emailItems={mockEmailItems}
                hasError={false}
            />,
        )

        const dropdown = screen.getByRole('combobox')
        fireEvent.focus(dropdown)

        const emailToSelect = mockEmailItems[1]
        const emailOption = screen.getByText(emailToSelect.email)
        fireEvent.click(emailOption)

        expect(mockOnSelectionChange).toHaveBeenCalledWith([emailToSelect.id])
    })

    it('should remove an email ID when deselected', () => {
        const mockOnSelectionChange = jest.fn()

        render(
            <EmailIntegrationListSelection
                onSelectionChange={mockOnSelectionChange}
                selectedIds={[mockEmailItems[1].id]}
                emailItems={mockEmailItems}
                hasError={false}
            />,
        )

        const dropdown = screen.getByRole('combobox')
        fireEvent.focus(dropdown)

        // Get the option by name instead of directly accessing text
        const emailOption = screen.getByRole('option', {
            name: mockEmailItems[1].email,
        })
        fireEvent.click(emailOption)

        expect(mockOnSelectionChange).toHaveBeenCalledWith([])
    })

    it('should display disabled text when `isDisabled` and `withDefaultTag` are true', () => {
        render(
            <EmailIntegrationListSelection
                onSelectionChange={jest.fn()}
                selectedIds={[]}
                emailItems={mockEmailItems}
                hasError={false}
                withDefaultTag
            />,
        )

        const dropdown = screen.getByRole('combobox')
        fireEvent.focus(dropdown)

        expect(screen.getByText(mockEmailItems[2].email)).toBeInTheDocument()
        expect(
            screen.getByText('Email already used by AI Agent in another store'),
        ).toBeInTheDocument()
    })

    it('should NOT display the disabled text when `withDefaultTag` is false', () => {
        render(
            <EmailIntegrationListSelection
                onSelectionChange={jest.fn()}
                selectedIds={[]}
                emailItems={mockEmailItems}
                hasError={false}
            />,
        )

        const dropdown = screen.getByRole('combobox')
        fireEvent.focus(dropdown)

        expect(screen.getByText(mockEmailItems[2].email)).toBeInTheDocument()
        expect(
            screen.queryByText(
                'Email already used by AI Agent in another store',
            ),
        ).not.toBeInTheDocument()
    })

    it('should display the "Default" tag for default email items', () => {
        render(
            <EmailIntegrationListSelection
                onSelectionChange={jest.fn()}
                selectedIds={[]}
                emailItems={mockEmailItems}
                hasError={false}
                withDefaultTag
            />,
        )

        const dropdown = screen.getByRole('combobox')
        fireEvent.focus(dropdown)

        expect(screen.getByText('Default')).toBeInTheDocument()
    })
})
