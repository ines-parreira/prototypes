import { proxifyURL } from '@repo/utils'
import { screen, waitFor } from '@testing-library/react'

import type * as Utils from '@repo/utils'

import { render } from '../../../../tests/render.utils'
import { MoreLikeThisCaption, ProductReference } from '../SimilarProductsSearch'

vi.mock('@repo/utils', async (importOriginal) => {
    const actual = await importOriginal<typeof Utils>()

    return {
        ...actual,
        proxifyURL: vi.fn((url: string, size?: string) =>
            size ? `${url}?proxy=${size}` : `${url}?proxy=cw-1`,
        ),
    }
})

const mockProxifyURL = vi.mocked(proxifyURL)

describe('ProductReference', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the product image with proxified URL', async () => {
        render(
            <ProductReference
                imageUrl="https://cdn.example.com/blush.png"
                title="Blush is Life"
                url="https://shop.example.com/products/blush"
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'Blush is Life' }),
            ).toHaveAttribute(
                'src',
                'https://cdn.example.com/blush.png?proxy=32x32',
            )
        })

        expect(mockProxifyURL).toHaveBeenCalledWith(
            'https://cdn.example.com/blush.png',
            '32x32',
        )
    })

    it('renders the product title', () => {
        render(
            <ProductReference
                imageUrl="https://cdn.example.com/blush.png"
                title="Blush is Life"
                url="https://shop.example.com/products/blush"
            />,
        )

        expect(screen.getByText('Blush is Life')).toBeInTheDocument()
    })

    it('links to the product URL', () => {
        render(
            <ProductReference
                imageUrl="https://cdn.example.com/blush.png"
                title="Blush is Life"
                url="https://shop.example.com/products/blush"
            />,
        )

        expect(
            screen.getByRole('link', { name: 'Blush is Life' }),
        ).toHaveAttribute('href', 'https://shop.example.com/products/blush')
    })

    it('renders the icon fallback when imageUrl is null', () => {
        render(
            <ProductReference
                imageUrl={null}
                title="Blush is Life"
                url="https://shop.example.com/products/blush"
            />,
        )

        expect(
            screen.queryByRole('img', { name: 'Blush is Life' }),
        ).not.toBeInTheDocument()
        expect(mockProxifyURL).not.toHaveBeenCalled()
    })
})

describe('MoreLikeThisCaption', () => {
    it('renders the "More like this" tag', () => {
        render(<MoreLikeThisCaption />)

        expect(screen.getByText('More like this')).toBeInTheDocument()
    })
})
