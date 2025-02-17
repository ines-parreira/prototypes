import {render} from '@testing-library/react'
import React from 'react'

import {Cadence} from 'models/billing/types'

import SummaryLineItem from '../SummaryLineItem'

describe('SummaryLineItem', () => {
    it.each([true, false])(
        'should render with strikeThrough: %v',
        (strickenOut) => {
            const {container} = render(
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
                />
            )

            expect(container).toHaveTextContent('Helpdesk')
            expect(container).toHaveTextContent('Basic - 1000 tickets / month')
            expect(container).toHaveTextContent('$250/month')

            const strickenThroughText =
                container.querySelector('.strikeThrough')

            if (strickenOut) {
                expect(strickenThroughText).toBeInTheDocument()
            } else {
                expect(strickenThroughText).toBeNull()
            }
        }
    )
})
