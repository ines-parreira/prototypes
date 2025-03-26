import type { Meta, StoryObj } from '@storybook/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { appQueryClient } from 'api/queryClient'
import { shopifyIntegration } from 'fixtures/integrations'

import { setUseTopProducts } from './hooks'
import TopProductsCard from './TopProductsCard'

import './TopProductsCard.less'

const mockUseTopProducts = (implementation: any) => {
    setUseTopProducts(implementation)
}

const meta = {
    title: 'AI Agent/Onboarding/TopProductsCard',
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

export const Default: Story = {
    args: {
        title: 'Top products',
        integration: shopifyIntegration,
    },
    render: (args) => {
        mockUseTopProducts(() => ({
            isLoading: false,
            data: [
                { id: 1, ...defaultProduct },
                { id: 2, ...defaultProduct },
            ],
        }))
        return <TopProductsCard {...args} />
    },
}

export const LoadingState: Story = {
    args: {
        title: 'Top products',
        integration: shopifyIntegration,
    },
    render: (args) => {
        mockUseTopProducts(() => ({
            isLoading: true,
            data: [],
        }))
        return <TopProductsCard {...args} />
    },
}

export const DifferentCurrency: Story = {
    args: {
        title: 'Top products',
        integration: shopifyIntegration,
    },
    render: (args) => {
        mockUseTopProducts(() => ({
            isLoading: false,
            data: [
                { id: '4', currency: 'JPY', ...defaultProduct },
                { id: '5', currency: 'JPY', ...defaultProduct },
                { id: '6', currency: 'JPY', ...defaultProduct },
            ],
        }))
        return <TopProductsCard {...args} />
    },
}

export const LongName: Story = {
    args: {
        title: 'Top products',
        integration: shopifyIntegration,
    },
    render: (args) => {
        mockUseTopProducts(() => ({
            isLoading: false,
            data: [
                {
                    id: 4,
                    ...defaultProduct,
                    title: 'Maybelline Color Sensational Color Elixir Lip Lacquer Lipgloss',
                },
                { id: 5, ...defaultProduct },
                { id: 6, ...defaultProduct },
            ],
        }))
        return <TopProductsCard {...args} />
    },
}
