import React from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { DropdownContext } from 'pages/common/components/dropdown/Dropdown'

import MenuItem from '../MenuItem'

describe('<EdgeBlockMenuItem />', () => {
    it('should render edge block menu item', () => {
        const mockOnClick = jest.fn()

        render(
            <DropdownContext.Provider
                value={{
                    getHighlightedLabel: jest.fn(),
                    isMultiple: false,
                    onQueryChange: jest.fn(),
                    onToggle: jest.fn(),
                    query: '',
                    value: '',
                }}
            >
                <MenuItem
                    label="label"
                    description="description"
                    icon="icon"
                    onClick={mockOnClick}
                />
            </DropdownContext.Provider>,
        )

        expect(screen.getByText('label')).toBeInTheDocument()
        expect(screen.getByText('description')).toBeInTheDocument()
        expect(screen.getByText('icon')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('label'))
        })

        expect(mockOnClick).toHaveBeenCalled()
    })

    it('should render disabled edge block menu item', async () => {
        const mockOnClick = jest.fn()

        render(
            <DropdownContext.Provider
                value={{
                    getHighlightedLabel: jest.fn(),
                    isMultiple: false,
                    onQueryChange: jest.fn(),
                    onToggle: jest.fn(),
                    query: '',
                    value: '',
                }}
            >
                <MenuItem
                    label="label"
                    description="description"
                    icon="icon"
                    onClick={mockOnClick}
                    disabledText="disabled text"
                    floatingRef={document.body}
                />
            </DropdownContext.Provider>,
        )

        act(() => {
            fireEvent.mouseEnter(screen.getByText('label'))
        })

        await waitFor(() => {
            expect(screen.getByText('disabled text')).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByText('label'))
        })

        expect(mockOnClick).not.toHaveBeenCalled()
    })
})
