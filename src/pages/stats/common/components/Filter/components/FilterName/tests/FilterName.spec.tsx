import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterName from 'pages/stats/common/components/Filter/components/FilterName/FilterName'
import {FILTER_NAME_MAX_WIDTH} from 'pages/stats/common/components/Filter/constants'

describe('FilterName', () => {
    it('renders the filter name correctly', () => {
        const name = 'Test Filter'
        const {getByText} = render(<FilterName name={name} />)
        const filterNameElement = getByText(name)
        expect(filterNameElement).toBeInTheDocument()
    })

    it('applies the provided className', () => {
        const name = 'Test Filter'
        const className = 'custom-class'
        const {container} = render(
            <FilterName name={name} className={className} />
        )
        const filterNameElement = container.firstChild
        expect(filterNameElement).toHaveClass(className)
    })

    it('shows the tooltip when the filter name is too long', async () => {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            configurable: true,
            value: FILTER_NAME_MAX_WIDTH,
        })

        const name = 'Test Filter'
        render(<FilterName name={name} />)

        userEvent.hover(screen.getByTestId('filter-name'))

        await waitFor(() =>
            expect(screen.getByRole('tooltip')).toBeInTheDocument()
        )
    })
})
