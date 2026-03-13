import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Product } from 'constants/integrations/types/shopify'

import { TestingProductCard } from './TestingProductCard'

jest.mock('AIJourney/components/ProductSelect/ProductSelect', () => ({
    ProductSelect: jest.fn(({ selectedProduct, setSelectedProduct }) => (
        <div>
            <button
                onClick={() =>
                    setSelectedProduct({
                        id: '1',
                        title: 'Black Shirt',
                    } as unknown as Product)
                }
            >
                Mock ProductSelect
            </button>
            {selectedProduct && <span>Selected: {selectedProduct.title}</span>}
        </div>
    )),
}))

describe('<TestingProductCard />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('rendering', () => {
        it('should render the card title', () => {
            render(<TestingProductCard />)

            expect(screen.getByText('Testing product')).toBeInTheDocument()
        })

        it('should render the caption text', () => {
            render(<TestingProductCard />)

            expect(
                screen.getByText(
                    'Select the product that will be used in testing messages.',
                ),
            ).toBeInTheDocument()
        })

        it('should render the ProductSelect component', () => {
            render(<TestingProductCard />)

            expect(
                screen.getByRole('button', { name: /mock productselect/i }),
            ).toBeInTheDocument()
        })

        it('should pass selectedProduct to ProductSelect', () => {
            const product = {
                id: '2',
                title: 'White Shirt',
            } as unknown as Product

            render(<TestingProductCard selectedProduct={product} />)

            expect(
                screen.getByText('Selected: White Shirt'),
            ).toBeInTheDocument()
        })
    })

    describe('product selection', () => {
        it('should call onProductChange when a product is selected', async () => {
            const user = userEvent.setup()
            const onProductChange = jest.fn()

            render(<TestingProductCard onProductChange={onProductChange} />)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /mock productselect/i }),
                )
            })

            expect(onProductChange).toHaveBeenCalledWith({
                id: '1',
                title: 'Black Shirt',
            })
        })

        it('should not throw when onProductChange is not provided and a product is selected', async () => {
            const user = userEvent.setup()

            render(<TestingProductCard />)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /mock productselect/i }),
                )
            })

            expect(screen.getByText('Testing product')).toBeInTheDocument()
        })
    })
})
