import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { OrdersListSkeleton } from '../OrdersListSkeleton'

describe('OrdersListSkeleton', () => {
    it('renders skeleton placeholders for the orders header and order cards', () => {
        render(<OrdersListSkeleton />)

        expect(
            screen.getAllByLabelText('Loading').length,
        ).toBeGreaterThanOrEqual(3 + 3 * 9)
    })
})
