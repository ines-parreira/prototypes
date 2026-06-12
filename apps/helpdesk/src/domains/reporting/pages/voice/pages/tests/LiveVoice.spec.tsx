import type React from 'react'
import type { ComponentType } from 'react'

import { assumeMock, render } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListLiveCallQueueVoiceCallsHandler,
    mockListLiveCallQueueVoiceCallsResponse,
    mockLiveCallQueueVoiceCall,
} from '@gorgias/helpdesk-mocks'
import { useChannel } from '@gorgias/realtime'

import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LiveVoiceAgentsSection } from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsSection'
import { LiveVoiceCallTable } from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallTable'
import { LiveVoiceMetrics } from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetrics'
import { useLiveVoiceUpdates } from 'domains/reporting/pages/voice/hooks/useLiveVoiceUpdates'
import { DefaultExportLiveVoice as LiveVoice } from 'domains/reporting/pages/voice/pages/LiveVoice'
import { getCleanStatsFiltersWithLogicalOperatorsWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import type { AccountSettingBusinessHours } from 'state/currentAccount/types'
import { getTimezone } from 'state/currentUser/selectors'

jest.mock('domains/reporting/state/ui/stats/selectors')
jest.mock('@gorgias/realtime')
jest.mock('domains/reporting/pages/voice/hooks/useLiveVoiceUpdates')
jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceFilters',
    () => ({ LiveVoiceFilters: () => <div>LiveVoiceFilters</div> }),
)
jest.mock('domains/reporting/pages/voice/components/LiveVoice/LiveVoiceMetrics')
jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsSection',
)
jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallTable',
)
jest.mock('domains/reporting/pages/common/layout/StatsPage', () => ({
    StatsPage: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))
jest.mock('hooks/useAppSelector', () => ({
    useAppSelector: (fn: () => void) => fn(),
}))

jest.mock('state/currentUser/selectors')
jest.mock('state/currentAccount/selectors')
jest.mock('pages/common/utils/withProductEnabledPaywall', () => ({
    withProductEnabledPaywall:
        () => (Component: ComponentType<Record<string, unknown>>) =>
            Component,
}))
const getTimezoneMock = assumeMock(getTimezone)
const getBusinessHoursSettingsMock = assumeMock(getBusinessHoursSettings)

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
const server = setupServer()

describe('LiveVoice', () => {
    const renderComponent = () => render(<LiveVoice />)

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(
            mockListLiveCallQueueVoiceCallsHandler(async () =>
                HttpResponse.json(
                    mockListLiveCallQueueVoiceCallsResponse({ data: [] }),
                ),
            ).handler,
        )
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

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
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

    it('should pass loading props to children components', () => {
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

    it('should pass correct filters to useListLiveCallQueueVoiceCalls', async () => {
        const mockListLiveCallQueueVoiceCalls =
            mockListLiveCallQueueVoiceCallsHandler(async () =>
                HttpResponse.json(
                    mockListLiveCallQueueVoiceCallsResponse({ data: [] }),
                ),
            )
        const waitForListLiveCallQueueVoiceCallsRequest =
            mockListLiveCallQueueVoiceCalls.waitForRequest(server)
        server.use(mockListLiveCallQueueVoiceCalls.handler)

        renderComponent()

        await waitForListLiveCallQueueVoiceCallsRequest((request) => {
            const url = new URL(request.url)

            expect(url.search).toContain('agent_ids')
            expect(url.search).toContain('1')
            expect(url.search).toContain('2')
            expect(url.search).toContain('integration_ids')
            expect(url.search).toContain('3')
            expect(url.search).toContain('4')
            expect(url.search).toContain('voice_queue_ids')
            expect(url.search).toContain('5')
            expect(url.search).toContain('6')
        })
    })

    it('should select correct data from useListLiveCallQueueVoiceCalls', async () => {
        const voiceCalls = [
            mockLiveCallQueueVoiceCall({ id: 1, external_id: 'call1' }),
        ]
        server.use(
            mockListLiveCallQueueVoiceCallsHandler(async () =>
                HttpResponse.json(
                    mockListLiveCallQueueVoiceCallsResponse({
                        data: voiceCalls,
                    }),
                ),
            ).handler,
        )

        renderComponent()

        await waitFor(() => {
            expect(LiveVoiceCallTableMock).toHaveBeenCalledWith(
                {
                    isLoading: false,
                    voiceCalls,
                },
                {},
            )
        })
    })
})
