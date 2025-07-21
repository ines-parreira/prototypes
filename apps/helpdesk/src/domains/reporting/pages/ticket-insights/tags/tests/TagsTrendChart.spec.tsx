import React from 'react'

import { render, screen } from '@testing-library/react'

import { useTagsTimeSeries } from 'domains/reporting/hooks/ticket-insights/useTagsTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { TagsTrendChart } from 'domains/reporting/pages/ticket-insights/tags/TagsTrendChart'
import { assumeMock } from 'utils/testing'

jest.mock(
    '@gorgias/merchant-ui-kit',
    () =>
        ({
            ...jest.requireActual('@gorgias/merchant-ui-kit'),
            Skeleton: () => <div data-testid="skeleton" />,
        }) as typeof import('@gorgias/merchant-ui-kit'),
)

jest.mock('domains/reporting/hooks/ticket-insights/useTagsTimeSeries')
const useTagsTrendMock = assumeMock(useTagsTimeSeries)

describe('<TagsTrendChart>', () => {
    const data = [
        [
            { dateTime: '2023-02-27T00:00:00.000', value: 6 },
            { dateTime: '2023-03-06T00:00:00.000', value: 21 },
        ],
        [
            { dateTime: '2023-03-24T00:00:00.000', value: 10 },
            { dateTime: '2023-04-05T00:00:00.000', value: 5 },
        ],
    ]

    const useTagsTrendReturnValue: ReturnType<typeof useTagsTimeSeries> = {
        data: data,
        granularity: ReportingGranularity.Month,
        isFetching: false,
        legendDatasetVisibility: { 0: true },
        legendInfo: {
            labels: ['tagName1', 'tagName2'],
            tooltips: ['tagName1', 'tagName2'],
        },
    }

    useTagsTrendMock.mockReturnValue(useTagsTrendReturnValue)

    it('should render the chart', () => {
        render(<TagsTrendChart />)

        expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('should render legend items', () => {
        render(<TagsTrendChart />)

        expect(screen.queryAllByRole('checkbox')).toHaveLength(data.length)
    })

    it('should render skeleton on loading', () => {
        useTagsTrendMock.mockReturnValue({
            ...useTagsTrendReturnValue,
            isFetching: true,
        })

        render(<TagsTrendChart />)

        expect(screen.getAllByTestId('skeleton')).toHaveLength(1)
    })

    it('should render with legend visibility', () => {
        useTagsTrendMock.mockReturnValue({
            ...useTagsTrendReturnValue,
            legendDatasetVisibility: { 0: false },
        })

        render(<TagsTrendChart />)

        expect(screen.queryAllByRole('checkbox')[0]).not.toBeChecked()
    })
})
