import React from 'react'

import { render } from '@testing-library/react'

import { Cadence } from 'models/billing/types'

import SummaryTotal from '../SummaryTotal'

describe('SummaryTotal', () => {
    it('renders with total', () => {
        const { container } = render(
            <SummaryTotal total={100} cadence={Cadence.Month} />,
        )

        expect(container).toHaveTextContent('Total with plan updates')
        expect(container).toHaveTextContent('$100/month')
    })
})
