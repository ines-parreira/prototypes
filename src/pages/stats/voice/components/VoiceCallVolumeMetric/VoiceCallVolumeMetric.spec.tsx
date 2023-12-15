import React from 'react'
import {render} from '@testing-library/react'
import {StatsFilters} from 'models/stat/types'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {assumeMock} from 'utils/testing'
import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import VoiceCallVolumeMetric from './VoiceCallVolumeMetric'

jest.mock('pages/stats/voice/hooks/useVoiceCallCountTrend')
const mockUseVoiceCallCountTrend = assumeMock(useVoiceCallCountTrend)

describe('<VoiceCallVolumeMetric />', () => {
    const renderComponent = (trendValue: MetricTrend, moreIsBetter = true) => {
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: '2021-02-03T23:59:59.999Z',
                start_datetime: '2021-02-03T00:00:00.000Z',
            },
        }
        mockUseVoiceCallCountTrend.mockReturnValue(trendValue)
        return render(
            <VoiceCallVolumeMetric
                title={'Total calls'}
                hint={'Total number of inbound and outbound calls'}
                statsFilters={statsFilters}
                userTimezone={'UTC'}
                moreIsBetter={moreIsBetter}
            />
        )
    }

    it('should render', () => {
        const trendValue = {
            data: {
                prevValue: 10,
                value: 15,
            },
            isError: false,
            isFetching: false,
        }

        const {getByText} = renderComponent(trendValue)

        expect(getByText('Total calls')).toBeInTheDocument()
        expect(getByText('+50%')).toHaveClass('positive')
        expect(getByText('15')).toBeInTheDocument()
        expect(getByText('from 10')).toBeInTheDocument()
    })

    it('should render less is better', () => {
        const trendValue = {
            data: {
                prevValue: 10,
                value: 15,
            },
            isError: false,
            isFetching: false,
        }

        const {getByText} = renderComponent(trendValue, false)

        expect(getByText('Total calls')).toBeInTheDocument()
        expect(getByText('+50%')).toHaveClass('negative')
        expect(getByText('15')).toBeInTheDocument()
        expect(getByText('from 10')).toBeInTheDocument()
    })

    it('should render no data', () => {
        const trendValue = {
            data: undefined,
            isError: false,
            isFetching: false,
        }

        const {getByText} = renderComponent(trendValue, false)

        expect(getByText('Total calls')).toBeInTheDocument()
        expect(getByText('-')).toBeInTheDocument()
    })
})
