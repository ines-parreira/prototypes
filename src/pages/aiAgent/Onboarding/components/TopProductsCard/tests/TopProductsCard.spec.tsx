import { render, screen } from '@testing-library/react'

import { shopifyIntegration } from 'fixtures/integrations'
import useTopProducts from 'pages/aiAgent/Onboarding/components/TopProductsCard/hooks'
import { assumeMock } from 'utils/testing'

import TopProductsCard from '../TopProductsCard'

const products = [
    {
        id: 1,
        title: 'Nike Air Max plus',
        description: '1593 sales',
        price: 199,
        featuredImage:
            'https://athlete-shift.myshopify.com/cdn/shop/products/8cd561824439482e3cea5ba8e3a6e2f6.jpg?v=1661766740&width=533',
    },
    {
        id: 2,
        title: 'Nike Air Max plus',
        description: '1593 sales',
        price: 199,
        featuredImage:
            'https://athlete-shift.myshopify.com/cdn/shop/products/8cd561824439482e3cea5ba8e3a6e2f6.jpg?v=1661766740&width=533',
    },
    {
        id: 3,
        title: 'Nike Air Max plus',
        description: '1593 sales',
        price: 199,
        featuredImage:
            'https://athlete-shift.myshopify.com/cdn/shop/products/8cd561824439482e3cea5ba8e3a6e2f6.jpg?v=1661766740&width=533',
    },
]

jest.mock('pages/aiAgent/Onboarding/components/TopProductsCard/hooks')
const useTopProductsMock = assumeMock(useTopProducts)

describe('TopProductsCard', () => {
    it('renders', () => {
        useTopProductsMock.mockReturnValueOnce({
            isLoading: false,
            data: products,
        })

        render(
            <TopProductsCard
                title="Top products"
                integration={shopifyIntegration}
            />,
        )

        expect(screen.getAllByText('Nike Air Max plus').length).toBe(3)
        expect(screen.getAllByText('$199').length).toBe(3)
        expect(screen.getAllByText('1593 sales').length).toBe(3)
    })

    it('renders with different currency', () => {
        useTopProductsMock.mockReturnValueOnce({
            isLoading: false,
            data: products.map((product) => ({
                ...product,
                currency: 'JPY',
            })),
        })

        render(
            <TopProductsCard
                title="Top products"
                integration={shopifyIntegration}
            />,
        )

        expect(screen.getAllByText('Nike Air Max plus').length).toBe(3)
        expect(screen.getAllByText('¥199').length).toBe(3)
        expect(screen.getAllByText('1593 sales').length).toBe(3)
    })

    it('renders skeleton when loading', () => {
        useTopProductsMock.mockReturnValueOnce({
            isLoading: false,
            data: products,
        })

        render(
            <TopProductsCard
                title="Top products"
                integration={shopifyIntegration}
            />,
        )

        expect(screen.queryAllByText('Nike Air Max plus').length).toBe(3)
    })
})
