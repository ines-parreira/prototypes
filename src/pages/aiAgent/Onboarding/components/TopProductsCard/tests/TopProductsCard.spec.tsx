import React from 'react'

import { render, screen } from '@testing-library/react'

import TopProductsCard from '../TopProductsCard'

const products = [
    {
        id: '1',
        title: 'Nike Air Max plus',
        description: '1593 sales',
        price: 199,
        featuredImage:
            'https://athlete-shift.myshopify.com/cdn/shop/products/8cd561824439482e3cea5ba8e3a6e2f6.jpg?v=1661766740&width=533',
    },
    {
        id: '2',
        title: 'Nike Air Max plus',
        description: '1593 sales',
        price: 199,
        featuredImage:
            'https://athlete-shift.myshopify.com/cdn/shop/products/8cd561824439482e3cea5ba8e3a6e2f6.jpg?v=1661766740&width=533',
    },
    {
        id: '3',
        title: 'Nike Air Max plus',
        description: '1593 sales',
        price: 199,
        featuredImage:
            'https://athlete-shift.myshopify.com/cdn/shop/products/8cd561824439482e3cea5ba8e3a6e2f6.jpg?v=1661766740&width=533',
    },
]

describe('TopProductsCard', () => {
    it('renders', () => {
        render(<TopProductsCard title="Top products" products={products} />)

        expect(screen.getAllByText('Nike Air Max plus').length).toBe(3)
        expect(screen.getAllByText('$199').length).toBe(3)
        expect(screen.getAllByText('1593 sales').length).toBe(3)
    })

    it('renders with different currency', () => {
        const productsJPY = products.map((product) => ({
            currency: 'JPY',
            ...product,
        }))
        render(<TopProductsCard title="Top products" products={productsJPY} />)

        expect(screen.getAllByText('Nike Air Max plus').length).toBe(3)
        expect(screen.getAllByText('¥199').length).toBe(3)
        expect(screen.getAllByText('1593 sales').length).toBe(3)
    })
})
