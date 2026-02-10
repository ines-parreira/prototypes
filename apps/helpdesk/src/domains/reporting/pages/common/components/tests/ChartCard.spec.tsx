import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)
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

    it('should add data-candu-id attribute when canduId prop is provided', () => {
        const title = 'Metric title'
        const canduId = 'metric-card'

        const { container } = render(
            <ChartCard
                hint={{ title: 'metric hint' }}
                title={title}
                canduId={canduId}
            >
                Metric
            </ChartCard>,
        )

        expect(
            container.querySelector(`[data-candu-id="${canduId}-title"]`),
        ).toBeInTheDocument()
    })

    it('should render headerSlot when provided', () => {
        const title = 'Metric title'
        const headerContent = <button>Toggle View</button>

        render(
            <ChartCard title={title} headerSlot={headerContent}>
                Metric
            </ChartCard>,
        )

        expect(
            screen.getByRole('button', { name: 'Toggle View' }),
        ).toBeInTheDocument()
    })
})
