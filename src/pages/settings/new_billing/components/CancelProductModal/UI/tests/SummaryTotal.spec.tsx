import {render} from '@testing-library/react'
import React from 'react'

import SummaryTotal from '../SummaryTotal'

describe('SummaryTotal', () => {
    it('renders with total', () => {
        const {container} = render(
            <SummaryTotal total={100} interval={'month'} />
        )

        expect(container).toHaveTextContent('Total with plan updates')
        expect(container).toHaveTextContent('$100/month')
    })
})
