import React, { ComponentType } from 'react'

import { render } from '@testing-library/react'

import * as apiQueries from '@gorgias/helpdesk-queries'

import { FilterKey, StatsFiltersWithLogicalOperator } from 'models/stat/types'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'
import { AccountSettingBusinessHours } from 'state/currentAccount/types'
import { getTimezone } from 'state/currentUser/selectors'
import { getCleanStatsFiltersWithLogicalOperatorsWithTimezone } from 'state/ui/stats/selectors'
import { assumeMock } from 'utils/testing'

import LiveVoiceAgentsSection from '../../components/LiveVoice/LiveVoiceAgentsSection'
import LiveVoiceCallTable from '../../components/LiveVoice/LiveVoiceCallTable'
import LiveVoiceMetrics from '../../components/LiveVoice/LiveVoiceMetrics'
import LiveVoice from '../LiveVoice'

jest.mock('state/ui/stats/selectors')
jest.mock('@gorgias/helpdesk-queries')
jest.mock(
    'pages/stats/voice/components/LiveVoice/LiveVoiceFilters',
    () => () => <div>LiveVoiceFilters</div>,
)
jest.mock('pages/stats/voice/components/LiveVoice/LiveVoiceMetrics')
jest.mock('pages/stats/voice/components/LiveVoice/LiveVoiceAgentsSection')
jest.mock('pages/stats/voice/components/LiveVoice/LiveVoiceCallTable')
jest.mock(
    'pages/stats/common/layout/StatsPage',
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
    })

    it('should render all sections', () => {
        const { getByText } = renderComponent()
        expect(getByText('LiveVoiceFilters')).toBeInTheDocument()
        expect(getByText('LiveVoiceMetrics')).toBeInTheDocument()
        expect(getByText('LiveVoiceAgentsSection')).toBeInTheDocument()
        expect(getByText('LiveVoiceCallTable')).toBeInTheDocument()
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
                cleanStatsFilters: cleanStatsFiltersDefaultValue,
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
            data: { data: ['voiceCalls'] },
            isLoading: false,
        } as any)
        renderComponent()
        const result =
            useListLiveCallQueueVoiceCallsMock.mock.calls?.[0]?.[1]?.query?.select?.(
                {
                    data: { data: ['voiceCalls'] },
                } as any,
            )

        expect(result).toEqual(['voiceCalls'])
    })
})
