import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {StatsFilters} from 'models/stat/types'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {assumeMock} from 'utils/testing'
import {useVoiceCallAverageTimeTrend} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import VoiceCallCallerExperienceMetric from './VoiceCallCallerExperienceMetric'

jest.mock('pages/stats/voice/hooks/useVoiceCallAverageTimeTrend')
const mockUseVoiceCallAverageTimeTrend = assumeMock(
    useVoiceCallAverageTimeTrend
)

describe('<VoiceCallCallerExperienceMetric />', () => {
    const renderComponent = (trendValue: MetricTrend) => {
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: '2021-02-03T23:59:59.999Z',
                start_datetime: '2021-02-03T00:00:00.000Z',
            },
        }
        mockUseVoiceCallAverageTimeTrend.mockReturnValue(trendValue)
        return render(
            <VoiceCallCallerExperienceMetric
                metricTrend={trendValue}
                title={'Total duration'}
                hint={'Total duration of the call'}
                statsFilters={statsFilters}
            />
        )
    }

    it('should render', async () => {
        const trendValue = {
            data: {
                prevValue: 10,
                value: 15,
            },
            isError: false,
            isFetching: false,
        }

        const {getByText} = renderComponent(trendValue)

        expect(getByText('Total duration')).toBeInTheDocument()
        expect(getByText('+50%')).toHaveClass('negative')
        expect(getByText('15s')).toBeInTheDocument()
        expect(getByText('from 10s')).toBeInTheDocument()

        fireEvent.mouseOver(getByText('+50%'))
        await waitFor(() =>
            expect(getByText('Compared to: Jan 01, 2024')).toBeInTheDocument()
        )
    })

    it('should render no data', () => {
        const trendValue = {
            data: undefined,
            isError: false,
            isFetching: false,
        }

        const {getByText} = renderComponent(trendValue)

        expect(getByText('Total duration')).toBeInTheDocument()
        expect(getByText('-')).toBeInTheDocument()
    })

    it('should render null values', () => {
        const trendValue = {
            data: {
                prevValue: null,
                value: null,
            },
            isError: false,
            isFetching: false,
        }

        const {getByText} = renderComponent(trendValue)

        expect(getByText('Total duration')).toBeInTheDocument()
        expect(getByText('-')).toBeInTheDocument()
    })
})
