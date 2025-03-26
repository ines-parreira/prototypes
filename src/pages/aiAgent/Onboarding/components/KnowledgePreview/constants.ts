import { TopElement } from 'pages/aiAgent/Onboarding/components/TopElementsCard/types'
import { Product } from 'pages/aiAgent/Onboarding/components/TopProductsCard/types'

export const mockedLocations: TopElement[] = [
    {
        id: 'product-1',
        title: 'New York',
        percentage: 100,
    },
    {
        id: 'product-2',
        title: 'Paris',
        percentage: 75,
    },
    {
        id: 'product-3',
        title: 'Los Angeles',
        percentage: 40,
    },
    {
        id: 'product-4',
        title: 'Tokyo',
        percentage: 5,
    },
]

export const mockedCategories: TopElement[] = [
    {
        id: 'category-1',
        title: 'Clothes',
        percentage: 50,
    },
    {
        id: 'category-2',
        title: 'Makeup',
        percentage: 25,
    },
    {
        id: 'category-3',
        title: 'Jewelry',
        percentage: 10,
    },
]

export const mockedProducts: Product[] = [
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
    {
        id: 4,
        title: 'Nike Air Max plus',
        description: '1593 sales',
        price: 199,
        featuredImage:
            'https://athlete-shift.myshopify.com/cdn/shop/products/8cd561824439482e3cea5ba8e3a6e2f6.jpg?v=1661766740&width=533',
    },
]

export const mockedAverageOrders = [
    {
        label: 'Line',
        values: [
            {
                x: 'Nov 30',
                y: 275,
            },
            {
                x: 'Dec 1',
                y: 400,
            },
            {
                x: 'Dec 2',
                y: 325,
            },
            {
                x: 'Dec 3',
                y: 450,
            },
            {
                x: 'Dec 4',
                y: 390,
            },
            {
                x: 'Dec 5',
                y: 390,
            },
            {
                x: 'Dec 6',
                y: 475,
            },
            {
                x: 'Dec 7',
                y: 600,
            },
            {
                x: 'Dec 8',
                y: 575,
            },
        ],
    },
]
