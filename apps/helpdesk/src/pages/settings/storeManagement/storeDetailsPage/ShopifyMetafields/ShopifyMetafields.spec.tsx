import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { useMetafields } from './hooks/useMetafields'
import ShopifyMetafields from './ShopifyMetafields'

jest.mock('./hooks/useMetafields')
const useMetafieldsMock = assumeMock(useMetafields)

const mockMetafieldsData = [
    {
        id: '1',
        name: 'Customer Email',
        type: 'single_line_text',
        category: 'customer',
        isVisible: true,
    },
    {
        id: '2',
        name: 'Order Notes',
        type: 'multi_line_text',
        category: 'order',
        isVisible: false,
    },
]

describe('ShopifyMetafields', () => {
    let queryClient: QueryClient

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    it('should render the explainer text correctly', () => {
        useMetafieldsMock.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        render(<ShopifyMetafields />, { wrapper })

        expect(screen.getByText(/Manage/, { exact: false })).toBeInTheDocument()
        expect(
            screen.getByText(
                /from your Shopify store to Gorgias and choose which ones to show in each customer's profile/,
                { exact: false },
            ),
        ).toBeInTheDocument()
    })

    it('should render the MetafieldsTable component with data', () => {
        useMetafieldsMock.mockReturnValue({
            data: mockMetafieldsData,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        render(<ShopifyMetafields />, { wrapper })

        expect(screen.getByText('Customer Email')).toBeInTheDocument()
        expect(screen.getByText('Order Notes')).toBeInTheDocument()
    })

    it('should pass empty array to MetafieldsTable when data is undefined', () => {
        useMetafieldsMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        render(<ShopifyMetafields />, { wrapper })
        expect(screen.getByText('No data available.')).toBeInTheDocument()
    })

    it('should pass isLoading state to MetafieldsTable', () => {
        useMetafieldsMock.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            error: null,
        } as any)

        render(<ShopifyMetafields />, { wrapper })

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(1)
    })

    it('should render metafields styled text with correct class', () => {
        useMetafieldsMock.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        render(<ShopifyMetafields />, { wrapper })

        const metafieldsSpan = screen
            .getByText(/Manage/)
            .closest('p')
            ?.querySelector('span')
        expect(metafieldsSpan).toBeInTheDocument()
        expect(metafieldsSpan).toHaveTextContent('metafields')
    })
})
