import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import moment, {Moment} from 'moment'
import {assumeMock} from 'utils/testing'
import {voiceCallAverageWaitTimeQueryFactory} from 'models/reporting/queryFactories/voice/voiceCall'
import {useMetric} from 'hooks/reporting/useMetric'
import * as constants from 'pages/stats/voice/constants/liveVoice'

import {Metric} from 'hooks/reporting/metrics'
import {formatReportingQueryDate} from 'utils/reporting'
import {getBusinessHoursSettings} from 'state/currentAccount/selectors'
import {getMoment} from 'utils/date'
import {useVoiceCallCountMetric} from '../../hooks/useVoiceCallCountMetric'
import {useAverageTalkTimeMetric} from '../../hooks/agentMetrics'
import LiveVoiceMetrics from './LiveVoiceMetrics'
import LiveVoiceMetricCard from './LiveVoiceMetricCard'

const renderComponent = (
    props: Partial<ComponentProps<typeof LiveVoiceMetrics>> = {
        liveVoiceCalls: [],
        isLoadingVoiceCalls: false,
    }
) => {
    return render(
        <LiveVoiceMetrics
            liveVoiceCalls={props.liveVoiceCalls ?? []}
            isLoadingVoiceCalls={props.isLoadingVoiceCalls ?? false}
            cleanStatsFilters={
                props.cleanStatsFilters ?? {
                    period: {start_datetime: 'start', end_datetime: 'end'},
                }
            }
        />
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

const voiceCallAverageWaitTimeQueryFactoryMock = assumeMock(
    voiceCallAverageWaitTimeQueryFactory
)
const useVoiceCallCountMetricMock = assumeMock(useVoiceCallCountMetric)
const useAverageTalkTimeMetricMock = assumeMock(useAverageTalkTimeMetric)
const useMetricMock = assumeMock(useMetric)
const LiveVoiceMetricCardMock = assumeMock(LiveVoiceMetricCard)
const formatReportingQueryDateMock = assumeMock(formatReportingQueryDate)
const getBusinessHoursSettingsMock = assumeMock(getBusinessHoursSettings)
const getMomentMock = assumeMock(getMoment)

describe('LiveVoiceMetrics', () => {
    beforeEach(() => {
        getBusinessHoursSettingsMock.mockReturnValue({
            data: {timezone: 'Europe/Paris'},
        } as any)
        useMetricMock.mockReturnValue({
            data: {value: 1},
            isFetching: false,
        } as Metric)
        useVoiceCallCountMetricMock.mockReturnValue({
            data: {value: 1},
            isFetching: false,
        } as Metric)
        useAverageTalkTimeMetricMock.mockReturnValue({
            data: {value: 1},
            isFetching: false,
        } as Metric)

        formatReportingQueryDateMock.mockImplementation((date) =>
            (date as Moment).format()
        )
        getMomentMock.mockReturnValue(moment('2024-01-01T14:11:00.000Z'))

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
    ])('should render %p LiveVoiceMetricCard', ({title, hint}) => {
        renderComponent()

        expect(LiveVoiceMetricCardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title,
                hint,
            }),
            {}
        )
    })

    it.each([
        {
            businessHours: {
                data: {
                    timezone: 'Europe/Paris',
                },
            },
            expectedPeriodFilters: {
                start_datetime: '2024-01-01T00:00:00+01:00',
                end_datetime: '2024-01-01T23:59:59+01:00',
            },
            expectedTimezone: 'Europe/Paris',
        },
        {
            businessHours: undefined,
            expectedPeriodFilters: {
                start_datetime: '2024-01-01T00:00:00Z',
                end_datetime: '2024-01-01T23:59:59Z',
            },
            expectedTimezone: 'UTC',
        },
    ])(
        'should call hooks with correct timezone',
        ({businessHours, expectedPeriodFilters, expectedTimezone}) => {
            getBusinessHoursSettingsMock.mockReturnValue(businessHours as any)

            const filters = {
                period: expectedPeriodFilters,
            }

            renderComponent()

            expect(useMetricMock).toHaveBeenCalledWith(
                voiceCallAverageWaitTimeQueryFactoryMock(
                    filters,
                    expectedTimezone
                )
            )
            expect(useVoiceCallCountMetricMock).toHaveBeenCalledWith(
                filters,
                expectedTimezone,
                'VoiceCall.inboundCalls'
            )
            expect(useVoiceCallCountMetricMock).toHaveBeenCalledWith(
                filters,
                expectedTimezone,
                'VoiceCall.outboundCalls'
            )
            expect(useVoiceCallCountMetricMock).toHaveBeenCalledWith(
                filters,
                expectedTimezone,
                'VoiceCall.missedCalls'
            )
            expect(useAverageTalkTimeMetricMock).toHaveBeenCalledWith(
                filters,
                expectedTimezone
            )
        }
    )
})
