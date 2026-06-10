import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import type { GroupedLineItem } from '../../orders/sections/groupOrderLineItems'
import { LineItemRow } from './LineItemRow'

vi.mock('@gorgias/toolkit-react', async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    useCopyToClipboard: () => [
        {},
        (text: string) => navigator.clipboard.writeText(text),
    ],
}))

const makeItem = (
    overrides: Partial<GroupedLineItem['lineItem']> = {},
    quantity = 2,
): GroupedLineItem => ({
    lineItem: {
        id: 1,
        title: 'Fixie Bike',
        price: '199.99',
        quantity,
        sku: 'fixie-bike',
        variant_title: 'Gold / S',
        product_id: 101,
        variant_id: 201,
        ...overrides,
    },
    quantity,
})

describe('LineItemRow', () => {
    describe('image', () => {
        it('renders the product image with title as alt text', () => {
            render(<LineItemRow item={makeItem()} moneySymbol="$" />)

            expect(
                screen.getByRole('img', { name: 'Fixie Bike' }),
            ).toBeInTheDocument()
        })
    })

    describe('title and variant', () => {
        it('renders the title without decoration when there is no variant', () => {
            render(
                <LineItemRow
                    item={makeItem({ variant_title: null })}
                    moneySymbol="$"
                />,
            )

            expect(screen.getByText('Fixie Bike')).toBeInTheDocument()
        })

        it('renders the variant inline when present', () => {
            render(<LineItemRow item={makeItem()} moneySymbol="$" />)

            const variant = screen.getByText('Gold / S')
            expect(variant.parentElement).toHaveTextContent(
                'Fixie Bike - Gold / S',
            )
        })

        it('does not render variant when null', () => {
            render(
                <LineItemRow
                    item={makeItem({ variant_title: null })}
                    moneySymbol="$"
                />,
            )

            expect(screen.queryByText('Gold / S')).not.toBeInTheDocument()
        })

        it('does not render variant when empty string', () => {
            render(
                <LineItemRow
                    item={makeItem({ variant_title: '' })}
                    moneySymbol="$"
                />,
            )

            expect(screen.queryByText(/- /)).not.toBeInTheDocument()
        })

        it('does not render variant when "Default Title"', () => {
            render(
                <LineItemRow
                    item={makeItem({ variant_title: 'Default Title' })}
                    moneySymbol="$"
                />,
            )

            expect(screen.queryByText('Default Title')).not.toBeInTheDocument()
        })
    })

    describe('SKU', () => {
        it('renders SKU with prefix when present', () => {
            render(<LineItemRow item={makeItem()} moneySymbol="$" />)

            expect(screen.getByText('SKU: fixie-bike')).toBeInTheDocument()
        })

        it('does not render SKU when absent', () => {
            render(
                <LineItemRow
                    item={makeItem({ sku: undefined })}
                    moneySymbol="$"
                />,
            )

            expect(screen.queryByText(/SKU:/)).not.toBeInTheDocument()
        })
    })

    describe('quantity and price', () => {
        it('renders quantity in Nx format', () => {
            render(<LineItemRow item={makeItem()} moneySymbol="$" />)

            expect(screen.getByText('2x')).toBeInTheDocument()
        })

        it('renders price with money symbol', () => {
            render(<LineItemRow item={makeItem()} moneySymbol="$" />)

            expect(screen.getByText('$199.99')).toBeInTheDocument()
        })

        it('renders price with different money symbol', () => {
            render(<LineItemRow item={makeItem()} moneySymbol="€" />)

            expect(screen.getByText('€199.99')).toBeInTheDocument()
        })
    })

    describe('copy buttons', () => {
        it('renders copy button for product title', () => {
            render(<LineItemRow item={makeItem()} moneySymbol="$" />)

            expect(
                screen.getByRole('button', { name: /copy product title/i }),
            ).toBeInTheDocument()
        })

        it('copies title with variant when copy button is clicked', async () => {
            const writeTextSpy = vi
                .spyOn(navigator.clipboard, 'writeText')
                .mockResolvedValue(undefined)

            const { user } = render(
                <LineItemRow item={makeItem()} moneySymbol="$" />,
            )

            await user.click(
                screen.getByRole('button', { name: /copy product title/i }),
            )

            expect(writeTextSpy).toHaveBeenCalledWith('Fixie Bike - Gold / S')
        })

        it('copies just the title when no variant', async () => {
            const writeTextSpy = vi
                .spyOn(navigator.clipboard, 'writeText')
                .mockResolvedValue(undefined)

            const { user } = render(
                <LineItemRow
                    item={makeItem({ variant_title: null })}
                    moneySymbol="$"
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /copy product title/i }),
            )

            expect(writeTextSpy).toHaveBeenCalledWith('Fixie Bike')
        })

        it('renders copy button for SKU when present', () => {
            render(<LineItemRow item={makeItem()} moneySymbol="$" />)

            expect(
                screen.getByRole('button', { name: /copy sku/i }),
            ).toBeInTheDocument()
        })

        it('does not render copy button for SKU when absent', () => {
            render(
                <LineItemRow
                    item={makeItem({ sku: undefined })}
                    moneySymbol="$"
                />,
            )

            expect(
                screen.queryByRole('button', { name: /copy sku/i }),
            ).not.toBeInTheDocument()
        })

        it('copies the raw SKU without prefix on click', async () => {
            const writeTextSpy = vi
                .spyOn(navigator.clipboard, 'writeText')
                .mockResolvedValue(undefined)

            const { user } = render(
                <LineItemRow item={makeItem()} moneySymbol="$" />,
            )

            await user.click(screen.getByRole('button', { name: /copy sku/i }))

            expect(writeTextSpy).toHaveBeenCalledWith('fixie-bike')
        })
    })
})
