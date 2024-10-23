import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {
    intentsBreakdownPerDay,
    intentsOccurrence,
    intentsOverview,
} from 'fixtures/stats'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {renderWithRouter} from 'utils/testing'
import {INTENTS_BREAKDOWN_PER_DAY, INTENTS_OVERVIEW} from 'config/stats'

import useStatResource from 'hooks/reporting/useStatResource'
import AutomateIntents from 'pages/stats/AutomateIntents'

jest.mock('hooks/reporting/useStatResource')
jest.mock('react-chartjs-2', () => ({Bar: () => <canvas />}))
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock(
    'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter',
    () => () => <div>ChannelsStatsFilter</div>
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>

describe('AutomateIntents', () => {
    const defaultState = {
        stats: {
            filters: fromLegacyStatsFilters({
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
            }),
        },
        ui: {
            stats: {filters: uiStatsInitialState},
        },
    } as RootState

    beforeEach(() => {
        useStatResourceMock.mockReturnValue([null, true, _noop])
    })

    it('should render the filters and stats when stats filters are defined', () => {
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === INTENTS_OVERVIEW) {
                return [intentsOverview, false, _noop]
            } else if (resourceName === INTENTS_BREAKDOWN_PER_DAY) {
                return [intentsBreakdownPerDay, false, _noop]
            }
            return [intentsOccurrence, false, _noop]
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AutomateIntents />
                channels: withDefaultLogicalOperator([TicketChannel.Chat]),
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
