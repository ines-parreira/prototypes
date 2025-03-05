import React from 'react'

import { render, screen } from '@testing-library/react'

import TopProductRecommendationTable from '../TopProductRecommendationTable'

describe('<TopProductRecommendationTable />', () => {
    beforeAll(() => {})

    it('renders', () => {
        render(<TopProductRecommendationTable />)

        expect(screen.getByText('Top Products Recommended')).toBeInTheDocument()
        expect(screen.getByText('Product name')).toBeInTheDocument()
        expect(screen.getByText('# times recommended')).toBeInTheDocument()
        expect(screen.getByText('CTR')).toBeInTheDocument()
        expect(screen.getByText('BTR')).toBeInTheDocument()
    })

    it('navigates pages correctly', () => {
        render(<TopProductRecommendationTable />)

        // Check initial state
        expect(screen.getByText('Product 9')).toBeInTheDocument()
        expect(screen.queryByText('Product 18')).not.toBeInTheDocument()

        // Navigate to next page
        screen.getByText('keyboard_arrow_right').click()
        expect(screen.getByText('Product 18')).toBeInTheDocument()
        expect(screen.queryByText('Product 9')).not.toBeInTheDocument()

        // Navigate back to previous page
        screen.getByText('keyboard_arrow_left').click()
        expect(screen.getByText('Product 9')).toBeInTheDocument()
        expect(screen.queryByText('Product 18')).not.toBeInTheDocument()
    })

    it('sorts columns correctly', () => {
        render(<TopProductRecommendationTable />)

        // Check initial state
        expect(screen.getByText('Product 9')).toBeInTheDocument()
        expect(screen.getByText('Product 8')).toBeInTheDocument()

        // Sort by Number of Recommendations
        screen.getByText('# times recommended').click()
        expect(screen.getByText('Product 1')).toBeInTheDocument()
        expect(screen.getByText('Product 2')).toBeInTheDocument()

        // Sort by CTR
        screen.getByText('CTR').click()
        expect(screen.getByText('Product 20')).toBeInTheDocument()
        expect(screen.getByText('Product 19')).toBeInTheDocument()

        // Sort by BTR
        screen.getByText('BTR').click()
        expect(screen.getByText('Product 1')).toBeInTheDocument()
        expect(screen.getByText('Product 2')).toBeInTheDocument()
        screen.getByText('BTR').click()
        expect(screen.getByText('Product 20')).toBeInTheDocument()
        expect(screen.getByText('Product 19')).toBeInTheDocument()
    })
})
