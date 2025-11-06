import React from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MetafieldCategory } from '../../types'
import ImportableCategories from './ImportableCategories'

describe('ImportableCategories', () => {
    const mockCategories = [
        {
            label: 'Customer',
            value: 'customer' as MetafieldCategory,
            selectCount: 0,
        },
        { label: 'Order', value: 'order' as MetafieldCategory, selectCount: 5 },
        {
            label: 'Draft Order',
            value: 'draft_order' as MetafieldCategory,
            selectCount: 0,
        },
    ]

    const mockOnCategorySelect = jest.fn()
    const mockOnImport = jest.fn()

    it('should render all categories', () => {
        render(
            <ImportableCategories
                categories={mockCategories}
                onCategorySelect={mockOnCategorySelect}
                onImport={mockOnImport}
            />,
        )

        expect(screen.getByText('Customer')).toBeInTheDocument()
        expect(screen.getByText('Order')).toBeInTheDocument()
        expect(screen.getByText('Draft Order')).toBeInTheDocument()
    })

    it('should display select count when greater than 0', () => {
        render(
            <ImportableCategories
                categories={mockCategories}
                onCategorySelect={mockOnCategorySelect}
                onImport={mockOnImport}
            />,
        )

        expect(screen.getByText('5 selected')).toBeInTheDocument()
    })

    it('should show import button when there is at least one selection', () => {
        render(
            <ImportableCategories
                categories={mockCategories}
                onCategorySelect={mockOnCategorySelect}
                onImport={mockOnImport}
            />,
        )

        expect(
            screen.getByRole('button', { name: /import/i }),
        ).toBeInTheDocument()
    })

    it('should not show import button when there are no selections', () => {
        const categoriesWithNoSelection = mockCategories.map((cat) => ({
            ...cat,
            selectCount: 0,
        }))

        render(
            <ImportableCategories
                categories={categoriesWithNoSelection}
                onCategorySelect={mockOnCategorySelect}
                onImport={mockOnImport}
            />,
        )

        expect(
            screen.queryByRole('button', { name: /import/i }),
        ).not.toBeInTheDocument()
    })

    it('should call onCategorySelect when clicking category chevron button', async () => {
        const user = userEvent.setup()
        render(
            <ImportableCategories
                categories={mockCategories}
                onCategorySelect={mockOnCategorySelect}
                onImport={mockOnImport}
            />,
        )

        const orderText = screen.getByText('Order')
        const categoryContainer = orderText.closest('.categoryContainer')
        const chevronButton = categoryContainer?.querySelector('button')

        expect(chevronButton).toBeInTheDocument()

        await act(() => user.click(chevronButton!))

        expect(mockOnCategorySelect).toHaveBeenCalledTimes(1)
        expect(mockOnCategorySelect).toHaveBeenCalledWith('order')
    })
})
