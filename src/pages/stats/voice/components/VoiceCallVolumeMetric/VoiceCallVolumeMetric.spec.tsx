import React from 'react'

import { fireEvent, render, waitFor } from '@testing-library/react'

import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { StatsFilters } from 'models/stat/types'
import { formatMetricValue, MetricValueFormat } from 'pages/stats/common/utils'
import { useVoiceCallCountTrend } from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import { assumeMock } from 'utils/testing'

import { useMetricFormat } from '../../hooks/useMetricFormat'
import VoiceCallVolumeMetric from './VoiceCallVolumeMetric'

jest.mock('pages/stats/voice/hooks/useVoiceCallCountTrend')
const mockUseVoiceCallCountTrend = assumeMock(useVoiceCallCountTrend)
jest.mock('pages/stats/voice/hooks/useMetricFormat')
const useMetricFormatMock = assumeMock(useMetricFormat)

const mockMetricFormat = {
    metricValue: '100',
    isFetching: false,
    selectedFormat: 'integer' as MetricValueFormat,
    setSelectedFormat: jest.fn(),
}

describe('<VoiceCallVolumeMetric />', () => {
    const period = {
        end_datetime: '2021-02-03T23:59:59.999Z',
        start_datetime: '2021-02-03T00:00:00.000Z',
    }
    const renderComponent = (trendValue: MetricTrend, moreIsBetter = true) => {
        const statsFilters: StatsFilters = {
            period,
        }
        mockUseVoiceCallCountTrend.mockReturnValue(trendValue)
        return render(
            <VoiceCallVolumeMetric
                title={'Total calls'}
                hint={'Total number of inbound and outbound calls'}
                statsFilters={statsFilters}
                metricTrend={trendValue}
                moreIsBetter={moreIsBetter}
            />,
        )
    }

    beforeEach(() => {
        useMetricFormatMock.mockImplementation((props) => ({
            ...mockMetricFormat,
            metricValue: props.value?.toString() || '0',
        }))
    })

    it('should render', async () => {
        const trendValue = {
            data: {
                prevValue: 10,
                value: 15,
            },
            isError: false,
            isFetching: false,
        }

        const { getByText, container } = renderComponent(trendValue)

        expect(getByText('Total calls')).toBeInTheDocument()
        expect(getByText('50%')).toHaveClass('positive')
        expect(getByText('15')).toBeInTheDocument()

        fireEvent.mouseOver(getByText('50%'))
        await waitFor(() => {
            expect(container.querySelector('.tooltip')).toBeInTheDocument()
            expect(
                document.querySelector('.tooltip-inner')?.textContent,
            ).toEqual(
                `Vs. ${formatMetricValue(
                    trendValue.data.prevValue,
                )} on Feb 2nd, 2021`,
            )
        })
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

        const { getByText } = renderComponent(trendValue, false)

        expect(getByText('Total calls')).toBeInTheDocument()
        expect(getByText('50%')).toHaveClass('negative')
        expect(getByText('15')).toBeInTheDocument()
    })
})
