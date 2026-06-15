import { proxifyURL } from '@repo/utils'
import { screen, waitFor } from '@testing-library/react'

import type * as Utils from '@repo/utils'

import { render } from '../../../../../tests/render.utils'
import { ReviewedProductCard } from '../ReviewedProductCard'

vi.mock('@repo/utils', async (importOriginal) => {
    const actual = await importOriginal<typeof Utils>()

    return {
        ...actual,
        proxifyURL: vi.fn((url: string, size?: string) =>
            size ? `${url}?proxy=${size}` : `${url}?proxy=cw-1`,
        ),
    }
})

vi.mock('react-rating-stars-component', () => ({
    default: ({ value }: { value: number }) => <div>{`Rating: ${value}`}</div>,
}))

const mockProxifyURL = vi.mocked(proxifyURL)

describe('ReviewedProductCard', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the reviewed product details', async () => {
        render(
            <ReviewedProductCard
                product={{
                    product: {
                        average_score: 4.3,
                        category: { name: 'Electronics' },
                        description: 'Economic washing machine',
                        images: [
                            {
                                original:
                                    'https://cdn.example.com/product-original.png',
                                square: 'https://cdn.example.com/product-square.png',
                            },
                        ],
                        name: 'Tandem washing machine',
                        total_reviews: 100,
                        url: 'https://www.yotpo.com/product/GGGGG',
                    },
                }}
            />,
        )

        expect(screen.getByText('Reviewed product')).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /Tandem washing machine/i }),
        ).toHaveAttribute('href', 'https://www.yotpo.com/product/GGGGG')
        expect(screen.getByText('Rating: 4.3')).toBeInTheDocument()
        expect(screen.getByText('(100)')).toBeInTheDocument()
        expect(screen.getByText('Economic washing machine')).toBeInTheDocument()
        expect(screen.getByText('Electronics')).toBeInTheDocument()

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'Tandem washing machine' }),
            ).toHaveAttribute(
                'src',
                'https://cdn.example.com/product-square.png?proxy=120x120',
            )
        })

        expect(mockProxifyURL).toHaveBeenCalledWith(
            'https://cdn.example.com/product-square.png',
            '120x120',
        )
    })

    it('renders nothing when product data is missing', () => {
        const { container } = render(<ReviewedProductCard product={null} />)

        expect(container).toBeEmptyDOMElement()
    })
})
