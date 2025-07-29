import { render, screen } from '@testing-library/react'

import { FinancialStatus } from 'constants/integrations/types/shopify'

import OrderStatusBadge from '../OrderStatusBadge'

describe('OrderStatusBadge', () => {
    it('renders "paid" status with light-warning badge', () => {
        render(<OrderStatusBadge status={FinancialStatus.Paid} />)
        const badge = screen.getByText('paid')
        expect(badge).toBeInTheDocument()
    })

    it('renders "pending" status with light-warning badge', () => {
        render(<OrderStatusBadge status={FinancialStatus.Pending} />)
        const badge = screen.getByText('pending')
        expect(badge).toBeInTheDocument()
    })

    it('renders "partially_paid" status with light-warning badge', () => {
        render(<OrderStatusBadge status={FinancialStatus.PartiallyPaid} />)
        const badge = screen.getByText('partially_paid')
        expect(badge).toBeInTheDocument()
    })

    it('renders unknown status with light-error badge', () => {
        // @ts-expect-error: testing unknown status
        render(<OrderStatusBadge status="refunded" />)
        const badge = screen.getByText('unknown status')
        expect(badge).toBeInTheDocument()
    })
})
