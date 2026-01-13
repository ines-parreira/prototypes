import React from 'react'

import { render, screen } from '@testing-library/react'

import TopProductItem from '../TopProductItem'

const product = {
    id: 1,
    title: 'Nike Air Max plus',
    description: '1593 sales',
    price: 199,
    featuredImage:
        'https://athlete-shift.myshopify.com/cdn/shop/products/8cd561824439482e3cea5ba8e3a6e2f6.jpg?v=1661766740&width=533',
}

describe('TopProductItem', () => {
    it('renders', () => {
        render(<TopProductItem product={product} />)

        expect(screen.getByText('Nike Air Max plus')).toBeInTheDocument()
        expect(screen.getByText('$199')).toBeInTheDocument()
        expect(screen.getByText('1593 sales')).toBeInTheDocument()
    })

    it('renders with different currency', () => {
        render(<TopProductItem product={{ currency: 'JPY', ...product }} />)

        expect(screen.getByText('Nike Air Max plus')).toBeInTheDocument()
        expect(screen.getByText('¥199')).toBeInTheDocument()
        expect(screen.getByText('1593 sales')).toBeInTheDocument()
    })
})
