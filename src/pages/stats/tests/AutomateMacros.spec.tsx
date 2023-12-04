import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {messagesSentPerMacro} from 'fixtures/stats'
import {renderWithRouter} from 'utils/testing'
import {integrationsState} from 'fixtures/integrations'
import {StatsFilters} from 'models/stat/types'

import useStatResource from 'hooks/reporting/useStatResource'
import AutomateMacros from '../AutomateMacros'

jest.mock('hooks/reporting/useStatResource')
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/ChannelsStatsFilter', () => () => (
    <div>ChannelsStatsFilter</div>
))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>

describe('AutomateMacros', () => {
    const defaultState = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
                integrations: [integrationsState.integrations[0].id],
            } as StatsFilters,
        }),
        integrations: fromJS(integrationsState),
    } as RootState

    beforeEach(() => {
        useStatResourceMock.mockReturnValue([null, true, _noop])
    })

    it('should render the filters and stats when stats filters are defined', () => {
        useStatResourceMock.mockReturnValue([
            messagesSentPerMacro,
            false,
            _noop,
        ])

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AutomateMacros />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
