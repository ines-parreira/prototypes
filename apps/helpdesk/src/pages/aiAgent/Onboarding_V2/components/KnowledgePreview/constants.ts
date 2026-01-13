import type { TopElement } from 'pages/aiAgent/Onboarding_V2/components/TopElementsCard/types'
import type { Product } from 'pages/aiAgent/Onboarding_V2/components/TopProductsCard/types'

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

const generateRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const generateMockedProducts = (count: number): Product[] => {
    return Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        title: 'Skin care cream',
        description: `${generateRandomNumber(100, 5000)} sales`, // Random sales count between 100 and 5000
        price: generateRandomNumber(10, 100), // Random price between $10 and $100
        featuredImage:
            require('assets/img/ai-agent/ai-sales-agent-product-card.png') as string,
    }))
}

export const mockedProducts: Product[] = generateMockedProducts(10) // Generate 10 dynamic products
