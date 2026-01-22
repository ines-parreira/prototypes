import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import { fireEvent, render } from '@testing-library/react'
import moment from 'moment/moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { VoiceCallTableColumn } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import { VoiceCallTable } from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTable'
import VoiceCallTableContent from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTableContent'
import { useVoiceCallCount } from 'domains/reporting/pages/voice/hooks/useVoiceCallCount'
import { useVoiceCallList } from 'domains/reporting/pages/voice/hooks/useVoiceCallList'
import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { VoiceCallFilterDirection } from 'domains/reporting/pages/voice/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import type { RootState, StoreDispatch } from 'state/types'

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('domains/reporting/pages/voice/hooks/useVoiceCallList')
const useVoiceCallListMock = assumeMock(useVoiceCallList)

jest.mock('domains/reporting/pages/voice/hooks/useVoiceCallCount')
const useVoiceCallCountMock = assumeMock(useVoiceCallCount)

jest.mock(
    'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTableContent',
)
const VoiceCallTableContentMock = assumeMock(VoiceCallTableContent)
VoiceCallTableContentMock.mockImplementation(() => <div>VoiceCallTable</div>)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('VoiceCallTable', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    beforeEach(() => {
        useFlagMock.mockImplementation((flag) => {
            return flag === FeatureFlagKey.VoiceSLA
        })
    })

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

    describe('VoiceSLA feature flag', () => {
        beforeEach(() => {
            useVoiceCallListMock.mockReturnValue({
                data: [{}],
                isFetching: false,
            } as UseQueryResult<VoiceCallSummary[], unknown>)
            useVoiceCallCountMock.mockReturnValue({
                total: 10,
                totalPages: 1,
            })
        })

        it('should include all expected columns when feature flag is enabled', () => {
            useFlagMock.mockImplementation((flag) => {
                return flag === FeatureFlagKey.VoiceSLA
            })

            renderComponent()

            expect(VoiceCallTableContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    columns: [
                        VoiceCallTableColumn.Activity,
                        VoiceCallTableColumn.Integration,
                        VoiceCallTableColumn.Queue,
                        VoiceCallTableColumn.Date,
                        VoiceCallTableColumn.SlaStatus,
                        VoiceCallTableColumn.State,
                        VoiceCallTableColumn.Recording,
                        VoiceCallTableColumn.Duration,
                        VoiceCallTableColumn.WaitTime,
                        VoiceCallTableColumn.Ticket,
                    ],
                }),
                {},
            )
        })

        it('should include all expected columns except SLA Status when feature flag is disabled', () => {
            useFlagMock.mockReturnValue(false)

            renderComponent()

            expect(VoiceCallTableContentMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    columns: [
                        VoiceCallTableColumn.Activity,
                        VoiceCallTableColumn.Integration,
                        VoiceCallTableColumn.Queue,
                        VoiceCallTableColumn.Date,
                        VoiceCallTableColumn.State,
                        VoiceCallTableColumn.Recording,
                        VoiceCallTableColumn.Duration,
                        VoiceCallTableColumn.WaitTime,
                        VoiceCallTableColumn.Ticket,
                    ],
                }),
                {},
            )
        })
    })
})
