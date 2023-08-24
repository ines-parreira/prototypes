import React from 'react'
import {render, screen} from '@testing-library/react'

import PerformanceTip from 'pages/stats/PerformanceTip'

describe('<PerformanceTip />', () => {
    let index = 0
    describe.each([
        [undefined, 'Tip'],
        ['neutral', 'Tip'],
        ['light-error', 'Room for improvement'],
        ['light-success', 'You’re doing good'],
        ['success', 'You’re doing great'],
    ])('%s', (testName: any, iconText) => {
        it(`should render the metric sentiment tip with type`, () => {
            const value = [0, 4.62][index % 2]
            index += 1
            const content = 'Consider using XYZ to improve this metric'

            render(
                <PerformanceTip
                    avgMerchant={value}
                    topTen={value}
                    type={testName}
                >
                    {content}
                </PerformanceTip>
            )

            expect(screen.getByText(iconText)).toBeInTheDocument()
            expect(screen.getAllByText(value)).toHaveLength(2)
            expect(screen.getByText(content)).toBeInTheDocument()
        })
    })

    describe.each([[`Consider Using XYZ to improve this metric`], [undefined]])(
        'For content %s',
        (content) => {
            it(`should render the default sentiment tip without type`, () => {
                const topTen = null
                const avgMerchant = null

                render(
                    <PerformanceTip avgMerchant={avgMerchant} topTen={topTen}>
                        {content}
                    </PerformanceTip>
                )

                expect(screen.queryAllByText('-')).toHaveLength(2)
                expect(
                    screen.getByText(
                        'No data available for the selected filters.'
                    )
                ).toBeInTheDocument()
            })
        }
    )
})
