import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {TicketChannel} from 'business/types/ticket'
import {integrationsState} from 'fixtures/integrations'
import {ticketsPerTagStat} from 'fixtures/stats'
import useStatResource from 'hooks/reporting/useStatResource'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {TagFilterInstanceId} from 'models/stat/types'

import TagsStatsFilter from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'
import SupportPerformanceTags from 'pages/stats/SupportPerformanceTags'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {renderWithRouter} from 'utils/testing'

jest.mock(
    'pages/stats/common/filters/DEPRECATED_TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) => (
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
        )
)
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('hooks/reporting/useStatResource')
jest.mock(
    'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter',
    () => () => <div>ChannelsStatsFilter</div>
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
let dateNowSpy: jest.SpiedFunction<typeof Date.now>

describe('SupportPerformanceTags', () => {
    const defaultState = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: withDefaultLogicalOperator([TicketChannel.Chat]),
                tags: [
                    {
                        ...withDefaultLogicalOperator([1]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
                integrations: withDefaultLogicalOperator([
                    integrationsState.integrations[0].id,
                ]),
            },
        },
        integrations: fromJS(integrationsState),
        entities: {
            tags: {},
        },
        ui: {
            stats: {filters: uiStatsInitialState},
        },
    } as RootState

    beforeEach(() => {
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
