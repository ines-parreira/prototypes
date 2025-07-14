import React, { ContextType } from 'react'

import { render, screen, waitFor } from '@testing-library/react'

import FilterDropdownItemLabel from 'domains/reporting/pages/common/components/Filter/components/FilterDropdownItemLabel/FilterDropdownItemLabel'
import { LABEL_MAX_WIDTH } from 'domains/reporting/pages/common/components/Filter/constants'
import { DropdownContext } from 'pages/common/components/dropdown/Dropdown'
import { userEvent } from 'utils/testing/userEvent'

const mockContext: ContextType<typeof DropdownContext> = {
    isMultiple: false,
    value: null,
    query: '',
    onToggle: jest.fn(),
    getHighlightedLabel: jest.fn(),
    onQueryChange: jest.fn(),
}

describe('FilterDropdownItemLabel', () => {
    it('renders the label correctly', () => {
        const label = 'Test Label'
        const { getByText } = render(
            <DropdownContext.Provider value={mockContext}>
                <FilterDropdownItemLabel label={label} />
            </DropdownContext.Provider>,
        )
        expect(getByText(label)).toBeInTheDocument()
    })

    it('shows the tooltip when the label is too long', async () => {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            configurable: true,
            value: LABEL_MAX_WIDTH,
        })

        const label = 'Simulate long Label'

        render(
            <DropdownContext.Provider value={mockContext}>
                <FilterDropdownItemLabel label={label} />
            </DropdownContext.Provider>,
        )

        const filterValueElement = screen.getByText(label)
        userEvent.hover(filterValueElement)

        await waitFor(() =>
            expect(screen.getByRole('tooltip')).toBeInTheDocument(),
        )
    })

    it('throws an error when used outside of DropdownContext', () => {
        expect(() =>
            render(<FilterDropdownItemLabel label={'Label'} />),
        ).toThrow(
            'DropdownSearch must be used within a DropdownContext.Provider',
        )
    })

    it.each([
        {
            query: '[',
            expectedHightlight: '<b>[</b>Test] Label',
        },
        {
            query: 'Label',
            expectedHightlight: '[Test] <b>Label</b>',
        },
    ])('highlights the label correctly', ({ query, expectedHightlight }) => {
        const label = '[Test] Label'
        render(
            <DropdownContext.Provider value={{ ...mockContext, query }}>
                <FilterDropdownItemLabel label={label} />
            </DropdownContext.Provider>,
        )
        expect(screen.getByTestId('filter-dropdown-item-label')).toContainHTML(
            expectedHightlight,
        )
    })
})
