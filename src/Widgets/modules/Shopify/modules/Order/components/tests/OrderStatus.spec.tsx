import React from 'react'

import { render, screen } from '@testing-library/react'

import {
    FinancialStatus,
    FulfillmentStatus,
} from 'constants/integrations/types/shopify'

import OrderStatus, { ReturnsBadge } from '../OrderStatus'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

describe('ReturnsBadge:', () => {
    it('should return null when returnsStatus is null', () => {
        const result = render(<ReturnsBadge returnsStatus={null as any} />)

        expect(result.container.firstChild).toBeNull()
    })

    it('should return null when returnsStatus is undefined', () => {
        const result = render(<ReturnsBadge returnsStatus={undefined as any} />)

        expect(result.container.firstChild).toBeNull()
    })

    it('should return null when returnsStatus is empty string', () => {
        const result = render(<ReturnsBadge returnsStatus={'' as any} />)

        expect(result.container.firstChild).toBeNull()
    })

    it('should render badge for  "Partially Returned" ', () => {
        render(<ReturnsBadge returnsStatus={'PartialReturn'} />)

        expect(screen.getByText('Partially Returned')).toBeInTheDocument()
    })

    it('should render badge for FullReturn', () => {
        render(<ReturnsBadge returnsStatus={'FullReturn'} />)

        expect(screen.getByText('Returned')).toBeInTheDocument()
    })
})

describe('OrderStatus:', () => {
    const mockUseFlag = jest.mocked(require('core/flags').useFlag)

    beforeEach(() => {
        mockUseFlag.mockClear()
    })

    it('should not display ReturnsBadge when showReturnsStatusForOrders flag is off', () => {
        mockUseFlag.mockReturnValue(false)

        render(
            <OrderStatus
                fulfillmentStatus={FulfillmentStatus.Fulfilled}
                financialStatus={FinancialStatus.Paid}
                isInfluencedByAI={false}
                isCancelled={false}
                returnsStatus={'PartialReturn'}
            />,
        )

        expect(screen.queryByText('Partially Returned')).not.toBeInTheDocument()
        expect(screen.queryByText('Returned')).not.toBeInTheDocument()
    })

    it('should display ReturnsBadge when showReturnsStatusForOrders flag is on', () => {
        mockUseFlag.mockReturnValue(true)

        render(
            <OrderStatus
                fulfillmentStatus={FulfillmentStatus.Fulfilled}
                financialStatus={FinancialStatus.Paid}
                isInfluencedByAI={false}
                isCancelled={false}
                returnsStatus={'PartialReturn'}
            />,
        )

        expect(screen.getByText('Partially Returned')).toBeInTheDocument()
    })
})
