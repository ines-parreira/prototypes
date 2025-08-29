import { render } from '@testing-library/react'

import { Cadence } from 'models/billing/types'

import SummaryLineItem from '../SummaryLineItem'

describe('SummaryLineItem', () => {
    it.each([true, false])(
        'should render with strikeThrough: %v',
        (strickenOut) => {
            const { container } = render(
                <SummaryLineItem
                    summaryItem={{
                        title: 'Helpdesk',
                        label: 'Basic - ',
                        cadence: Cadence.Month,
                        quotaAmount: 1000,
                        counter: 'tickets',
                        amount: '$250',
                        strickenOut: strickenOut,
                    }}
                />,
            )

            expect(container).toHaveTextContent('Helpdesk')

            const strickenThroughText =
                container.querySelector('.strikeThrough')

            if (strickenOut) {
                expect(strickenThroughText).toBeInTheDocument()
            } else {
                expect(strickenThroughText).toBeNull()
            }
        },
    )
    it.each(Object.values(Cadence))(
        'should render with the correct cadence: %s',
        (cadence) => {
            const { container } = render(
                <SummaryLineItem
                    summaryItem={{
                        title: 'Helpdesk',
                        label: 'Basic - ',
                        cadence: cadence,
                        quotaAmount: 1000,
                        counter: 'tickets',
                        amount: '$250',
                        strickenOut: false,
                    }}
                />,
            )

            expect(container).toHaveTextContent('Helpdesk')
            expect(container).toHaveTextContent(
                `Basic - 1000 tickets / ${cadence}`,
            )
            expect(container).toHaveTextContent(`$250/${cadence}`)
        },
    )
})
