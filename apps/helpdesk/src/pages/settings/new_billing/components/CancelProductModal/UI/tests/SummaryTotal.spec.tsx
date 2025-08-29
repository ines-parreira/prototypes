import { render } from '@testing-library/react'

import { Cadence } from 'models/billing/types'

import SummaryTotal from '../SummaryTotal'

describe('SummaryTotal', () => {
    it.each(Object.values(Cadence))(
        'renders with total: (cadence=%s)',
        (cadence: Cadence) => {
            const { container } = render(
                <SummaryTotal total={100} cadence={cadence} />,
            )

            expect(container).toHaveTextContent('Total with plan updates')
            expect(container).toHaveTextContent(`$100/${cadence}`)
        },
    )
})
