import React from 'react'

import { render, screen } from '@testing-library/react'

import ChartCard from 'pages/stats/common/components/ChartCard'
import { ChartsActionMenu } from 'pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu')
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)

describe('<ChartCard />', () => {
    beforeEach(() => {
        ChartsActionMenuMock.mockReturnValue(<div>ChartsActionMenu</div>)
    })

    it('should render the chart card', () => {
        const title = 'Metric title'

        render(
            <ChartCard hint={{ title: 'metric hint' }} title={title}>
                Metric
            </ChartCard>,
        )

        expect(screen.getByText(title)).toBeInTheDocument()
        expect(screen.queryByText('ChartsActionMenu')).not.toBeInTheDocument()
    })

    it('should render the ChartsActionMenu with chartId', () => {
        const title = 'Metric title'
        const chartId = 'chartId'

        render(
            <ChartCard
                hint={{ title: 'metric hint' }}
                title={title}
                chartId={chartId}
            >
                Metric
            </ChartCard>,
        )

        expect(screen.getByText(title)).toBeInTheDocument()
        expect(screen.getByText('ChartsActionMenu')).toBeInTheDocument()
    })
})
