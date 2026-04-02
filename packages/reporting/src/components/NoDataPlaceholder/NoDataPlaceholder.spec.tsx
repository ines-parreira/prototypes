import { render, screen } from '@testing-library/react'

import { NoDataPlaceholder } from './NoDataPlaceholder'

describe('NoDataPlaceholder', () => {
    it('should render the heading and description', () => {
        render(<NoDataPlaceholder />)

        expect(screen.getByText('No data found')).toBeInTheDocument()
        expect(
            screen.getByText('Try to adjust your report filters.'),
        ).toBeInTheDocument()
    })

    it('should apply the default height', () => {
        const { container } = render(<NoDataPlaceholder />)

        expect(container.firstChild).toHaveStyle({ height: '274px' })
    })

    it('should apply a custom height when provided', () => {
        const { container } = render(<NoDataPlaceholder height="400px" />)

        expect(container.firstChild).toHaveStyle({ height: '400px' })
    })
})
