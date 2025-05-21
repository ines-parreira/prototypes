import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
    ProductTable,
    ProductTableBodyCell,
    ProductTableHeadCell,
} from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductTable'

describe('ProductTable', () => {
    it('handles horizontal scroll correctly', async () => {
        render(
            <ProductTable>
                <thead>
                    <tr>
                        <ProductTableHeadCell title="One" isSticky />
                        <ProductTableHeadCell title="Two" />
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <ProductTableBodyCell isSticky>
                            One Content
                        </ProductTableBodyCell>
                        <ProductTableBodyCell>Two Content</ProductTableBodyCell>
                    </tr>
                </tbody>
            </ProductTable>,
        )

        act(() => {
            const tableRow = document.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, { target: { scrollLeft: 50 } })
        })

        await waitFor(() => {
            expect(screen.getByText('One Content').closest('td')).toHaveClass(
                'withShadow',
            )

            expect(screen.getByText('One').closest('th')).toHaveClass(
                'withShadow',
            )

            expect(
                screen.getByText('Two Content').closest('td'),
            ).not.toHaveClass('withShadow')

            expect(screen.getByText('Two').closest('th')).not.toHaveClass(
                'withShadow',
            )
        })
    })
})
