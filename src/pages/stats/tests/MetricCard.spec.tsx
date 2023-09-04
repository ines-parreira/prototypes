import userEvent from '@testing-library/user-event'
import React from 'react'
import {act, render, screen} from '@testing-library/react'

import MetricCard from '../MetricCard'

describe('<MetricCard />', () => {
    const title = 'Metric title'
    const childrenContent = 'MetricCard'

    it('should render the metric card title', () => {
        render(<MetricCard title={title}>{childrenContent}</MetricCard>)

        expect(screen.getByText(title)).toBeInTheDocument()
        expect(screen.getByText(childrenContent)).toBeInTheDocument()
    })

    it('should render the metric card hint', async () => {
        const hint = {title: 'metric hint'}

        render(
            <MetricCard hint={hint} title={title}>
                {childrenContent}
            </MetricCard>
        )
        const icon = document.querySelector('[class*=icon]')
        act(() => {
            icon && userEvent.hover(icon)
        })

        expect(await screen.findByRole('tooltip')).toHaveTextContent(hint.title)
    })

    it('should render the tooltip', () => {
        const tooltipText = 'some tooltip text'

        render(
            <MetricCard tip={tooltipText} title={title}>
                {childrenContent}
            </MetricCard>
        )

        expect(screen.getByText(tooltipText)).toBeInTheDocument()
    })
})
