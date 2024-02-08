import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import moment from 'moment/moment'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import {act, fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {UseQueryResult} from '@tanstack/react-query'
import {FeatureFlagKey} from 'config/featureFlags'
import {assumeMock} from 'utils/testing'
import {formatReportingQueryDate} from 'utils/reporting'
import {StatsFilters} from 'models/stat/types'
import {VoiceCallStatus} from 'models/voiceCall/types'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {RootState, StoreDispatch} from 'state/types'
import {useVoiceCallList} from 'pages/stats/voice/hooks/useVoiceCallList'
import {useVoiceCallCount} from 'pages/stats/voice/hooks/useVoiceCallCount'
import {
    VoiceCallFilterOptions,
    VoiceCallSummary,
} from 'pages/stats/voice/models/types'
import {CALL_LIST_PAGE_SIZE} from 'pages/stats/voice/constants/voiceOverview'
import {VoiceCallTable} from './VoiceCallTable'

jest.mock('pages/stats/voice/hooks/useVoiceCallList')
const useVoiceCallListMock = assumeMock(useVoiceCallList)

jest.mock('pages/stats/voice/hooks/useVoiceCallCount')
const useVoiceCallCountMock = assumeMock(useVoiceCallCount)

jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () =>
        ({customerId}: {customerId: number}) =>
            <div>VoiceCallCustomerLabel {customerId}</div>
)
jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () =>
        ({agentId}: {agentId: number}) =>
            <div>VoiceCallAgentLabel {agentId}</div>
)
jest.mock(
    'pages/common/components/VoiceIntegrationBasicLabel/VoiceIntegrationBasicLabel',
    () => {
        return ({integrationId}: {integrationId: number}) => (
            <div>VoiceIntegrationBasicLabel {integrationId}</div>
        )
    }
)
jest.mock('utils', () => {
    return {
        ...jest.requireActual('utils'),
        hasRole: () => true,
    } as Record<string, unknown>
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('VoiceCallTable', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    beforeEach(() => {
        resetLDMocks()
        mockFlags({
            [FeatureFlagKey.DisplayVoiceAnalyticsNiceToHave]: true,
            [FeatureFlagKey.DisplayVoiceAnalyticsV1]: true,
        })
    })

    const renderComponent = (filterOption = VoiceCallFilterOptions.All) => {
        return render(
            <Provider store={mockStore({})}>
                <VoiceCallTable
                    statsFilters={statsFilters}
                    userTimezone={'UTC'}
                    filterOption={filterOption}
                />
            </Provider>
        )
    }

    it('should render no voice calls message', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [] as VoiceCallSummary[],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({total: 0, totalPages: 0})

        const {getByText} = renderComponent()
        expect(getByText('No voice calls')).toBeInTheDocument()
    })

    it('should render pagination', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [{}],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({total: 100, totalPages: 10})

        const {getByLabelText} = renderComponent()

        expect(
            getByLabelText('Page 1 is your current page')
        ).toBeInTheDocument()
        expect(getByLabelText('Page 2')).toBeInTheDocument()
        expect(getByLabelText('Page 10')).toBeInTheDocument()

        fireEvent.click(getByLabelText('Page 2'))
        expect(
            getByLabelText('Page 2 is your current page')
        ).toBeInTheDocument()
    })

    it('should render table headers', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [{}],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({total: 100, totalPages: 10})

        const {getByText} = renderComponent()

        expect(getByText('Activity')).toBeInTheDocument()
        expect(getByText('Integration')).toBeInTheDocument()
        expect(getByText('Date')).toBeInTheDocument()
        expect(getByText('State')).toBeInTheDocument()
        expect(getByText('Recording')).toBeInTheDocument()
        expect(getByText('Length')).toBeInTheDocument()
        expect(getByText('Wait time')).toBeInTheDocument()
        expect(getByText('Ticket')).toBeInTheDocument()
    })

    it('should render table tooltips', async () => {
        useVoiceCallListMock.mockReturnValue({
            data: [{}],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({total: 100, totalPages: 10})

        const {getAllByText, getByText} = renderComponent()
        const helpIcons = getAllByText('info_outline')

        // State tooltip
        fireEvent.mouseOver(helpIcons[0])
        await waitFor(() =>
            expect(getByText('Learn about the call states')).toBeInTheDocument()
        )

        // Recording tooltip
        fireEvent.mouseOver(helpIcons[1])
        await waitFor(() =>
            expect(
                getByText('Call recording or voicemail left by customer.')
            ).toBeInTheDocument()
        )

        // Length tooltip
        fireEvent.mouseOver(helpIcons[2])
        await waitFor(() =>
            expect(
                getByText(
                    'Total duration from the moment the agent accepts the call.'
                )
            ).toBeInTheDocument()
        )

        // Wait time tooltip
        fireEvent.mouseOver(helpIcons[3])
        await waitFor(() =>
            expect(
                getByText(
                    'Time a customer spent waiting to be connected to an agent or sent to voicemail.'
                )
            ).toBeInTheDocument()
        )
    })

    it('should render loading state rows', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [{}],
            isFetching: true,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({total: 100, totalPages: 10})

        const {getAllByRole} = renderComponent()

        expect(getAllByRole('row')).toHaveLength(CALL_LIST_PAGE_SIZE + 1)
    })

    it('should render rows', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [
                {
                    agentId: 1,
                    customerId: 1,
                    direction: 'inbound',
                    integrationId: 1,
                    createdAt: '2022-12-21T15:21:47.87.000',
                    status: VoiceCallStatus.Completed,
                    duration: 100,
                    ticketId: 1,
                    phoneNumberDestination: '+1234567890',
                    phoneNumberSource: '+112',
                    talkTime: 100,
                    waitTime: 12,
                    voicemailAvailable: null,
                    voicemailUrl: null,
                    callRecordingAvailable: true,
                    callRecordingUrl: 'callRecordingUrl',
                },
                {
                    agentId: 2,
                    customerId: 2,
                    direction: 'outbound',
                    integrationId: 2,
                    createdAt: '2022-12-25T10:21:00.00.000',
                    status: VoiceCallStatus.Missed,
                    duration: 101,
                    ticketId: null,
                    phoneNumberDestination: '+1234567890',
                    phoneNumberSource: '+112',
                    talkTime: 101,
                    waitTime: 13,
                    voicemailAvailable: true,
                    voicemailUrl: 'voicemailUrl',
                    callRecordingAvailable: null,
                    callRecordingUrl: null,
                },
            ],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({total: 2, totalPages: 1})

        const {getByText} = renderComponent()

        // first call
        expect(getByText('VoiceCallCustomerLabel 1')).toBeInTheDocument()
        expect(getByText('VoiceCallAgentLabel 1')).toBeInTheDocument()
        expect(getByText('VoiceIntegrationBasicLabel 1')).toBeInTheDocument()
        expect(getByText('Answered')).toBeInTheDocument()
        expect(getByText('1m 40s')).toBeInTheDocument()
        expect(getByText('12s')).toBeInTheDocument()
        expect(getByText('View ticket')).toBeInTheDocument()

        // second call
        expect(getByText('VoiceCallCustomerLabel 2')).toBeInTheDocument()
        expect(getByText('VoiceCallAgentLabel 2')).toBeInTheDocument()
        expect(getByText('VoiceIntegrationBasicLabel 2')).toBeInTheDocument()
        expect(getByText('Missed')).toBeInTheDocument()
        expect(getByText('1m 41s')).toBeInTheDocument()
        expect(getByText('13s')).toBeInTheDocument()
        expect(getByText('-')).toBeInTheDocument()
    })

    it('should handle table scrolling', async () => {
        useVoiceCallListMock.mockReturnValue({
            data: [{}],
            isFetching: true,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({total: 1, totalPages: 1})
        const {container, getByRole} = renderComponent()

        act(() => {
            const tableRow = container.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, {target: {scrollLeft: 50}})
        })

        await waitFor(() => {
            expect(
                getByRole('cell', {
                    name: new RegExp('Activity'),
                })
            ).toHaveClass('withShadow')
        })
    })

    it.each([
        [undefined, undefined],
        [VoiceCallFilterOptions.All, undefined],
        [VoiceCallFilterOptions.Inbound, VoiceCallSegment.inboundCalls],
        [VoiceCallFilterOptions.Outbound, VoiceCallSegment.outboundCalls],
    ])('should handle filter option', (filterOption, expectedSegment) => {
        useVoiceCallListMock.mockReturnValue({
            data: [] as VoiceCallSummary[],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({total: 0, totalPages: 0})

        renderComponent(filterOption)
        expect(useVoiceCallListMock.mock.calls[0]).toEqual(
            expect.arrayContaining([expectedSegment])
        )
    })
})
