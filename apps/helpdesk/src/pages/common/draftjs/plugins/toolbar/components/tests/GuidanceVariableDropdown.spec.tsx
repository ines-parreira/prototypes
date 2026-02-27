import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import type {
    GuidanceVariable,
    GuidanceVariableGroup,
} from 'pages/aiAgent/components/GuidanceEditor/variables.types'

import { findManyGuidanceVariables } from '../../../guidance-variables/utils'
import { useToolbarContext } from '../../ToolbarContext'
import GuidanceVariableDropdown from '../GuidanceVariableDropdown'

jest.mock('../../ToolbarContext', () => ({
    useToolbarContext: jest.fn(),
}))

jest.mock('../../../guidance-variables/utils', () => ({
    findManyGuidanceVariables: jest.fn(),
    pickCategoryIconName: jest.requireActual(
        '../../../guidance-variables/utils',
    ).pickCategoryIconName,
}))

jest.mock('pages/common/components/dropdown/Dropdown', () => {
    return jest.fn(({ children, isOpen, onToggle }) => (
        <div data-testid="dropdown" data-open={isOpen}>
            {isOpen && children}
            <button
                data-testid="toggle-dropdown"
                onClick={() => onToggle(!isOpen)}
            >
                Toggle
            </button>
        </div>
    ))
})

jest.mock('pages/common/components/dropdown/DropdownHeader', () => {
    return jest.fn(({ children }) => (
        <div data-testid="dropdown-header">{children}</div>
    ))
})

jest.mock('pages/common/components/dropdown/DropdownBody', () => {
    return jest.fn(({ children }) => (
        <div data-testid="dropdown-body">{children}</div>
    ))
})

jest.mock('pages/common/components/dropdown/DropdownItem', () => {
    return jest.fn(({ children, onClick }) => (
        <div data-testid="dropdown-item" onClick={onClick}>
            {children}
        </div>
    ))
})

jest.mock('pages/common/components/button/ButtonIconLabel', () => {
    return jest.fn(({ children, icon }) => (
        <div data-testid="button-icon-label" data-icon={icon}>
            {children}
        </div>
    ))
})

jest.mock('pages/common/components/Search', () => {
    return jest.fn(({ value, onChange }) => (
        <input
            data-testid="search-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    ))
})

describe('GuidanceVariableDropdown', () => {
    const mockTarget = { current: document.createElement('div') }
    const mockOnSelect = jest.fn()
    const mockOnToggle = jest.fn()

    const mockVariables: GuidanceVariable[] = [
        {
            name: 'Name',
            value: '&&&customer.name&&&',
            category: 'customer',
        },
        {
            name: 'Email',
            value: '&&&customer.email&&&',
            category: 'customer',
        },
    ]

    const mockVariableGroup: GuidanceVariableGroup = {
        name: 'Customer',
        variables: mockVariables,
    }

    const mockGuidanceVariables = [mockVariableGroup]

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useToolbarContext as jest.Mock).mockReturnValue({
            guidanceVariables: mockGuidanceVariables,
        })
        ;(findManyGuidanceVariables as jest.Mock).mockImplementation(
            (variables) => {
                if (variables === mockGuidanceVariables) {
                    return mockVariables
                }
                if (variables[0] === mockVariableGroup) {
                    return mockVariables
                }
                return []
            },
        )
    })

    it('renders dropdown when isOpen is true', () => {
        render(
            <GuidanceVariableDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={true}
                onToggle={mockOnToggle}
            />,
        )

        expect(screen.getByTestId('dropdown')).toHaveAttribute(
            'data-open',
            'true',
        )
        expect(screen.getByTestId('dropdown-body')).toBeInTheDocument()
        expect(screen.getByTestId('search-input')).toBeInTheDocument()
    })

    it('does not render dropdown content when isOpen is false', () => {
        render(
            <GuidanceVariableDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={false}
                onToggle={mockOnToggle}
            />,
        )

        expect(screen.getByTestId('dropdown')).toHaveAttribute(
            'data-open',
            'false',
        )
        expect(screen.queryByTestId('dropdown-body')).not.toBeInTheDocument()
    })

    it('displays variable groups when no provider is selected', () => {
        render(
            <GuidanceVariableDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={true}
                onToggle={mockOnToggle}
            />,
        )

        const dropdownItems = screen.getAllByTestId('dropdown-item')
        expect(dropdownItems.length).toBe(1)
        expect(dropdownItems[0]).toHaveTextContent('Customer')
    })

    it('displays variables when a provider is selected', () => {
        render(
            <GuidanceVariableDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={true}
                onToggle={mockOnToggle}
            />,
        )

        const dropdownItems = screen.getAllByTestId('dropdown-item')
        fireEvent.click(dropdownItems[0])

        expect(screen.getByTestId('button-icon-label')).toHaveAttribute(
            'data-icon',
            'arrow_back',
        )
        expect(screen.getByText('Customer')).toBeInTheDocument()

        expect(screen.getByText('CUSTOMER')).toBeInTheDocument()

        const variableItems = screen.getAllByTestId('dropdown-item')
        expect(variableItems.length).toBe(2)

        const itemTexts = variableItems.map((item) => item.textContent)
        expect(itemTexts).toContain('Name')
        expect(itemTexts).toContain('Email')
    })

    it('calls onSelect when a variable is clicked', () => {
        render(
            <GuidanceVariableDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={true}
                onToggle={mockOnToggle}
            />,
        )

        const dropdownItems = screen.getAllByTestId('dropdown-item')
        fireEvent.click(dropdownItems[0])

        const variableItems = screen.getAllByTestId('dropdown-item')
        fireEvent.click(variableItems[0])

        expect(mockOnSelect).toHaveBeenCalled()

        const calledArg = mockOnSelect.mock.calls[0][0]
        expect(mockVariables).toContainEqual(calledArg)

        expect(mockOnToggle).toHaveBeenCalledWith(false)
    })

    it('handles search functionality', () => {
        render(
            <GuidanceVariableDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={true}
                onToggle={mockOnToggle}
            />,
        )

        const searchInput = screen.getByTestId('search-input')
        fireEvent.change(searchInput, { target: { value: 'Email' } })

        const dropdownItems = screen.getAllByTestId('dropdown-item')
        expect(dropdownItems.length).toBe(1)
        expect(dropdownItems[0]).toHaveTextContent('Customer: Email')
    })

    it('displays "No variables available" when there are no variables', () => {
        ;(useToolbarContext as jest.Mock).mockReturnValue({
            guidanceVariables: [],
        })

        render(
            <GuidanceVariableDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={true}
                onToggle={mockOnToggle}
            />,
        )

        expect(screen.getByText('No variables available')).toBeInTheDocument()
    })

    it('displays "No results" when search has no matches', () => {
        render(
            <GuidanceVariableDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={true}
                onToggle={mockOnToggle}
            />,
        )

        const searchInput = screen.getByTestId('search-input')
        fireEvent.change(searchInput, { target: { value: 'xyz' } })

        expect(screen.getByText('No results')).toBeInTheDocument()
    })

    it('resets state when dropdown is closed', () => {
        const { unmount } = render(
            <GuidanceVariableDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={true}
                onToggle={mockOnToggle}
            />,
        )

        const dropdownItems = screen.getAllByTestId('dropdown-item')
        fireEvent.click(dropdownItems[0])

        expect(screen.getByText('Customer')).toBeInTheDocument()

        unmount()

        render(
            <GuidanceVariableDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={true}
                onToggle={mockOnToggle}
            />,
        )

        const items = screen.getAllByTestId('dropdown-item')
        expect(items.length).toBe(1)
        expect(items[0]).toHaveTextContent('Customer')

        expect(screen.queryByText('CUSTOMER')).not.toBeInTheDocument()
    })

    it('uses custom noSelectedCategoryText when provided', () => {
        render(
            <GuidanceVariableDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={true}
                onToggle={mockOnToggle}
                noSelectedCategoryText="Custom Header Text"
            />,
        )

        expect(screen.getByText('Custom Header Text')).toBeInTheDocument()
    })
})
