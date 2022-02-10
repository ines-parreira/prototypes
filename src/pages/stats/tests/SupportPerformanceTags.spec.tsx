import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {ticketsPerTagStat} from 'fixtures/stats'
import {renderWithRouter} from 'utils/testing'
import {integrationsState} from 'fixtures/integrations'
import {StatsFilters} from 'models/stat/types'

import useStatResource from '../useStatResource'
import SupportPerformanceTags from '../SupportPerformanceTags'
import TagsStatsFilter from '../TagsStatsFilter'

jest.mock(
    '../TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)
jest.mock('../useStatResource')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
let dateNowSpy: jest.SpiedFunction<typeof Date.now>

describe('SupportPerformanceTags', () => {
    const defaultState = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
                tags: [1],
                integrations: [integrationsState.integrations[0].id],
            } as StatsFilters,
        }),
        integrations: fromJS(integrationsState),
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
        useStatResourceMock.mockReturnValue([ticketsPerTagStat, false, _noop])

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTags />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
