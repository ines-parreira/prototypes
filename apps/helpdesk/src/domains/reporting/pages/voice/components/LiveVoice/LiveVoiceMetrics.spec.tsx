import { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Moment } from 'moment'

import { VoiceCallDirection, VoiceCallStatus } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { LiveVoiceMetricCard } from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetricCard'
import LiveVoiceMetrics from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetrics'
import useLiveVoiceMetricCards from 'domains/reporting/pages/voice/components/LiveVoice/useLiveVoiceMetricCards'
import { getLiveVoicePeriodFilter } from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

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

jest.mock('domains/reporting/state/ui/stats/selectors')
jest.mock('utils/date')
jest.mock('state/currentAccount/selectors')
jest.mock('domains/reporting/utils/reporting')
jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetricCard',
)
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils')
jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/useLiveVoiceMetricCards',
)

const LiveVoiceMetricCardMock = assumeMock(LiveVoiceMetricCard)
const formatReportingQueryDateMock = assumeMock(formatReportingQueryDate)
const getBusinessHoursSettingsMock = assumeMock(getBusinessHoursSettings)
const getLiveVoicePeriodFilterMock = assumeMock(getLiveVoicePeriodFilter)
const useLiveVoiceMetricCardsMock = assumeMock(useLiveVoiceMetricCards)

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
        },
        {
            liveVoiceCalls: liveVoiceCalls,
            isLoadingVoiceCalls: false,
            businessHours: undefined,
        },
    ])(
        'should call config function with correct filters',
        ({ liveVoiceCalls, isLoadingVoiceCalls, businessHours }) => {
            getBusinessHoursSettingsMock.mockReturnValue(businessHours as any)
            useLiveVoiceMetricCardsMock.mockReturnValue([
                {
                    title: 'Metric title',
                    hint: 'Metric hint',
                    metric: {
                        data: 1,
                        isLoading: false,
                    },
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

            expect(useLiveVoiceMetricCardsMock).toHaveBeenCalledWith(
                liveVoiceCalls,
                isLoadingVoiceCalls,
                filters,
            )

            expect(LiveVoiceMetricCardMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Metric title',
                    hint: 'Metric hint',
                    metric: expect.any(Object),
                    size: 4,
                }),
                {},
            )
        },
    )

    it('should display last updated info', () => {
        mockFlags({ [FeatureFlagKey.UseLiveVoiceUpdates]: true })

        useLiveVoiceMetricCardsMock.mockReturnValue([
            {
                title: 'Metric 1',
                hint: 'Metric hint',
                metric: {
                    data: 1,
                },
                size: 4,
            },
            {
                title: 'Metric 2',
                hint: 'Metric hint',
                metric: {
                    data: 1,
                    isLoading: false,
                    dataUpdatedAt: 1750765755000,
                },
                size: 4,
            },
        ])

        const { getByText } = renderComponent({
            liveVoiceCalls: liveVoiceCalls,
            isLoadingVoiceCalls: false,
        })

        expect(
            getByText(
                'KPI cards last updated: 11:49 (auto-refresh every 30 seconds)',
            ),
        ).toBeInTheDocument()
    })
})
