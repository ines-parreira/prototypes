import React from 'react'

import { render, screen } from '@testing-library/react'

import TopElementItem from '../TopElementItem/TopElementItem'

const element = {
    id: '1',
    title: 'New York',
    percentage: 100,
}

describe('TopElementItem', () => {
    it('renders', () => {
        render(<TopElementItem topElement={element} />)

        const bar = document.querySelector('.bar')

        expect(screen.getByText('New York')).toBeInTheDocument()
        expect(screen.getByText('100%')).toBeInTheDocument()
        expect(bar).toHaveAttribute('style', 'width: 350px;')
    })

    it('should handle percentage 0', () => {
        render(<TopElementItem topElement={{ ...element, percentage: 0 }} />)

        const bar = document.querySelector('.bar')

        expect(screen.getByText('New York')).toBeInTheDocument()
        expect(screen.getByText('0%')).toBeInTheDocument()
        expect(bar).toHaveAttribute('style', 'width: 1px;')
    })

    it('should handle percentage greater than 100', () => {
        render(<TopElementItem topElement={{ ...element, percentage: 120 }} />)
        const bar = document.querySelector('.bar')

        expect(screen.getByText('120%')).toBeInTheDocument()
        expect(bar).toHaveAttribute('style', 'width: 350px;')
    })

    it('should handle percentage lower than 0', () => {
        render(<TopElementItem topElement={{ ...element, percentage: -10 }} />)
        const bar = document.querySelector('.bar')

        expect(screen.getByText('-10%')).toBeInTheDocument()
        expect(bar).toHaveAttribute('style', 'width: 1px;')
    })

    it('should handle float percentage', () => {
        render(<TopElementItem topElement={{ ...element, percentage: 5.5 }} />)
        const bar = document.querySelector('.bar')

        expect(screen.getByText('5.5%')).toBeInTheDocument()
        expect(bar).toHaveAttribute('style', 'width: 19.25px;')
    })
})
