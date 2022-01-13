import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {
    intentsBreakdownPerDay,
    intentsOccurrence,
    intentsOverview,
} from 'fixtures/stats'
import {renderWithRouter} from 'utils/testing'
import {INTENTS_BREAKDOWN_PER_DAY, INTENTS_OVERVIEW} from 'config/stats'
import {StatsFilterType} from 'state/stats/types'

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
            filters: null,
        }),
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        useStatResourceMock.mockReturnValue([null, true])
    })

    it('should not render the filters nor the stats when stats filters are not defined', () => {
        const store = mockStore(defaultState)
        const {container} = render(
            <Provider store={store}>
                <AutomationIntents />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the filters and stats when stats filters are defined', () => {
        const store = mockStore({
            ...defaultState,
            stats: fromJS({
                filters: {
                    [StatsFilterType.Period]: {
                        start_time: '2021-02-03T00:00:00.000Z',
                        end_time: '2021-02-03T23:59:59.999Z',
                    },
                    [StatsFilterType.Channels]: [TicketChannel.Chat],
                },
            }),
        })
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === INTENTS_OVERVIEW) {
                return [intentsOverview, false]
            } else if (resourceName === INTENTS_BREAKDOWN_PER_DAY) {
                return [intentsBreakdownPerDay, false]
            }
            return [intentsOccurrence, false]
        })

        const {container} = renderWithRouter(
            <Provider store={store}>
                <AutomationIntents />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
