import {render, screen} from '@testing-library/react'
import React from 'react'

import TopLocationItem from '../TopLocationItem/TopLocationItem'

const location = {
    id: '1',
    title: 'New York',
    percentage: 100,
}

describe('TopLocationItem', () => {
    it('renders', () => {
        render(<TopLocationItem location={location} />)

        const bar = document.querySelector('.bar')

        expect(screen.getByText('New York')).toBeInTheDocument()
        expect(screen.getByText('100%')).toBeInTheDocument()
        expect(bar).toHaveAttribute('style', 'width: 100%;')
    })

    it('should handle percentage 0', () => {
        render(<TopLocationItem location={{...location, percentage: 0}} />)

        const bar = document.querySelector('.bar')

        expect(screen.getByText('New York')).toBeInTheDocument()
        expect(screen.getByText('0%')).toBeInTheDocument()
        expect(bar).toHaveAttribute('style', 'width: 1px;')
    })

    it('should handle percentage greater than 100', () => {
        render(<TopLocationItem location={{...location, percentage: 120}} />)
        const bar = document.querySelector('.bar')

        expect(screen.getByText('120%')).toBeInTheDocument()
        expect(bar).toHaveAttribute('style', 'width: 100%;')
    })

    it('should handle percentage lower than 0', () => {
        render(<TopLocationItem location={{...location, percentage: -10}} />)
        const bar = document.querySelector('.bar')

        expect(screen.getByText('-10%')).toBeInTheDocument()
        expect(bar).toHaveAttribute('style', 'width: 1px;')
    })

    it('should handle float percentage', () => {
        render(<TopLocationItem location={{...location, percentage: 5.5}} />)
        const bar = document.querySelector('.bar')

        expect(screen.getByText('5.5%')).toBeInTheDocument()
        expect(bar).toHaveAttribute('style', 'width: 5.5%;')
    })
})
