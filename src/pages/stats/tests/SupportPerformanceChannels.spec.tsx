import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {
    ticketsCreatedPerChannel,
    ticketsCreatedPerChannelPerDay,
} from 'fixtures/stats'
import {renderWithRouter} from 'utils/testing'
import {TICKETS_CREATED_PER_CHANNEL_PER_DAY} from 'config/stats'
import {StatsFilters} from 'models/stat/types'

import useStatResource from '../useStatResource'
import SupportPerformanceChannels from '../SupportPerformanceChannels'

jest.mock('../useStatResource')
jest.mock('react-chartjs-2', () => ({Bar: () => <canvas />}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
let dateNowSpy: jest.SpiedFunction<typeof Date.now>

describe('SupportPerformanceChannels', () => {
    const defaultState = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
            } as StatsFilters,
        }),
        entities: {
            tags: {},
        },
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        useStatResourceMock.mockReturnValue([null, true, _noop])
        dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => 1487076708000)
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
    })

    it('should render the filters and stats when stats filters are defined', () => {
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === TICKETS_CREATED_PER_CHANNEL_PER_DAY) {
                return [ticketsCreatedPerChannelPerDay, false, _noop]
            }
            return [ticketsCreatedPerChannel, false, _noop]
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceChannels />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
