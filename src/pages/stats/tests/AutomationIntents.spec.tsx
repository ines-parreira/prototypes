import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {
    intentsBreakdownPerDay,
    intentsOccurrence,
    intentsOverview,
} from 'fixtures/stats'
import {renderWithRouter} from 'utils/testing'
import {INTENTS_BREAKDOWN_PER_DAY, INTENTS_OVERVIEW} from 'config/stats'
import {StatsFilters} from 'models/stat/types'

import useStatResource from '../useStatResource'
import AutomationIntents from '../AutomationIntents'

jest.mock('../useStatResource')
jest.mock('react-chartjs-2', () => ({Bar: () => <canvas />}))
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>

describe('AutomationIntents', () => {
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
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
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
                <AutomationIntents />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
