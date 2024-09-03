import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import moment from 'moment/moment'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {UseQueryResult} from '@tanstack/react-query'
import {assumeMock} from 'utils/testing'
import {formatReportingQueryDate} from 'utils/reporting'
import {StatsFilters} from 'models/stat/types'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {RootState, StoreDispatch} from 'state/types'
import {useVoiceCallList} from 'pages/stats/voice/hooks/useVoiceCallList'
import {useVoiceCallCount} from 'pages/stats/voice/hooks/useVoiceCallCount'
import {
    VoiceCallFilterOptions,
    VoiceCallSummary,
} from 'pages/stats/voice/models/types'
import {VoiceCallTable} from './VoiceCallTable'

jest.mock('pages/stats/voice/hooks/useVoiceCallList')
const useVoiceCallListMock = assumeMock(useVoiceCallList)

jest.mock('pages/stats/voice/hooks/useVoiceCallCount')
const useVoiceCallCountMock = assumeMock(useVoiceCallCount)

jest.mock(
    'pages/stats/voice/components/VoiceCallTable/VoiceCallTableContent',
    () => () => <div />
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('VoiceCallTable', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

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

    it('should render pagination', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [{}],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({
            total: 100,
            totalPages: 10,
        })

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
        useVoiceCallCountMock.mockReturnValue({
            total: 0,
            totalPages: 0,
        })

        renderComponent(filterOption)
        expect(useVoiceCallListMock.mock.calls[0]).toEqual(
            expect.arrayContaining([expectedSegment])
        )
    })

    it('should show the correct number of total pages', () => {
        useVoiceCallListMock.mockReturnValue({
            data: [{}],
            isFetching: false,
        } as UseQueryResult<VoiceCallSummary[], unknown>)
        useVoiceCallCountMock.mockReturnValue({
            total: 1220,
            totalPages: 123,
        })

        const {queryByText} = renderComponent()

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

        const {queryByText} = renderComponent()

        expect(queryByText('500')).toBeInTheDocument()
        expect(queryByText('600')).not.toBeInTheDocument()
    })
})
