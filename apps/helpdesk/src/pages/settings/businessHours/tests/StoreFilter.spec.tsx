import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/constants'
import type {
    BigCommerceIntegration,
    Magento2Integration,
    ShopifyIntegration,
} from 'models/integration/types'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

import StoreFilter from '../StoreFilter'

jest.mock('pages/common/components/StoreSelector/StoreSelector', () => {
    return function MockStoreSelector({
        integrations,
        selected,
        onChange,
    }: any) {
        return (
            <div data-testid="store-selector">
                <div data-testid="selected-store">
                    {selected?.name || 'All Stores'}
                </div>
                <button
                    key={null}
                    data-testid="all-stores-option"
                    onClick={() => onChange(null)}
                >
                    All Stores
                </button>
                {integrations.map((integration: any) => (
                    <button
                        key={integration.id}
                        data-testid={`store-option-${integration.id}`}
                        onClick={() => onChange(integration.id)}
                    >
                        {integration.name}
                    </button>
                ))}
                <button
                    key={-1}
                    data-testid="non-existent-store-option"
                    onClick={() => onChange(-1)}
                >
                    Non-existent Store
                </button>
            </div>
        )
    }
})

const shopifyStore: ShopifyIntegration = {
    id: 0,
    type: IntegrationType.Shopify,
    name: 'Test Shopify Store',
} as ShopifyIntegration
const bigCommerceStore: BigCommerceIntegration = {
    id: 1,
    type: IntegrationType.BigCommerce,
    name: 'Test BigCommerce Store',
} as BigCommerceIntegration
const magento2Store: Magento2Integration = {
    id: 2,
    type: IntegrationType.Magento2,
    name: 'Test Magento2 Store',
} as Magento2Integration

const createMockState = (integrations: any[] = []): Partial<RootState> => ({
    integrations: fromJS({
        integrations,
    }),
})

describe('StoreFilter', () => {
    const mockOnChange = jest.fn()

    beforeEach(() => {
        mockOnChange.mockClear()
    })

    it('should render correctly with no store integrations', () => {
        const state = createMockState([])
        renderWithStore(<StoreFilter onChange={mockOnChange} />, state)

        expect(screen.getByTestId('store-selector')).toBeInTheDocument()
        expect(screen.getByTestId('selected-store')).toHaveTextContent(
            'All Stores',
        )
    })

    it('should render correctly with store integrations', () => {
        const state = createMockState([
            shopifyStore,
            bigCommerceStore,
            magento2Store,
        ])
        renderWithStore(<StoreFilter onChange={mockOnChange} />, state)

        expect(screen.getByTestId('selected-store')).toHaveTextContent(
            'All Stores',
        )
        expect(screen.getByTestId('store-option-0')).toHaveTextContent(
            'Test Shopify Store',
        )
        expect(screen.getByTestId('store-option-1')).toHaveTextContent(
            'Test BigCommerce Store',
        )
        expect(screen.getByTestId('store-option-2')).toHaveTextContent(
            'Test Magento2 Store',
        )
    })

    it('should handle store selection correctly', async () => {
        const user = userEvent.setup()

        const state = createMockState([shopifyStore, bigCommerceStore])
        renderWithStore(<StoreFilter onChange={mockOnChange} />, state)

        await act(() => user.click(screen.getByTestId('store-option-1')))

        expect(mockOnChange).toHaveBeenCalledWith(1)
        expect(screen.getByTestId('selected-store')).toHaveTextContent(
            bigCommerceStore.name,
        )
    })

    it('should handle selecting all stores correctly', async () => {
        const user = userEvent.setup()

        const state = createMockState([shopifyStore])
        renderWithStore(<StoreFilter onChange={mockOnChange} />, state)

        await act(() => user.click(screen.getByTestId('all-stores-option')))

        expect(mockOnChange).toHaveBeenCalledWith(null)
        expect(screen.getByTestId('selected-store')).toHaveTextContent(
            'All Stores',
        )
    })

    it('should maintain internal state for selected integration', async () => {
        const user = userEvent.setup()

        const state = createMockState([shopifyStore, bigCommerceStore])
        const { rerenderComponent } = renderWithStore(
            <StoreFilter onChange={mockOnChange} />,
            state,
        )

        await act(() => user.click(screen.getByTestId('store-option-0')))

        expect(screen.getByTestId('selected-store')).toHaveTextContent(
            shopifyStore.name,
        )

        // Rerender to check internal state is maintained
        rerenderComponent(<StoreFilter onChange={mockOnChange} />, state)

        expect(screen.getByTestId('selected-store')).toHaveTextContent(
            shopifyStore.name,
        )
    })

    it('should handle non-existent integration ID gracefully', async () => {
        const user = userEvent.setup()

        const state = createMockState([shopifyStore])
        renderWithStore(<StoreFilter onChange={mockOnChange} />, state)

        await act(() =>
            user.click(screen.getByTestId('non-existent-store-option')),
        )

        expect(mockOnChange).toHaveBeenCalledWith(null)
    })
})
