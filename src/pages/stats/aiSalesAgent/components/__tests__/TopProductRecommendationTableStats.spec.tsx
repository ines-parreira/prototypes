import React from 'react'

import { render, screen } from '@testing-library/react'

import { ProductTableContentCell } from '../../types/productTable'
import { TopProductRecommendationTableStats } from '../TopProductRecommendationTableStats'

const rows: ProductTableContentCell[] = [
    {
        product: {
            id: 1,
            title: 'Product 1',
            handle: 'product-1',
            image: null,
            created_at: new Date().toISOString(),
            variants: [],
            images: [],
            options: [],
        },
        metrics: {},
    },
]

describe('<TopProductRecommendationTableStats />', () => {
    beforeAll(() => {})

    it('renders', () => {
        render(
            <TopProductRecommendationTableStats
                isLoading={false}
                rows={rows}
                offset={0}
                perPage={10}
                onClickNextPage={() => {}}
                onClickPrevPage={() => {}}
            />,
        )

        expect(screen.getByText('Product name')).toBeInTheDocument()
        expect(screen.getByText('Product 1')).toBeInTheDocument()
    })

    it('renders loading', () => {
        render(
            <TopProductRecommendationTableStats
                isLoading={true}
                rows={rows}
                offset={0}
                perPage={10}
                onClickNextPage={() => {}}
                onClickPrevPage={() => {}}
            />,
        )

        expect(screen.getByText('Product name')).toBeInTheDocument()
        expect(screen.queryByText('Product 1')).not.toBeInTheDocument()
    })
})
