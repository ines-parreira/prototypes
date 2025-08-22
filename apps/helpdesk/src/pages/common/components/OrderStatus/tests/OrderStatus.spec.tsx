import React from 'react'

import { render, screen } from '@testing-library/react'

import {
    FinancialStatus,
    FulfillmentStatus,
} from 'constants/integrations/types/shopify'

import OrderStatus, { ReturnsBadge } from '../OrderStatus'

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
    it('should display ReturnsBadge when returnsStatus is provided', () => {
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
