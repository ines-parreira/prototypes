import { proxifyURL } from '@repo/utils'
import type * as Utils from '@repo/utils'
import { screen, waitFor } from '@testing-library/react'

import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

import { render } from '#tests/render.utils'
import { ProductAttachment } from '#ticket-messages/components/MessageBubble/components/ProductAttachment'

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

function makeAttachment(
    overrides: Partial<TicketMessageAttachment>,
): TicketMessageAttachment {
    return {
        name: 'Classic Tee',
        url: 'https://cdn.example.com/product.png',
        content_type: 'application/productCard',
        public: true,
        ...overrides,
    } as TicketMessageAttachment
}

describe('ProductAttachment', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the product attachment', async () => {
        render(
            <ProductAttachment
                attachment={makeAttachment({
                    extra: {
                        price: 31.24,
                        compare_at_price: 55.55,
                        variant_name: 'Blue / M',
                        product_link:
                            'https://shop.example.com/products/classic-tee',
                        currency: 'USD',
                    },
                })}
            />,
        )

        expect(
            screen.getByRole('link', { name: 'Classic Tee' }),
        ).toHaveAttribute(
            'href',
            'https://shop.example.com/products/classic-tee',
        )
        expect(screen.getByText('Blue / M')).toBeInTheDocument()
        expect(screen.getByText('$31.24')).toBeInTheDocument()
        expect(screen.getByText('$55.55')).toBeInTheDocument()

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'Classic Tee' }),
            ).toHaveAttribute(
                'src',
                'https://cdn.example.com/product.png?proxy=120x120',
            )
        })

        expect(mockProxifyURL).toHaveBeenCalledWith(
            'https://cdn.example.com/product.png',
            '120x120',
        )
    })
})
