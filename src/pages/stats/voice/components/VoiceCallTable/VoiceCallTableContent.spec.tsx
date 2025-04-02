import React, { ComponentProps } from 'react'

import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { VoiceCallDirection } from '@gorgias/api-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { VoiceCallDisplayStatus, VoiceCallStatus } from 'models/voiceCall/types'
import { CALL_LIST_PAGE_SIZE } from 'pages/stats/voice/constants/voiceOverview'
import { useVoiceCallCount } from 'pages/stats/voice/hooks/useVoiceCallCount'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'

import { VoiceCallSummary } from '../../models/types'
import VoiceQueueProvider from '../VoiceQueue/VoiceQueueProvider'
import { VoiceCallTableColumnName } from './constants'
import VoiceCallTableContent from './VoiceCallTableContent'

jest.mock('pages/stats/voice/hooks/useVoiceCallList')

jest.mock('pages/stats/voice/hooks/useVoiceCallCount')
const useVoiceCallCountMock = assumeMock(useVoiceCallCount)

jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () =>
        ({ customerId }: { customerId: number }) => (
            <div>VoiceCallCustomerLabel {customerId}</div>
        ),
)
jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () =>
        ({ agentId }: { agentId: number }) => (
            <div>VoiceCallAgentLabel {agentId}</div>
        ),
)
jest.mock(
    'pages/common/components/VoiceIntegrationBasicLabel/VoiceIntegrationBasicLabel',
    () => {
        return ({ integrationId }: { integrationId: number }) => (
            <div>VoiceIntegrationBasicLabel {integrationId}</div>
        )
    },
)
jest.mock('utils', () => {
    return {
        ...jest.requireActual('utils'),
        hasRole: () => true,
    } as Record<string, unknown>
})

jest.mock('pages/stats/voice/hooks/useVoiceQueueContext', () => ({
    useVoiceQueueContext: () => {
        return {
            getQueueFromId: jest.fn(),
        }
    },
}))

jest.mock('pages/stats/voice/components/VoiceQueue/VoiceQueueProvider')
const VoiceQueueProviderMock = assumeMock(VoiceQueueProvider)
VoiceQueueProviderMock.mockImplementation(({ children }) => <>{children}</>)

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const data = [
    {
        agentId: 1,
        customerId: 1,
        direction: VoiceCallDirection.Inbound,
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
        displayStatus: VoiceCallDisplayStatus.Answered,
        queueId: 1,
    },
    {
        agentId: 2,
        customerId: 2,
        direction: VoiceCallDirection.Outbound,
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
        displayStatus: VoiceCallDisplayStatus.Unanswered,
        queueId: 2,
    },
    {
        agentId: 3,
        customerId: 3,
        direction: VoiceCallDirection.Inbound,
        integrationId: null,
        createdAt: '2022-12-26T10:21:00.00.000',
        status: VoiceCallStatus.Missed,
        duration: null,
        ticketId: null,
        phoneNumberDestination: '+1234567890',
        phoneNumberSource: '+112',
        talkTime: null,
        waitTime: null,
        voicemailAvailable: null,
        voicemailUrl: null,
        callRecordingAvailable: true,
        callRecordingUrl: 'callRecordingUrl',
        displayStatus: VoiceCallDisplayStatus.Abandoned,
        queueId: null,
    },
]

const columns = [
    VoiceCallTableColumnName.Activity,
    VoiceCallTableColumnName.Integration,
    VoiceCallTableColumnName.Queue,
    VoiceCallTableColumnName.Date,
    VoiceCallTableColumnName.State,
    VoiceCallTableColumnName.Recording,
    VoiceCallTableColumnName.Duration,
    VoiceCallTableColumnName.WaitTime,
    VoiceCallTableColumnName.Ticket,
]

describe('VoiceCallTableContent', () => {
    const renderComponent = (
        props: ComponentProps<typeof VoiceCallTableContent> = {
            data,
            isFetching: false,
            columns: columns,
        },
    ) => {
        return render(
            <Provider store={mockStore({})}>
                <VoiceCallTableContent {...props} />
            </Provider>,
        )
    }

    it.each([[], undefined])(
        'should render no voice calls message',
        (emptyData) => {
            const { getByText } = renderComponent({
                data: emptyData,
                isFetching: false,
                columns: columns,
            })
            expect(getByText('No voice calls')).toBeInTheDocument()
        },
    )

    it('should render custom no voice calls message when it is provided', () => {
        const { getByText } = renderComponent({
            data: [],
            isFetching: false,
            noDataTitle: 'Custom no data title',
            noDataDescription: 'Custom no data description',
            columns: columns,
        })
        expect(getByText('Custom no data title')).toBeInTheDocument()
        expect(getByText('Custom no data description')).toBeInTheDocument()
    })

    it('should render table headers', () => {
        useVoiceCallCountMock.mockReturnValue({
            total: 100,
            totalPages: 10,
        })

        const { getByText } = renderComponent()

        expect(getByText('Activity')).toBeInTheDocument()
        expect(getByText('Integration')).toBeInTheDocument()
        expect(getByText('Date')).toBeInTheDocument()
        expect(getByText('State')).toBeInTheDocument()
        expect(getByText('Recording')).toBeInTheDocument()
        expect(getByText('Duration')).toBeInTheDocument()
        expect(getByText('Wait time')).toBeInTheDocument()
        expect(getByText('Ticket')).toBeInTheDocument()
    })

    it('should render table tooltips', async () => {
        const { getAllByText, getByText } = renderComponent()
        const helpIcons = getAllByText('info_outline')

        // State tooltip
        fireEvent.mouseOver(helpIcons[0])
        await waitFor(() =>
            expect(
                getByText('Learn about the call states'),
            ).toBeInTheDocument(),
        )

        // Recording tooltip
        fireEvent.mouseOver(helpIcons[1])
        await waitFor(() =>
            expect(
                getByText('Call recording or voicemail left by customer.'),
            ).toBeInTheDocument(),
        )

        // Wait time tooltip
        fireEvent.mouseOver(helpIcons[2])
        await waitFor(() =>
            expect(
                getByText(
                    'Time a customer spent waiting to be connected to an agent or sent to voicemail.',
                ),
            ).toBeInTheDocument(),
        )
    })

    it('should render loading state rows', () => {
        const { getAllByRole } = renderComponent({
            data: [],
            isFetching: true,
            columns: columns,
        })

        expect(getAllByRole('row')).toHaveLength(CALL_LIST_PAGE_SIZE + 1)
    })

    it('should render rows old', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                return false
            }
        })

        const { getByText, getAllByText } = renderComponent()

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
        expect(getAllByText('Missed').length).toBeGreaterThan(0)
        expect(getByText('1m 41s')).toBeInTheDocument()
        expect(getByText('13s')).toBeInTheDocument()
        expect(getAllByText('-').length).toBeGreaterThan(0)
    })

    it('should render rows', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                return true
            }
        })

        const { getByText, getAllByText } = renderComponent()

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
        expect(getAllByText('Unanswered').length).toBeGreaterThan(0)
        expect(getByText('1m 41s')).toBeInTheDocument()
        expect(getByText('13s')).toBeInTheDocument()
        expect(getAllByText('-').length).toBeGreaterThan(0)

        // third call
        expect(getByText('VoiceCallCustomerLabel 3')).toBeInTheDocument()
        expect(getByText('VoiceCallAgentLabel 3')).toBeInTheDocument()
        expect(getAllByText('Abandoned').length).toBeGreaterThan(0)
    })

    it('should handle table scrolling', async () => {
        const { container, getByRole } = renderComponent()

        act(() => {
            const tableRow = container.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, { target: { scrollLeft: 50 } })
        })

        await waitFor(() => {
            expect(
                getByRole('columnheader', {
                    name: new RegExp('Activity'),
                }),
            ).toHaveClass('withShadow')
        })

        act(() => {
            const tableRow = container.getElementsByClassName('container')[0]
            fireEvent.scroll(tableRow, { target: { scrollLeft: 0 } })
        })

        await waitFor(() => {
            expect(
                getByRole('columnheader', {
                    name: new RegExp('Activity'),
                }),
            ).not.toHaveClass('withShadow')
        })
    })

    it('should call onColumnClick when clicking on a header cell', () => {
        const onColumnClick = jest.fn()
        const { getByText } = renderComponent({
            data,
            isFetching: false,
            columns: [VoiceCallTableColumnName.Activity],
            onColumnClick,
        })

        fireEvent.click(getByText('Activity'))

        expect(onColumnClick).toHaveBeenCalledWith('Activity')
    })

    describe('retrieve queue data', () => {
        beforeEach(() => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.ExposeVoiceQueues) {
                    return true
                }
            })
        })

        it('should get queue ids from data and pass it to the voice queue provider', () => {
            renderComponent({
                data: [
                    { queueId: 1 },
                    { queueId: 2 },
                    { queueId: 1 },
                    { queueId: null },
                ] as VoiceCallSummary[],
                isFetching: false,
                columns: columns,
            })

            expect(VoiceQueueProviderMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    queueIds: [1, 2],
                }),
                {},
            )
        })

        it('should return empty queue ids if none are found', () => {
            renderComponent({
                data: [
                    { queueId: null },
                    { queueId: null },
                ] as VoiceCallSummary[],
                isFetching: false,
                columns: columns,
            })

            expect(VoiceQueueProviderMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    queueIds: [],
                }),
                {},
            )
        })

        it('should display queue column', () => {
            const { queryByText } = renderComponent({
                data: [{}] as VoiceCallSummary[],
                isFetching: false,
                columns: [VoiceCallTableColumnName.Queue],
            })

            expect(
                queryByText(VoiceCallTableColumnName.Queue),
            ).toBeInTheDocument()
        })
    })

    describe('old non queue behavior', () => {
        beforeEach(() => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.ExposeVoiceQueues) {
                    return false
                }
            })
        })

        it('should discard queue ids data', () => {
            renderComponent({
                data: [
                    { queueId: 1 },
                    { queueId: 2 },
                    { queueId: 1 },
                    { queueId: null },
                ] as VoiceCallSummary[],
                isFetching: false,
                columns: columns,
            })

            expect(VoiceQueueProviderMock).not.toHaveBeenCalled()
        })

        it('should not display queue column', () => {
            const { queryByText } = renderComponent({
                data: [{}] as VoiceCallSummary[],
                isFetching: false,
                columns: [VoiceCallTableColumnName.Queue],
            })

            expect(
                queryByText(VoiceCallTableColumnName.Queue),
            ).not.toBeInTheDocument()
        })
    })
})
