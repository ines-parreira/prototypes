import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Product } from 'constants/integrations/types/shopify'

import { ProductSelect } from './ProductSelect'

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

jest.mock(
    'AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList',
    () => ({
        useAIJourneyProductList: jest.fn(),
    }),
)

const mockUseAIJourneyProductList =
    require('AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList')
        .useAIJourneyProductList as jest.Mock

const makeProduct = (id: string, title: string, imageSrc: string): Product =>
    ({
        id,
        title,
        status: 'active',
        published_at: '2021-07-13T12:07:20+02:00',
        image: {
            id: 1,
            src: imageSrc,
            alt: `${title} image`,
            product_id: Number(id),
        },
    }) as unknown as Product

const productList = [
    makeProduct('1', 'Black Shirt', 'https://cdn.shopify.com/black-shirt.jpg'),
    makeProduct('2', 'Blue Jeans', 'https://cdn.shopify.com/blue-jeans.jpg'),
    makeProduct('3', 'Red Cap', 'https://cdn.shopify.com/red-cap.jpg'),
]

describe('<ProductSelect />', () => {
    const mockSetSelectedProduct = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 1, name: 'test-shop' },
        })

        mockUseAIJourneyProductList.mockReturnValue({
            productList,
            isLoading: false,
        })
    })

    describe('loading state', () => {
        it('should render a skeleton while products are loading', () => {
            mockUseAIJourneyProductList.mockReturnValue({
                productList: [],
                isLoading: true,
            })

            render(
                <ProductSelect setSelectedProduct={mockSetSelectedProduct} />,
            )

            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
        })
    })

    describe('rendering', () => {
        it('should render the select trigger button', () => {
            render(
                <ProductSelect setSelectedProduct={mockSetSelectedProduct} />,
            )

            expect(screen.getByRole('button')).toBeInTheDocument()
        })

        it('should display the first product title when no selectedProduct is provided', () => {
            render(
                <ProductSelect setSelectedProduct={mockSetSelectedProduct} />,
            )

            expect(
                within(screen.getByRole('button')).getByText('Black Shirt'),
            ).toBeInTheDocument()
        })

        it('should display the selectedProduct title when provided', () => {
            render(
                <ProductSelect
                    selectedProduct={productList[1]}
                    setSelectedProduct={mockSetSelectedProduct}
                />,
            )

            expect(
                within(screen.getByRole('button')).getByText('Blue Jeans'),
            ).toBeInTheDocument()
        })

        it('should render selected product image from selectedProduct prop', () => {
            render(
                <ProductSelect
                    selectedProduct={productList[1]}
                    setSelectedProduct={mockSetSelectedProduct}
                />,
            )

            const selectedImg = within(screen.getByRole('button')).getByAltText(
                'Blue Jeans image',
            )
            expect(selectedImg).toHaveAttribute(
                'src',
                'https://cdn.shopify.com/blue-jeans.jpg',
            )
        })

        it('should list all products in the dropdown options', async () => {
            const user = userEvent.setup()

            render(
                <ProductSelect setSelectedProduct={mockSetSelectedProduct} />,
            )

            await act(async () => {
                await user.click(screen.getByRole('button'))
            })

            const listbox = screen.getByRole('listbox')
            expect(within(listbox).getByText('Black Shirt')).toBeInTheDocument()
            expect(within(listbox).getByText('Blue Jeans')).toBeInTheDocument()
            expect(within(listbox).getByText('Red Cap')).toBeInTheDocument()
        })

        it('should render product images with correct alt text for each option', async () => {
            const user = userEvent.setup()

            render(
                <ProductSelect setSelectedProduct={mockSetSelectedProduct} />,
            )

            await act(async () => {
                await user.click(screen.getByRole('button'))
            })

            const listbox = screen.getByRole('listbox')
            expect(
                within(listbox).getByAltText('Black Shirt image'),
            ).toBeInTheDocument()
            expect(
                within(listbox).getByAltText('Blue Jeans image'),
            ).toBeInTheDocument()
            expect(
                within(listbox).getByAltText('Red Cap image'),
            ).toBeInTheDocument()
        })

        it('should render fallback alt text when product image has no alt', async () => {
            const user = userEvent.setup()
            const productWithNullAlt = makeProduct(
                '4',
                'White Tee',
                'https://cdn.shopify.com/white-tee.jpg',
            )
            ;(productWithNullAlt.image as any).alt = null

            mockUseAIJourneyProductList.mockReturnValue({
                productList: [productWithNullAlt],
                isLoading: false,
            })

            render(
                <ProductSelect setSelectedProduct={mockSetSelectedProduct} />,
            )

            await act(async () => {
                await user.click(screen.getByRole('button'))
            })

            const listbox = screen.getByRole('listbox')
            expect(
                within(listbox).getByAltText('Product image'),
            ).toBeInTheDocument()
        })
    })

    describe('user interactions', () => {
        it('should call setSelectedProduct when an item is selected', async () => {
            const user = userEvent.setup()

            render(
                <ProductSelect setSelectedProduct={mockSetSelectedProduct} />,
            )

            await act(async () => {
                await user.click(screen.getByRole('button'))
            })

            await act(async () => {
                await user.click(
                    within(screen.getByRole('listbox')).getByText('Blue Jeans'),
                )
            })

            expect(mockSetSelectedProduct).toHaveBeenCalledWith(productList[1])
        })
    })

    describe('integration with context', () => {
        it('should use integrationId from currentIntegration when fetching products', () => {
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: { id: 42, name: 'my-shop' },
            })

            render(
                <ProductSelect setSelectedProduct={mockSetSelectedProduct} />,
            )

            expect(mockUseAIJourneyProductList).toHaveBeenCalledWith({
                integrationId: 42,
            })
        })

        it('should pass undefined integrationId when currentIntegration is undefined', () => {
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: undefined,
            })

            render(
                <ProductSelect setSelectedProduct={mockSetSelectedProduct} />,
            )

            expect(mockUseAIJourneyProductList).toHaveBeenCalledWith({
                integrationId: undefined,
            })
        })
    })
})
