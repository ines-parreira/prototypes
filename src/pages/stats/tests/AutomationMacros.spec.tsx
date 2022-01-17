import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {messagesSentPerMacro} from 'fixtures/stats'
import {renderWithRouter} from 'utils/testing'
import {integrationsState} from 'fixtures/integrations'
import {StatsFilterType} from 'state/stats/types'

import useStatResource from '../useStatResource'
import AutomationMacros from '../AutomationMacros'

jest.mock('../useStatResource')
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>

describe('AutomationMacros', () => {
    const defaultState = {
        stats: fromJS({
            filters: null,
        }),
        integrations: fromJS(integrationsState),
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        useStatResourceMock.mockReturnValue([null, true, _noop])
    })

    it('should not render the filters nor the stats when stats filters are not defined', () => {
        const store = mockStore(defaultState)
        const {container} = render(
            <Provider store={store}>
                <AutomationMacros />
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
                    [StatsFilterType.Integrations]: [
                        integrationsState.integrations[0].id,
                    ],
                },
            }),
        })
        useStatResourceMock.mockReturnValue([
            messagesSentPerMacro,
            false,
            _noop,
        ])

        const {container} = renderWithRouter(
            <Provider store={store}>
                <AutomationMacros />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
