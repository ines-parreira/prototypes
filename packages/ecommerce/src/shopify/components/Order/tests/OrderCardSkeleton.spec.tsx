import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { OrderCardSkeleton } from '../OrderCardSkeleton'

describe('OrderCardSkeleton', () => {
    it('renders skeleton placeholders for the order card regions', () => {
        render(<OrderCardSkeleton />)

        expect(
            screen.getAllByLabelText('Loading').length,
        ).toBeGreaterThanOrEqual(7)
    })
})
