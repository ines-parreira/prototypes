import { QueryClientProvider } from '@tanstack/react-query'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { appQueryClient } from 'api/queryClient'

import TopProductsCard from './TopProductsCard'

import './TopProductsCard.less'

const meta = {
    title: 'AI Agent/Onboarding_V2/TopProductsCard',
    component: TopProductsCard,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <QueryClientProvider client={appQueryClient}>
                <Story />
            </QueryClientProvider>
        ),
    ],
} satisfies Meta<typeof TopProductsCard>

export default meta

type Story = StoryObj<typeof meta>

const defaultProduct = {
    title: 'Nike Air Max plus',
    description: '1593 sales',
    price: 199,
    featuredImage:
        'https://athlete-shift.myshopify.com/cdn/shop/products/8cd561824439482e3cea5ba8e3a6e2f6.jpg?v=1661766740&width=533',
}

const products = [
    { id: 1, ...defaultProduct },
    { id: 2, ...defaultProduct },
]

export const Default: Story = {
    args: {
        title: 'Top products',
        isLoading: false,
        products: products,
    },
    render: (args) => {
        return <TopProductsCard {...args} />
    },
}

export const LoadingState: Story = {
    args: {
        title: 'Top products',
        isLoading: true,
        products: [],
    },
    render: (args) => {
        return <TopProductsCard {...args} />
    },
}

export const DifferentCurrency: Story = {
    args: {
        title: 'Top products',
        isLoading: false,
        products: [
            { id: 4, currency: 'JPY', ...defaultProduct },
            { id: 5, currency: 'JPY', ...defaultProduct },
            { id: 6, currency: 'JPY', ...defaultProduct },
        ],
    },
    render: (args) => {
        return <TopProductsCard {...args} />
    },
}

export const LongName: Story = {
    args: {
        title: 'Top products',
        isLoading: false,
        products: [
            {
                id: 4,
                ...defaultProduct,
                title: 'Maybelline Color Sensational Color Elixir Lip Lacquer Lipgloss',
            },
            { id: 5, ...defaultProduct },
            { id: 6, ...defaultProduct },
        ],
    },
    render: (args) => {
        return <TopProductsCard {...args} />
    },
}
