import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {ReportingGranularity} from 'models/reporting/types'
import useTimeSeries from 'hooks/reporting/useTimeSeries'

import TimeSeriesChart from '../TimeSeriesChart'
import LineChart from '../LineChart'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid="skeleton" />
))

const mockLineChartData = jest.fn()
jest.mock('../LineChart', () => ({data}: ComponentProps<typeof LineChart>) => {
    mockLineChartData(data)
    return null
})

describe('TimeSeriesChart', () => {
    const defaultTimeSeries = {
        data: [
            [
                {
                    dateTime: '2020-01-01T00:00:00.000',
                    value: 1,
                },
                {
                    dateTime: '2020-01-02T00:00:00.000',
                    value: 2,
                },
            ],
            [
                {
                    dateTime: '2020-01-01T00:00:00.000',
                    value: 3,
                },
                {
                    dateTime: '2020-01-02T00:00:00.000',
                    value: 4,
                },
            ],
        ],
    } as unknown as ReturnType<typeof useTimeSeries>

    const defaultProps: ComponentProps<typeof TimeSeriesChart> = {
        labels: ['first', 'second'],
        timeSeries: defaultTimeSeries,
        granularity: ReportingGranularity.Month,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render skeleton when query is loading', () => {
        const {getByTestId} = render(
            <TimeSeriesChart
                {...defaultProps}
                timeSeries={
                    {...defaultTimeSeries, data: undefined} as ReturnType<
                        typeof useTimeSeries
                    >
                }
            />
        )

        expect(getByTestId('skeleton')).toBeInTheDocument()
    })

    it('should format dates', () => {
        render(<TimeSeriesChart {...defaultProps} />)

        expect(mockLineChartData).toHaveBeenCalledWith([
            {
                label: 'first',
                values: [
                    {
                        x: 'Jan 1st, 2020',
                        y: 1,
                    },
                    {
                        x: 'Jan 2nd, 2020',
                        y: 2,
                    },
                ],
            },

            {
                label: 'second',
                values: [
                    {
                        x: 'Jan 1st, 2020',
                        y: 3,
                    },
                    {
                        x: 'Jan 2nd, 2020',
                        y: 4,
                    },
                ],
            },
        ])
    })
})
