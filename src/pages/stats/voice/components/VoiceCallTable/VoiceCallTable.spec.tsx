import React from 'react'

import { UseQueryResult } from '@tanstack/react-query'
import { fireEvent, render } from '@testing-library/react'
import moment from 'moment/moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { StatsFilters } from 'models/stat/types'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import { useVoiceCallCount } from 'pages/stats/voice/hooks/useVoiceCallCount'
import { useVoiceCallList } from 'pages/stats/voice/hooks/useVoiceCallList'
import {
    VoiceCallFilterDirection,
    VoiceCallSummary,
} from 'pages/stats/voice/models/types'
import { RootState, StoreDispatch } from 'state/types'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

import VoiceQueueProvider from '../VoiceQueue/VoiceQueueProvider'
import { VoiceCallTableColumnName } from './constants'
import { VoiceCallTable } from './VoiceCallTable'
import VoiceCallTableContent from './VoiceCallTableContent'

jest.mock('pages/stats/voice/hooks/useVoiceCallList')
const useVoiceCallListMock = assumeMock(useVoiceCallList)

jest.mock('pages/stats/voice/hooks/useVoiceCallCount')
const useVoiceCallCountMock = assumeMock(useVoiceCallCount)

jest.mock('pages/stats/voice/components/VoiceCallTable/VoiceCallTableContent')
const VoiceCallTableContentMock = assumeMock(VoiceCallTableContent)
VoiceCallTableContentMock.mockImplementation(() => <div>VoiceCallTable</div>)

jest.mock('pages/stats/voice/components/VoiceQueue/VoiceQueueProvider')
const VoiceQueueProviderMock = assumeMock(VoiceQueueProvider)
VoiceQueueProviderMock.mockImplementation(({ children }) => <>{children}</>)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

describe('VoiceCallTable', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    const renderComponent = (
        filterOption = { direction: VoiceCallFilterDirection.All },
    ) => {
        return render(
            <Provider store={mockStore({})}>
                <VoiceCallTable
                    statsFilters={statsFilters}
                    userTimezone={'UTC'}
                    filterOption={filterOption}
                />
            </Provider>,
        )
    }

    beforeEach(() => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ExposeVoiceQueues) {
                return true
            }
        })
    })

    it('should render pagination', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [{}],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({
            total: 100,
            totalPages: 10,
        })

        const { getByText, getByLabelText } = renderComponent()

        expect(getByText('VoiceCallTable')).toBeInTheDocument()

        expect(
            getByLabelText('Page 1 is your current page'),
        ).toBeInTheDocument()
        expect(getByLabelText('Page 2')).toBeInTheDocument()
        expect(getByLabelText('Page 10')).toBeInTheDocument()

        fireEvent.click(getByLabelText('Page 2'))
        expect(
            getByLabelText('Page 2 is your current page'),
        ).toBeInTheDocument()
    })

    it.each([
        {
            filterOption: undefined,
            expectedSegment: undefined,
            expectedStatusFilter: undefined,
        },
        {
            filterOption: { direction: VoiceCallFilterDirection.All },
            expectedSegment: undefined,
            expectedStatusFilter: undefined,
        },
        {
            filterOption: {
                direction: VoiceCallFilterDirection.Inbound,
                statuses: [
                    VoiceCallDisplayStatus.Answered,
                    VoiceCallDisplayStatus.Abandoned,
                ],
            },
            expectedSegment: VoiceCallSegment.inboundCalls,
            expectedStatusFilter: [
                VoiceCallDisplayStatus.Answered,
                VoiceCallDisplayStatus.Abandoned,
            ],
        },
        {
            filterOption: {
                direction: VoiceCallFilterDirection.Outbound,
                statuses: [
                    VoiceCallDisplayStatus.Answered,
                    VoiceCallDisplayStatus.Failed,
                ],
            },
            expectedSegment: VoiceCallSegment.outboundCalls,
            expectedStatusFilter: [
                VoiceCallDisplayStatus.Answered,
                VoiceCallDisplayStatus.Failed,
            ],
        },
    ])(
        'should handle filter option',
        ({ filterOption, expectedSegment, expectedStatusFilter }) => {
            useVoiceCallListMock.mockReturnValue({
                data: [] as VoiceCallSummary[],
                isFetching: false,
            } as UseQueryResult<VoiceCallSummary[], unknown>)
            useVoiceCallCountMock.mockReturnValue({
                total: 0,
                totalPages: 0,
            })

            renderComponent(filterOption)
            expect(useVoiceCallListMock.mock.calls[0]).toEqual(
                expect.arrayContaining([expectedSegment, expectedStatusFilter]),
            )
        },
    )

    it('should show the correct number of total pages', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [{}],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({
            total: 1220,
            totalPages: 123,
        })

        const { queryByText } = renderComponent()

        expect(queryByText('123')).toBeInTheDocument()
    })

    it('should not show more than 500 pages', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [{}],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({
            total: 5990,
            totalPages: 600,
        })

        const { queryByText } = renderComponent()

        expect(queryByText('500')).toBeInTheDocument()
        expect(queryByText('600')).not.toBeInTheDocument()
    })

    it('should update current page if number of total pages changes', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [{}],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({
            total: 100,
            totalPages: 10,
        })

        const { getByLabelText, rerender } = renderComponent()

        expect(
            getByLabelText('Page 1 is your current page'),
        ).toBeInTheDocument()
        expect(getByLabelText('Page 2')).toBeInTheDocument()

        fireEvent.click(getByLabelText('Page 3'))
        expect(
            getByLabelText('Page 3 is your current page'),
        ).toBeInTheDocument()

        useVoiceCallCountMock.mockReturnValue({
            total: 20,
            totalPages: 2,
        })
        rerender(
            <Provider store={mockStore({})}>
                <VoiceCallTable
                    statsFilters={statsFilters}
                    userTimezone={'UTC'}
                    filterOption={{ direction: VoiceCallFilterDirection.All }}
                />
            </Provider>,
        )

        expect(
            getByLabelText('Page 2 is your current page'),
        ).toBeInTheDocument()
    })

    it('should get queue ids from data and pass it to the voice queue provider', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [
                { queueId: 1 },
                { queueId: 2 },
                { queueId: 1 },
                { queueId: null },
            ] as VoiceCallSummary[],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({
            total: 4,
            totalPages: 1,
        })

        renderComponent()

        expect(VoiceQueueProviderMock).toHaveBeenCalledWith(
            expect.objectContaining({
                queueIds: [1, 2],
            }),
            {},
        )
    })

    it('should return empty queue ids if none are found', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [{ queueId: null }, { queueId: null }] as VoiceCallSummary[],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({
            total: 2,
            totalPages: 1,
        })

        renderComponent()

        expect(VoiceQueueProviderMock).toHaveBeenCalledWith(
            expect.objectContaining({
                queueIds: [],
            }),
            {},
        )
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
            useVoiceCallListMock.mockReturnValue({
                data: [
                    { queueId: 1 },
                    { queueId: 2 },
                    { queueId: 1 },
                    { queueId: null },
                ] as VoiceCallSummary[],
                isFetching: false,
            } as UseQueryResult<VoiceCallSummary[], unknown>)
            useVoiceCallCountMock.mockReturnValue({
                total: 4,
                totalPages: 1,
            })

            renderComponent()

            expect(VoiceQueueProviderMock).not.toHaveBeenCalled()
        })

        it('should not display queue column', () => {
            useVoiceCallListMock.mockReturnValue({
                data: [{}],
                isFetching: false,
            } as UseQueryResult<VoiceCallSummary[], unknown>)
            useVoiceCallCountMock.mockReturnValue({
                total: 100,
                totalPages: 10,
            })

            renderComponent()

            expect(VoiceCallTableContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    columns: expect.not.arrayContaining([
                        VoiceCallTableColumnName.Queue,
                    ]),
                }),
                {},
            )
        })
    })
})
