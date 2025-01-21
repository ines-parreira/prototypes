import {render, screen} from '@testing-library/react'
import React from 'react'

import ChartCard from 'pages/stats/ChartCard'
import {ChartsActionMenu} from 'pages/stats/custom-reports/ChartsActionMenu/ChartsActionMenu'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/custom-reports/ChartsActionMenu/ChartsActionMenu')
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)

describe('<ChartCard />', () => {
    beforeEach(() => {
        ChartsActionMenuMock.mockReturnValue(<div>ChartsActionMenu</div>)
    })

    it('should render the chart card', () => {
        const title = 'Metric title'

        render(
            <ChartCard hint={{title: 'metric hint'}} title={title}>
                Metric
            </ChartCard>
        )

        expect(screen.getByText(title)).toBeInTheDocument()
        expect(screen.queryByText('ChartsActionMenu')).not.toBeInTheDocument()
    })

    it('should render the ChartsActionMenu with chartId', () => {
        const title = 'Metric title'
        const chartId = 'chartId'

        render(
            <ChartCard
                hint={{title: 'metric hint'}}
                title={title}
                chartId={chartId}
            >
                Metric
            </ChartCard>
        )

        expect(screen.getByText(title)).toBeInTheDocument()
        expect(screen.getByText('ChartsActionMenu')).toBeInTheDocument()
    })
})
