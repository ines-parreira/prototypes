import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'
import { useMetafieldDefinitions } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/hooks/useMetafieldDefinitions'

import { MetafieldsList } from '../MetafieldsList'
import type { MetafieldsListProps } from '../types'

jest.mock(
    'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/hooks/useMetafieldDefinitions',
)

const mockUseMetafieldDefinitions =
    useMetafieldDefinitions as jest.MockedFunction<
        typeof useMetafieldDefinitions
    >

const mockCustomerFields = [
    {
        id: '1',
        key: 'loyalty_points',
        name: 'Loyalty Points',
        type: 'number_integer' as const,
        category: 'Customer' as const,
        isVisible: true,
    },
    {
        id: '2',
        key: 'vip_status',
        name: 'VIP Status',
        type: 'single_line_text_field' as const,
        category: 'Customer' as const,
        isVisible: true,
    },
]

const mockOrderFields = [
    {
        id: '3',
        key: 'tracking_number',
        name: 'Tracking Number',
        type: 'single_line_text_field' as const,
        category: 'Order' as const,
        isVisible: true,
    },
]

const allMockFields = [...mockCustomerFields, ...mockOrderFields]

const defaultProps: MetafieldsListProps = {
    integrationId: 123,
    category: 'Customer',
    onSelect: jest.fn(),
}

const renderComponent = (props: Partial<MetafieldsListProps> = {}) => {
    return render(
        <ThemeProvider>
            <MetafieldsList {...defaultProps} {...props} />
        </ThemeProvider>,
    )
}

describe('<MetafieldsList />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseMetafieldDefinitions.mockReturnValue({
            data: allMockFields,
            isLoading: false,
            isError: false,
            error: null,
        })
    })

    it('shows loading skeleton when data is loading', () => {
        mockUseMetafieldDefinitions.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            error: null,
        })

        renderComponent()

        expect(screen.getByLabelText('loading')).toBeInTheDocument()
    })

    it('shows "No metafields imported" when category has no metafields', () => {
        mockUseMetafieldDefinitions.mockReturnValue({
            data: mockOrderFields,
            isLoading: false,
            isError: false,
            error: null,
        })

        renderComponent({ category: 'Customer' })

        expect(screen.getByText('No metafields imported')).toBeInTheDocument()
    })

    it('renders list of metafields for selected category', () => {
        renderComponent({ category: 'Customer' })

        expect(screen.getByText('Loyalty Points')).toBeInTheDocument()
        expect(screen.getByText('VIP Status')).toBeInTheDocument()
        expect(screen.queryByText('Tracking Number')).not.toBeInTheDocument()
    })

    it('filters metafields by search query', async () => {
        const user = userEvent.setup()
        renderComponent({ category: 'Customer' })

        const searchInput = screen.getByPlaceholderText('Search')
        await user.type(searchInput, 'Loyalty')

        expect(screen.getByText('Loyalty Points')).toBeInTheDocument()
        expect(screen.queryByText('VIP Status')).not.toBeInTheDocument()
    })

    it('shows "No metafields found" when search has no results', async () => {
        const user = userEvent.setup()
        renderComponent({ category: 'Customer' })

        const searchInput = screen.getByPlaceholderText('Search')
        await user.type(searchInput, 'nonexistent')

        expect(screen.getByText('No metafields found')).toBeInTheDocument()
    })

    it('calls onSelect with field when metafield is clicked', async () => {
        const user = userEvent.setup()
        const onSelect = jest.fn()
        renderComponent({ onSelect, category: 'Customer' })

        await user.click(screen.getByRole('button', { name: 'Loyalty Points' }))

        expect(onSelect).toHaveBeenCalledTimes(1)
        expect(onSelect).toHaveBeenCalledWith(mockCustomerFields[0])
    })

    it('search is case insensitive', async () => {
        const user = userEvent.setup()
        renderComponent({ category: 'Customer' })

        const searchInput = screen.getByPlaceholderText('Search')
        await user.type(searchInput, 'LOYALTY')

        expect(screen.getByText('Loyalty Points')).toBeInTheDocument()
    })

    it('renders metafields for Order category', () => {
        renderComponent({ category: 'Order' })

        expect(screen.getByText('Tracking Number')).toBeInTheDocument()
        expect(screen.queryByText('Loyalty Points')).not.toBeInTheDocument()
    })

    it('calls useMetafieldDefinitions with correct parameters', () => {
        renderComponent({ integrationId: 456 })

        expect(mockUseMetafieldDefinitions).toHaveBeenCalledWith({
            integrationId: 456,
            pinned: true,
        })
    })
})
