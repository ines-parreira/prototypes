import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import moment from 'moment/moment'
import {act, fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {UseQueryResult} from '@tanstack/react-query'
import {assumeMock} from 'utils/testing'
import {formatReportingQueryDate} from 'utils/reporting'
import {StatsFilters} from 'models/stat/types'
import {VoiceCallStatus} from 'models/voiceCall/types'
import {RootState, StoreDispatch} from 'state/types'
import {useVoiceCallList} from 'pages/stats/voice/hooks/useVoiceCallList'
import {useVoiceCallCount} from 'pages/stats/voice/hooks/useVoiceCallCount'
import {VoiceCallSummary} from 'pages/stats/voice/models/types'
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

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('VoiceCallTable', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    const renderComponent = () => {
        return render(
            <Provider store={mockStore({})}>
                <VoiceCallTable
                    statsFilters={statsFilters}
                    userTimezone={'UTC'}
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
        expect(getByText('Duration')).toBeInTheDocument()
        expect(getByText('Ticket')).toBeInTheDocument()
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
        expect(getByText('completed')).toBeInTheDocument()
        expect(getByText('1m 40s')).toBeInTheDocument()
        expect(getByText('View ticket')).toBeInTheDocument()

        // second call
        expect(getByText('VoiceCallCustomerLabel 2')).toBeInTheDocument()
        expect(getByText('VoiceCallAgentLabel 2')).toBeInTheDocument()
        expect(getByText('VoiceIntegrationBasicLabel 2')).toBeInTheDocument()
        expect(getByText('missed')).toBeInTheDocument()
        expect(getByText('1m 41s')).toBeInTheDocument()
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
})
