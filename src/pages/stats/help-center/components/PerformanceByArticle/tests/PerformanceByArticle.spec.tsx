import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {PerformanceByArticle} from '../PerformanceByArticle'

const renderComponent = () => {
    render(<PerformanceByArticle />)
}

describe('<PerformanceByArticle/>', () => {
    it('should render', () => {
        renderComponent()
        expect(screen.getByText('Performance by articles')).toBeInTheDocument()
    })

    it('should paginate to the next page', () => {
        renderComponent()

        expect(screen.getByText('1')).toHaveAttribute('aria-current', 'true')
        expect(screen.getByText('2')).toHaveAttribute('aria-current', 'false')

        userEvent.click(screen.getByText('2'))

        expect(screen.getByText('1')).toHaveAttribute('aria-current', 'false')
        expect(screen.getByText('2')).toHaveAttribute('aria-current', 'true')
    })
})
