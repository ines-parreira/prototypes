import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { Moment } from 'moment'

import { VoiceCallDirection, VoiceCallStatus } from '@gorgias/api-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

import { LiveVoiceMetricCard } from './LiveVoiceMetricCard'
import LiveVoiceMetrics from './LiveVoiceMetrics'
import {
    getLiveVoiceMetricCards,
    getOldLiveVoiceMetricCards,
} from './LiveVoiceMetricsConfig'
import { getLiveVoicePeriodFilter } from './utils'

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
jest.mock('utils/reporting')
jest.mock('pages/stats/voice/components/LiveVoice/LiveVoiceMetricCard')
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('pages/stats/voice/components/LiveVoice/utils')
jest.mock('pages/stats/voice/components/LiveVoice/LiveVoiceMetricsConfig')

const LiveVoiceMetricCardMock = assumeMock(LiveVoiceMetricCard)
const formatReportingQueryDateMock = assumeMock(formatReportingQueryDate)
const getBusinessHoursSettingsMock = assumeMock(getBusinessHoursSettings)
const getLiveVoicePeriodFilterMock = assumeMock(getLiveVoicePeriodFilter)
const getOldLiveVoiceMetricCardsMock = assumeMock(getOldLiveVoiceMetricCards)
const getLiveVoiceMetricCardsMock = assumeMock(getLiveVoiceMetricCards)

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

const defaultPeriodFilter = {
    start_datetime: '2024-01-01T00:00:00+01:00',
    end_datetime: '2024-01-01T23:59:59+01:00',
}

const liveVoiceCalls = [
    {
        created_datetime: '',
        direction: VoiceCallDirection.Inbound,
        external_id: '',
        id: 1,
        integration_id: 1,
        provider: '',
        status: VoiceCallStatus.InProgress,
    },
    {
        created_datetime: '',
        direction: VoiceCallDirection.Inbound,
        external_id: '',
        id: 2,
        integration_id: 1,
        provider: '',
        status: VoiceCallStatus.InProgress,
    },
]

describe('LiveVoiceMetrics', () => {
    beforeEach(() => {
        getBusinessHoursSettingsMock.mockReturnValue({
            data: { timezone: 'Europe/Paris' },
        } as any)

        formatReportingQueryDateMock.mockImplementation((date) =>
            (date as Moment).format(),
        )
        getLiveVoicePeriodFilterMock.mockReturnValue(defaultPeriodFilter)

        LiveVoiceMetricCardMock.mockReturnValue(<div />)
    })

    it.each([
        {
            liveVoiceCalls: [],
            isLoadingVoiceCalls: true,
            businessHours: {
                data: {
                    timezone: 'Europe/Paris',
                },
            },
            expectedTimezone: 'Europe/Paris',
        },
        {
            liveVoiceCalls: liveVoiceCalls,
            isLoadingVoiceCalls: false,
            businessHours: undefined,
            expectedTimezone: 'UTC',
        },
    ])(
        'should call old config function with correct timezone',
        ({
            liveVoiceCalls,
            isLoadingVoiceCalls,
            businessHours,
            expectedTimezone,
        }) => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                    return false
                }
            })

            getBusinessHoursSettingsMock.mockReturnValue(businessHours as any)
            getOldLiveVoiceMetricCardsMock.mockReturnValue([
                {
                    title: 'Metric title',
                    hint: 'Metric hint',
                    fetchData: () => ({
                        data: { value: 1 },
                        isFetching: false,
                        isError: false,
                    }),
                    size: 4,
                },
            ])

            const filters = {
                period: defaultPeriodFilter,
            }

            renderComponent({
                liveVoiceCalls: liveVoiceCalls,
                isLoadingVoiceCalls: isLoadingVoiceCalls,
            })

            expect(getOldLiveVoiceMetricCardsMock).toHaveBeenCalledWith(
                liveVoiceCalls,
                isLoadingVoiceCalls,
                filters,
                expectedTimezone,
            )

            expect(LiveVoiceMetricCardMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Metric title',
                    hint: 'Metric hint',
                    fetchData: expect.any(Function),
                    size: 4,
                }),
                {},
            )
        },
    )

    it.each([
        {
            liveVoiceCalls: [],
            isLoadingVoiceCalls: true,
            businessHours: {
                data: {
                    timezone: 'Europe/Paris',
                },
            },
            expectedTimezone: 'Europe/Paris',
        },
        {
            liveVoiceCalls: liveVoiceCalls,
            isLoadingVoiceCalls: false,
            businessHours: undefined,
            expectedTimezone: 'UTC',
        },
    ])(
        'should call config function with correct timezone',
        ({
            liveVoiceCalls,
            isLoadingVoiceCalls,
            businessHours,
            expectedTimezone,
        }) => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                    return true
                }
            })

            getBusinessHoursSettingsMock.mockReturnValue(businessHours as any)
            getLiveVoiceMetricCardsMock.mockReturnValue([
                {
                    title: 'Metric title',
                    hint: 'Metric hint',
                    fetchData: () => ({
                        data: { value: 1 },
                        isFetching: false,
                        isError: false,
                    }),
                    size: 4,
                },
            ])

            const filters = {
                period: defaultPeriodFilter,
            }

            renderComponent({
                liveVoiceCalls: liveVoiceCalls,
                isLoadingVoiceCalls: isLoadingVoiceCalls,
            })

            expect(getLiveVoiceMetricCardsMock).toHaveBeenCalledWith(
                liveVoiceCalls,
                isLoadingVoiceCalls,
                filters,
                expectedTimezone,
            )

            expect(LiveVoiceMetricCardMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Metric title',
                    hint: 'Metric hint',
                    fetchData: expect.any(Function),
                    size: 4,
                }),
                {},
            )
        },
    )
})
