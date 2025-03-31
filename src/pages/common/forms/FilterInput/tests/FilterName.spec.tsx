import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import FilterName from '../FilterName'

describe('FilterName', () => {
    it('renders the filter name correctly', () => {
        const name = 'Test Filter'
        const { getByText } = render(<FilterName name={name} />)
        const filterNameElement = getByText(name)
        expect(filterNameElement).toBeInTheDocument()
    })

    it('applies the provided className', () => {
        const name = 'Test Filter'
        const className = 'custom-class'
        const { container } = render(
            <FilterName name={name} className={className} />,
        )
        const filterNameElement = container.firstChild
        expect(filterNameElement).toHaveClass(className)
    })

    it('shows the tooltip when the filter name is too long', async () => {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            configurable: true,
            value: 100,
        })

        const name = 'Test Filter'
        render(<FilterName name={name} maxWidth={90} />)

        userEvent.hover(screen.getByTestId('filter-name'))

        await waitFor(() =>
            expect(screen.getByRole('tooltip')).toBeInTheDocument(),
        )
    })

    it('renders the provided warning node', () => {
        const name = 'Test Filter'
        const warningNode = <span data-testid="warning-node">!</span>
        render(<FilterName name={name} warning={warningNode} />)

        expect(screen.getByTestId('warning-node')).toBeInTheDocument()
    })
})
