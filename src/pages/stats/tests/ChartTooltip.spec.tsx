import React from 'react'
import {render, screen, waitFor, fireEvent} from '@testing-library/react'

import {ChartTooltip} from '../ChartTooltip'

describe('<ChartTooltip />', () => {
    const title = 'Tooltip'
    const testId = 'testTarget'

    it('should render the chart tooltip', async () => {
        render(
            <>
                <span id={testId} data-testid={testId} />
                <ChartTooltip
                    target={testId}
                    title={title}
                    tooltipStyle={{left: 10, top: 10, opacity: 1}}
                />
            </>
        )
        fireEvent.mouseOver(screen.getByTestId(testId))

        await waitFor(() => {
            expect(screen.getByText(title)).toBeInTheDocument()
        })
    })

    it('should render the chart tooltip children', async () => {
        const content = 'Content'
        render(
            <>
                <span id={testId} data-testid={testId} />
                <ChartTooltip
                    target={testId}
                    tooltipStyle={{left: 10, top: 10, opacity: 1}}
                >
                    {content}
                </ChartTooltip>
            </>
        )
        fireEvent.mouseOver(screen.getByTestId(testId))

        await waitFor(() => {
            expect(screen.getByText(content)).toBeInTheDocument()
        })
    })
})
