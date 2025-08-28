import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEventDefault from '@testing-library/user-event'

import { useFlag } from 'core/flags'

import { Sort } from '../Sort'
import { SortOption } from '../types'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('@gorgias/axiom', () => ({
    IconButton: React.forwardRef(
        (props: any, ref: React.Ref<HTMLButtonElement>) => (
            <button {...props} ref={ref} data-testid="icon-button" />
        ),
    ),
    SelectField: (props: any) => (
        <div data-testid="select-field">{JSON.stringify(props)}</div>
    ),
}))

jest.mock(
    'pages/common/components/dropdown/Dropdown',
    () =>
        ({
            children,
            isOpen,
        }: {
            children: React.ReactNode
            isOpen: boolean
        }) => (
            <div data-testid="dropdown" data-open={isOpen}>
                {children}
            </div>
        ),
)

jest.mock(
    'pages/common/components/dropdown/DropdownBody',
    () =>
        ({
            children,
            className,
        }: {
            children: React.ReactNode
            className?: string
        }) => (
            <div data-testid="dropdown-body" className={className}>
                {children}
            </div>
        ),
)

const useFlagMock = assumeMock(useFlag)

describe('Sort', () => {
    const mockSortOptions: SortOption[] = [
        {
            key: 'last_message_datetime',
            order: 'asc',
            label: 'Last updated',
        } as const,
        {
            key: 'last_message_datetime',
            order: 'desc',
            label: 'Last updated',
        } as const,
        {
            key: 'created_datetime',
            order: 'asc',
            label: 'Created',
        } as const,
        {
            key: 'created_datetime',
            order: 'desc',
            label: 'Created',
        } as const,
    ]

    const mockValue: SortOption = {
        key: 'last_message_datetime',
        order: 'desc',
        label: 'Last updated',
    } as const

    const mockOnChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when CustomerTimelineDrawerUX feature flag is disabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(false)
        })

        it('should render SelectField component', () => {
            render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            expect(screen.getByTestId('select-field')).toBeInTheDocument()
            expect(screen.queryByTestId('icon-button')).not.toBeInTheDocument()
            expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument()
        })

        it('should pass correct props to SelectField', () => {
            render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            const selectField = screen.getByTestId('select-field')
            expect(selectField).toBeInTheDocument()

            // Check that SelectField receives the basic props we can verify
            const content = selectField.textContent || ''
            expect(content).toContain('end') // dropdownAlignment
            expect(content).toContain('400') // dropdownMaxWidth
            expect(content).toContain('Last updated') // selectedOption.label
        })
    })

    describe('when CustomerTimelineDrawerUX feature flag is enabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('should render IconButton and Dropdown components', () => {
            render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            expect(screen.getByTestId('icon-button')).toBeInTheDocument()
            expect(screen.getByTestId('dropdown')).toBeInTheDocument()
            expect(screen.queryByTestId('select-field')).not.toBeInTheDocument()
        })

        it('should render IconButton with correct props', () => {
            render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            const iconButton = screen.getByTestId('icon-button')
            expect(iconButton).toHaveAttribute('aria-label', 'Sort')
            expect(iconButton).toHaveAttribute('fillStyle', 'ghost')
            expect(iconButton).toHaveAttribute('intent', 'secondary')
            expect(iconButton).toHaveAttribute('icon', 'swap_vert')
        })

        it('should start with dropdown closed', () => {
            render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            const dropdown = screen.getByTestId('dropdown')
            expect(dropdown).toHaveAttribute('data-open', 'false')
        })

        it('should render all sort options in dropdown', () => {
            render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            expect(screen.getByTestId('dropdown-body')).toBeInTheDocument()

            // Check that all unique labels are rendered (some options share labels)
            const uniqueLabels = [
                ...new Set(mockSortOptions.map((option) => option.label)),
            ]
            uniqueLabels.forEach((label) => {
                expect(screen.getAllByText(label).length).toBeGreaterThan(0)
            })
        })

        it('should show correct arrow icons for asc/desc options', () => {
            const { container } = render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            expect(container.innerHTML).toContain('arrow_upward')
            expect(container.innerHTML).toContain('arrow_downward')
        })

        it('should show selected option with check icon', () => {
            const { container } = render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            // The selected option should have the check icon
            expect(container.innerHTML).toContain('check')
        })

        it('should call onChange when option is clicked', async () => {
            const user = userEventDefault.setup()
            const { container } = render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            // Find and click the first sort option button (not the main IconButton)
            const optionButtons = container.querySelectorAll('li button')
            expect(optionButtons).toHaveLength(mockSortOptions.length)

            await user.click(optionButtons[0])

            expect(mockOnChange).toHaveBeenCalledWith(mockSortOptions[0])
        })

        it('should identify selected option correctly', () => {
            const selectedOption = mockSortOptions[1] // desc option
            const { container } = render(
                <Sort
                    value={selectedOption}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            // The selected option should have the check icon
            expect(container.innerHTML).toContain('check')
        })
    })

    describe('accessibility', () => {
        it('should have proper aria-label on sort button when feature flag is enabled', () => {
            useFlagMock.mockReturnValue(true)

            render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            const iconButton = screen.getByTestId('icon-button')
            expect(iconButton).toHaveAttribute('aria-label', 'Sort')
        })

        it('should be keyboard accessible', async () => {
            useFlagMock.mockReturnValue(true)
            const user = userEventDefault.setup()

            const { container } = render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            const optionButtons = container.querySelectorAll('li button')

            // Focus and activate with keyboard
            ;(optionButtons[0] as HTMLElement).focus()
            await user.keyboard('{Enter}')

            expect(mockOnChange).toHaveBeenCalledWith(mockSortOptions[0])
        })
    })

    describe('edge cases', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('should handle empty sort options array', () => {
            const { container } = render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={[]}
                />,
            )

            const listItems = container.querySelectorAll('li')
            expect(listItems).toHaveLength(0)
        })

        it('should handle single sort option', () => {
            const singleOption = [mockSortOptions[0]]

            const { container } = render(
                <Sort
                    value={singleOption[0]}
                    onChange={mockOnChange}
                    sortOptions={singleOption}
                />,
            )

            const listItems = container.querySelectorAll('li')
            expect(listItems).toHaveLength(1)
        })

        it('should handle option with different key and order combinations', () => {
            const customOptions: SortOption[] = [
                {
                    key: 'last_message_datetime',
                    order: 'asc',
                    label: 'Last updated',
                } as const,
                {
                    key: 'last_message_datetime',
                    order: 'desc',
                    label: 'Last updated',
                } as const,
            ]

            const customValue = customOptions[0]

            const { container } = render(
                <Sort
                    value={customValue}
                    onChange={mockOnChange}
                    sortOptions={customOptions}
                />,
            )

            const listItems = container.querySelectorAll('li')
            expect(listItems).toHaveLength(2)

            // Should show check icon for the selected option
            expect(container.innerHTML).toContain('check')
        })
    })

    describe('feature flag integration', () => {
        it('should call useFlag with correct feature flag key', () => {
            render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            expect(useFlagMock).toHaveBeenCalledWith(
                FeatureFlagKey.CustomerTimelineDrawerUX,
            )
        })

        it('should render different UI based on feature flag value', () => {
            // Test with flag disabled
            useFlagMock.mockReturnValue(false)
            const { rerender } = render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            expect(screen.getByTestId('select-field')).toBeInTheDocument()
            expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument()

            // Test with flag enabled
            useFlagMock.mockReturnValue(true)
            rerender(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            expect(screen.getByTestId('dropdown')).toBeInTheDocument()
            expect(screen.queryByTestId('select-field')).not.toBeInTheDocument()
        })
    })

    describe('DropdownCustomItem behavior', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('should not show check icon for non-selected options', () => {
            const selectedOption = mockSortOptions[0] // asc option
            const { container } = render(
                <Sort
                    value={selectedOption}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            // Only one check icon should be present (for the selected option)
            const checkMatches = container.innerHTML.match(/check/g)
            expect(checkMatches).toHaveLength(1)
        })

        it('should handle option selection correctly', async () => {
            const user = userEventDefault.setup()
            const { container } = render(
                <Sort
                    value={mockValue}
                    onChange={mockOnChange}
                    sortOptions={mockSortOptions}
                />,
            )

            const optionButtons = container.querySelectorAll('li button')

            // Click on a different option
            await user.click(optionButtons[2]) // created_datetime asc

            expect(mockOnChange).toHaveBeenCalledWith(mockSortOptions[2])
        })
    })
})
