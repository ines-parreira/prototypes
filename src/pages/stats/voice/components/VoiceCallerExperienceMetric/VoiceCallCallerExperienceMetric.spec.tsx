import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import {mockFlags} from 'jest-launchdarkly-mock'
import {StatsFilters} from 'models/stat/types'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {assumeMock, mockStore} from 'utils/testing'
import {useVoiceCallAverageTimeTrend} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import {formatMetricValue} from 'pages/stats/common/utils'
import {FeatureFlagKey} from 'config/featureFlags'
import {VoiceMetric} from 'state/ui/stats/types'
import {VoiceMetrics} from 'state/ui/stats/drillDownSlice'
import * as DrillDownModalTrigger from 'pages/stats/DrillDownModalTrigger'
import {
    AVERAGE_TALK_TIME_METRIC_TITLE,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
} from '../../constants/voiceOverview'
import VoiceCallCallerExperienceMetric from './VoiceCallCallerExperienceMetric'

jest.mock('pages/stats/voice/hooks/useVoiceCallAverageTimeTrend')
const mockUseVoiceCallAverageTimeTrend = assumeMock(
    useVoiceCallAverageTimeTrend
)

const DrillDownModalTriggerSpy = jest.spyOn(
    DrillDownModalTrigger,
    'DrillDownModalTrigger'
)

const averageWaitTimeMetricData = {
    metricName: VoiceMetric.AverageWaitTime,
    title: AVERAGE_WAIT_TIME_METRIC_TITLE,
}

const averageTalkTimeMetricData = {
    metricName: VoiceMetric.AverageTalkTime,
    title: AVERAGE_TALK_TIME_METRIC_TITLE,
}

const defaultTrendValue = {
    data: {
        prevValue: 10,
        value: 15,
    },
    isError: false,
    isFetching: false,
}

describe('<VoiceCallCallerExperienceMetric />', () => {
    const store = mockStore({} as any)

    const renderComponent = (
        trendValue: MetricTrend,
        metricData: VoiceMetrics = averageWaitTimeMetricData
    ) => {
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: '2021-02-03T23:59:59.999Z',
                start_datetime: '2021-02-03T00:00:00.000Z',
            },
        }
        mockUseVoiceCallAverageTimeTrend.mockReturnValue(trendValue)

        return render(
            <Provider store={store}>
                <VoiceCallCallerExperienceMetric
                    metricTrend={trendValue}
                    title={'Total duration'}
                    hint={'Total duration of the call'}
                    statsFilters={statsFilters}
                    metricData={metricData}
                />
            </Provider>
        )
    }

    beforeEach(() => {
        mockFlags({[FeatureFlagKey.VoiceCallsDrillDown]: true})
        store.clearActions()
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

        const {getByText, container} = renderComponent(trendValue)

        expect(getByText('Total duration')).toBeInTheDocument()
        expect(getByText('arrow_upward')).toBeInTheDocument()
        expect(getByText('50%')).toHaveClass('negative')
        expect(getByText('15s')).toBeInTheDocument()
        fireEvent.mouseOver(getByText('50%'))
        await waitFor(() => {
            expect(container.querySelector('.tooltip')).toBeInTheDocument()
            expect(
                document.querySelector('.tooltip-inner')?.textContent
            ).toEqual(
                `Vs. ${formatMetricValue(
                    trendValue.data.prevValue
                )} on Jan 1st, 2024`
            )
        })
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

    it('should be clickable when value is a number', () => {
        const trendValue = {
            data: {
                prevValue: 10,
                value: 15,
            },
            isError: false,
            isFetching: false,
        }

        renderComponent(trendValue)

        expect(DrillDownModalTriggerSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                enabled: true,
            }),
            {}
        )
    })

    it('should not be clickable when drill down FF is disabled', () => {
        mockFlags({[FeatureFlagKey.VoiceCallsDrillDown]: false})

        renderComponent(defaultTrendValue)

        expect(DrillDownModalTriggerSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                enabled: false,
                metricData: averageWaitTimeMetricData,
            }),
            {}
        )
    })

    it.each([averageWaitTimeMetricData, averageTalkTimeMetricData])(
        'should pass correct props to DrillDownModalTrigger',
        (metric) => {
            renderComponent(defaultTrendValue, metric)

            expect(DrillDownModalTriggerSpy).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    enabled: true,
                    metricData: metric,
                }),
                {}
            )
        }
    )
})
