import React from 'react'

import { render, screen } from '@testing-library/react'

import { ProductTableContentCell } from '../../types/productTable'
import { TopProductRecommendationTableStats } from '../TopProductRecommendationTableStats'

const product = {
    id: 1,
    title: 'Product 1',
    handle: 'product-1',
    image: null,
    created_at: new Date().toISOString(),
    variants: [],
    images: [],
    options: [],
    url: 'https://example.com/product-1',
}
const rowsWithLink: ProductTableContentCell[] = [
    {
        product: product,
        metrics: {},
    },
]
const rowsWithoutLink: ProductTableContentCell[] = [
    {
        product: {
            ...product,
            url: undefined,
        },
        metrics: {},
    },
]

describe('<TopProductRecommendationTableStats />', () => {
    beforeAll(() => {})

    it('renders with links', () => {
        render(
            <TopProductRecommendationTableStats
                isLoading={false}
                rows={rowsWithLink}
                offset={0}
                perPage={10}
                onClickNextPage={() => {}}
                onClickPrevPage={() => {}}
            />,
        )

        expect(screen.getByText('Product name')).toBeInTheDocument()
        expect(screen.getByText('Product 1')).toBeInTheDocument()

        expect(screen.getByRole('link', { name: 'Product 1' })).toHaveAttribute(
            'href',
            'https://example.com/product-1',
        )
    })

    it('renders without links', () => {
        render(
            <TopProductRecommendationTableStats
                isLoading={false}
                rows={rowsWithoutLink}
                offset={0}
                perPage={10}
                onClickNextPage={() => {}}
                onClickPrevPage={() => {}}
            />,
        )

        expect(screen.getByText('Product name')).toBeInTheDocument()
        expect(screen.getByText('Product 1')).toBeInTheDocument()

        expect(
            screen.queryByRole('link', { name: 'Product 1' }),
        ).not.toBeInTheDocument()
    })

    it('renders loading', () => {
        render(
            <TopProductRecommendationTableStats
                isLoading={true}
                rows={rowsWithLink}
                offset={0}
                perPage={10}
                onClickNextPage={() => {}}
                onClickPrevPage={() => {}}
            />,
        )

        expect(screen.getByText('Product name')).toBeInTheDocument()
        expect(screen.queryByText('Product 1')).not.toBeInTheDocument()
    })

    it('renders loading without rows', () => {
        render(
            <TopProductRecommendationTableStats
                isLoading={true}
                rows={[]}
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
