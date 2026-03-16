import type React from 'react'
import type { ComponentType } from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import * as apiQueries from '@gorgias/helpdesk-queries'
import { useChannel } from '@gorgias/realtime'

import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import LiveVoiceAgentsSection from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsSection'
import LiveVoiceCallTable from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallTable'
import LiveVoiceMetrics from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetrics'
import { useLiveVoiceUpdates } from 'domains/reporting/pages/voice/hooks/useLiveVoiceUpdates'
import LiveVoice from 'domains/reporting/pages/voice/pages/LiveVoice'
import { getCleanStatsFiltersWithLogicalOperatorsWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import type { AccountSettingBusinessHours } from 'state/currentAccount/types'
import { getTimezone } from 'state/currentUser/selectors'

jest.mock('domains/reporting/state/ui/stats/selectors')
jest.mock('@gorgias/helpdesk-queries')
jest.mock('@gorgias/realtime')
jest.mock('domains/reporting/pages/voice/hooks/useLiveVoiceUpdates')
jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceFilters',
    () => () => <div>LiveVoiceFilters</div>,
)
jest.mock('domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetrics')
jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsSection',
)
jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallTable',
)
jest.mock(
    'domains/reporting/pages/common/layout/StatsPage',
    () =>
        ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
)
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/currentUser/selectors')
jest.mock('state/currentAccount/selectors')
jest.mock(
    'pages/common/utils/withProductEnabledPaywall',
    () => () => (Component: ComponentType<Record<string, unknown>>) =>
        Component,
)
const getTimezoneMock = assumeMock(getTimezone)
const getBusinessHoursSettingsMock = assumeMock(getBusinessHoursSettings)

const useListLiveCallQueueVoiceCallsMock = assumeMock(
    apiQueries.useListLiveCallQueueVoiceCalls,
)
const useLiveVoiceUpdatesMock = assumeMock(useLiveVoiceUpdates)
const useChannelMock = assumeMock(useChannel)
const getCleanStatsFiltersWithLogicalOperatorsWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
)
const LiveVoiceMetricsMock = assumeMock(LiveVoiceMetrics)
const LiveVoiceCallTableMock = assumeMock(LiveVoiceCallTable)
const LiveVoiceAgentsSectionMock = assumeMock(LiveVoiceAgentsSection)

const cleanStatsFiltersDefaultValue = {
    [FilterKey.Agents]: { values: [1, 2] },
    [FilterKey.Integrations]: { values: [3, 4] },
    [FilterKey.VoiceQueues]: { values: [5, 6] },
} as StatsFiltersWithLogicalOperator

const handleEventMock = jest.fn()

describe('LiveVoice', () => {
    const renderComponent = () => render(<LiveVoice />)

    beforeEach(() => {
        useListLiveCallQueueVoiceCallsMock.mockReturnValue({
            data: [],
            isLoading: false,
        } as any)
        getCleanStatsFiltersWithLogicalOperatorsWithTimezoneMock.mockReturnValue(
            {
                cleanStatsFilters: cleanStatsFiltersDefaultValue,
            } as any,
        )
        LiveVoiceMetricsMock.mockReturnValue(<div>LiveVoiceMetrics</div>)
        LiveVoiceCallTableMock.mockReturnValue(<div>LiveVoiceCallTable</div>)
        LiveVoiceAgentsSectionMock.mockReturnValue(
            <div>LiveVoiceAgentsSection</div>,
        )
        useLiveVoiceUpdatesMock.mockReturnValue({
            channel: {
                accountId: 123,
                name: 'stats.liveVoice',
            },
            handleEvent: handleEventMock,
        })
    })

    it('should render all sections', () => {
        const { getByText } = renderComponent()
        expect(getByText('LiveVoiceFilters')).toBeInTheDocument()
        expect(getByText('LiveVoiceMetrics')).toBeInTheDocument()
        expect(getByText('LiveVoiceAgentsSection')).toBeInTheDocument()
        expect(getByText('LiveVoiceCallTable')).toBeInTheDocument()
    })

    it('should handle events', () => {
        const handleEventMock = jest.fn()
        useLiveVoiceUpdatesMock.mockReturnValue({
            channel: {
                accountId: 123,
                name: 'stats.liveVoice',
            },
            handleEvent: handleEventMock,
        })

        renderComponent()

        expect(useChannelMock).toHaveBeenCalled()

        const event = {
            dataschema: '//helpdesk/phone.voice-call.inbound.rang-agent/1.0.0',
            data: {
                voice_call_id: 1234,
                user_id: 5678,
                account_id: 123,
            },
        }

        // TODO: fix this
        // @ts-expect-error - after adding availability update/create events, this is not typed correctly
        useChannelMock.mock.calls[0][0]?.onEvent!(event)
        expect(useLiveVoiceUpdatesMock).toHaveBeenCalledWith({
            agent_ids: [1, 2],
            integration_ids: [3, 4],
            voice_queue_ids: [5, 6],
        })
        expect(handleEventMock).toHaveBeenCalledWith(event)
    })

    it('should render footer with timezone related to business hours', () => {
        const businessHoursTimezone = 'SomeBusinessHoursTimezone'
        getTimezoneMock.mockReturnValue('SomeTimezone')
        getBusinessHoursSettingsMock.mockReturnValue({
            data: { timezone: businessHoursTimezone },
        } as AccountSettingBusinessHours)

        const { getByText } = renderComponent()

        expect(
            getByText(
                'Analytics are using business hours timezone SomeBusinessHoursTimezone',
            ),
        ).toBeInTheDocument()
    })

    it('should pass correct props to children components', () => {
        useListLiveCallQueueVoiceCallsMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)
        renderComponent()
        expect(LiveVoiceMetricsMock).toHaveBeenCalledWith(
            {
                isLoadingVoiceCalls: true,
                liveVoiceCalls: [],
                cleanStatsFilters: cleanStatsFiltersDefaultValue,
            },
            {},
        )
        expect(LiveVoiceCallTableMock).toHaveBeenCalledWith(
            {
                isLoading: true,
                voiceCalls: [],
            },
            {},
        )
        expect(LiveVoiceAgentsSectionMock).toHaveBeenCalledWith(
            {
                params: {
                    agent_ids:
                        cleanStatsFiltersDefaultValue[FilterKey.Agents]?.values,
                    integration_ids:
                        cleanStatsFiltersDefaultValue[FilterKey.Integrations]
                            ?.values,
                    voice_queue_ids:
                        cleanStatsFiltersDefaultValue[FilterKey.VoiceQueues]
                            ?.values,
                },
            },
            {},
        )
    })

    it('should pass correct filters to useListLiveCallQueueVoiceCalls', () => {
        renderComponent()
        expect(useListLiveCallQueueVoiceCallsMock).toHaveBeenCalledWith(
            {
                agent_ids: [1, 2],
                integration_ids: [3, 4],
                voice_queue_ids: [5, 6],
            },
            expect.any(Object),
        )
    })

    it('should select correct data from useListLiveCallQueueVoiceCalls', () => {
        useListLiveCallQueueVoiceCallsMock.mockReturnValue({
            data: [{ id: 1, external_id: 'call1' }],
            isLoading: false,
        } as any)
        renderComponent()
        const result =
            useListLiveCallQueueVoiceCallsMock.mock.calls?.[0]?.[1]?.query?.select?.(
                {
                    data: { data: [{ id: 1, external_id: 'call1' }] },
                } as any,
            )

        expect(result).toEqual([{ id: 1, external_id: 'call1' }])
    })
})
