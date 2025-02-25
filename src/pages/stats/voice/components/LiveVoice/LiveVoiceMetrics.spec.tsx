import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { Moment } from 'moment'

import { Metric } from 'hooks/reporting/metrics'
import { useMetric } from 'hooks/reporting/useMetric'
import { voiceCallAverageWaitTimeQueryFactory } from 'models/reporting/queryFactories/voice/voiceCall'
import * as constants from 'pages/stats/voice/constants/liveVoice'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

import { useAverageTalkTimeMetric } from '../../hooks/agentMetrics'
import { useVoiceCallCountMetric } from '../../hooks/useVoiceCallCountMetric'
import LiveVoiceMetricCard from './LiveVoiceMetricCard'
import LiveVoiceMetrics from './LiveVoiceMetrics'
import { LiveVoiceStatusFilterOption } from './types'
import { filterLiveCallsByStatus, getLiveVoicePeriodFilter } from './utils'

const renderComponent = (
    props: Partial<ComponentProps<typeof LiveVoiceMetrics>> = {
        liveVoiceCalls: [],
        isLoadingVoiceCalls: false,
    },
) => {
    return render(
        <LiveVoiceMetrics
            liveVoiceCalls={props.liveVoiceCalls ?? []}
            isLoadingVoiceCalls={props.isLoadingVoiceCalls ?? false}
            cleanStatsFilters={
                props.cleanStatsFilters ?? {
                    period: { start_datetime: 'start', end_datetime: 'end' },
                }
            }
        />,
    )
}

jest.mock('state/ui/stats/selectors')
jest.mock('utils/date')
jest.mock('state/currentAccount/selectors')
jest.mock('hooks/reporting/useMetric')
jest.mock('utils/reporting')
jest.mock('pages/stats/voice/hooks/useVoiceCallCountMetric')
jest.mock('pages/stats/voice/hooks/agentMetrics')
jest.mock('pages/stats/voice/components/LiveVoice/LiveVoiceMetricCard')
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('pages/stats/voice/components/LiveVoice/utils')

const voiceCallAverageWaitTimeQueryFactoryMock = assumeMock(
    voiceCallAverageWaitTimeQueryFactory,
)
const useVoiceCallCountMetricMock = assumeMock(useVoiceCallCountMetric)
const useAverageTalkTimeMetricMock = assumeMock(useAverageTalkTimeMetric)
const useMetricMock = assumeMock(useMetric)
const LiveVoiceMetricCardMock = assumeMock(LiveVoiceMetricCard)
const formatReportingQueryDateMock = assumeMock(formatReportingQueryDate)
const getBusinessHoursSettingsMock = assumeMock(getBusinessHoursSettings)
const filterLiveCallsByStatusMock = assumeMock(filterLiveCallsByStatus)
const getLiveVoicePeriodFilterMock = assumeMock(getLiveVoicePeriodFilter)

const defaultPeriodFilter = {
    start_datetime: '2024-01-01T00:00:00+01:00',
    end_datetime: '2024-01-01T23:59:59+01:00',
}

describe('LiveVoiceMetrics', () => {
    beforeEach(() => {
        getBusinessHoursSettingsMock.mockReturnValue({
            data: { timezone: 'Europe/Paris' },
        } as any)
        useMetricMock.mockReturnValue({
            data: { value: 1 },
            isFetching: false,
        } as Metric)
        useVoiceCallCountMetricMock.mockReturnValue({
            data: { value: 1 },
            isFetching: false,
        } as Metric)
        useAverageTalkTimeMetricMock.mockReturnValue({
            data: { value: 1 },
            isFetching: false,
        } as Metric)

        formatReportingQueryDateMock.mockImplementation((date) =>
            (date as Moment).format(),
        )
        filterLiveCallsByStatusMock.mockReturnValue([] as any)
        getLiveVoicePeriodFilterMock.mockReturnValue(defaultPeriodFilter)

        LiveVoiceMetricCardMock.mockReturnValue(<div />)
    })

    it.each([
        {
            title: constants.AVERAGE_WAIT_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_WAIT_TIME_METRIC_HINT,
        },
        {
            title: constants.CALLS_IN_QUEUE_METRIC_TITLE,
            hint: constants.CALLS_IN_QUEUE_METRIC_HINT,
        },
        {
            title: constants.INBOUND_CALLS_METRIC_TITLE,
            hint: constants.INBOUND_CALLS_METRIC_HINT,
        },
        {
            title: constants.OUTBOUND_CALLS_METRIC_TITLE,
            hint: constants.OUTBOUND_CALLS_METRIC_HINT,
        },
        {
            title: constants.MISSED_INBOUND_CALLS_METRIC_TITLE,
            hint: constants.MISSED_INBOUND_CALLS_METRIC_HINT,
        },
        {
            title: constants.AVERAGE_TALK_TIME_METRIC_TITLE,
            hint: constants.AVERAGE_TALK_TIME_METRIC_HINT,
        },
    ])('should render %p LiveVoiceMetricCard', ({ title, hint }) => {
        renderComponent()

        expect(LiveVoiceMetricCardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title,
                hint,
            }),
            {},
        )
    })

    it.each([
        {
            businessHours: {
                data: {
                    timezone: 'Europe/Paris',
                },
            },
            expectedTimezone: 'Europe/Paris',
        },
        {
            businessHours: undefined,
            expectedTimezone: 'UTC',
        },
    ])(
        'should call hooks with correct timezone',
        ({ businessHours, expectedTimezone }) => {
            getBusinessHoursSettingsMock.mockReturnValue(businessHours as any)

            const filters = {
                period: defaultPeriodFilter,
            }

            renderComponent()

            expect(useMetricMock).toHaveBeenCalledWith(
                voiceCallAverageWaitTimeQueryFactoryMock(
                    filters,
                    expectedTimezone,
                ),
            )
            expect(useVoiceCallCountMetricMock).toHaveBeenCalledWith(
                filters,
                expectedTimezone,
                'VoiceCall.inboundCalls',
            )
            expect(useVoiceCallCountMetricMock).toHaveBeenCalledWith(
                filters,
                expectedTimezone,
                'VoiceCall.outboundCalls',
            )
            expect(useVoiceCallCountMetricMock).toHaveBeenCalledWith(
                filters,
                expectedTimezone,
                'VoiceCall.missedCalls',
            )
            expect(useAverageTalkTimeMetricMock).toHaveBeenCalledWith(
                filters,
                expectedTimezone,
            )
        },
    )

    it('should render correct calls in queue count', () => {
        filterLiveCallsByStatusMock.mockReturnValue([{}, {}] as any)
        renderComponent({
            liveVoiceCalls: [{} as any],
        })

        expect(LiveVoiceMetricCardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: constants.CALLS_IN_QUEUE_METRIC_TITLE,
                value: 2,
            }),
            {},
        )
        expect(filterLiveCallsByStatusMock).toHaveBeenCalledWith(
            [{}],
            LiveVoiceStatusFilterOption.IN_QUEUE,
        )
    })
})
