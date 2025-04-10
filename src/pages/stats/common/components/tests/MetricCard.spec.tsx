import React from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MetricCard from 'pages/stats/common/components/MetricCard'
import { ChartsActionMenu } from 'pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu')
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)

ChartsActionMenuMock.mockReturnValue(<div>ChartsActionMenu</div>)

describe('<MetricCard />', () => {
    const title = 'Metric title'
    const childrenContent = 'MetricCard'

    it('should render the metric card title', () => {
        render(<MetricCard title={title}>{childrenContent}</MetricCard>)

        expect(screen.getByText(title)).toBeInTheDocument()
        expect(screen.getByText(childrenContent)).toBeInTheDocument()
    })

    it('should render the metric card hint', async () => {
        const hint = { title: 'metric hint' }

        render(
            <MetricCard hint={hint} title={title}>
                {childrenContent}
            </MetricCard>,
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
            </MetricCard>,
        )

        expect(screen.getByText(tooltipText)).toBeInTheDocument()
        expect(screen.queryByText('ChartsActionMenu')).not.toBeInTheDocument()
    })

    it('should render the ChartsActionMenu if chartId exists', () => {
        const tooltipText = 'some tooltip text'

        render(
            <MetricCard tip={tooltipText} title={title} chartId="123">
                {childrenContent}
            </MetricCard>,
        )

        expect(screen.getByText('ChartsActionMenu')).toBeInTheDocument()
    })
})
