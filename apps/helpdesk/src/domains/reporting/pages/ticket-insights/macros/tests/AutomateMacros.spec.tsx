import React from 'react'

import { fromJS } from 'immutable'
import _noop from 'lodash/noop'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import useStatResource from 'domains/reporting/hooks/useStatResource'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import AutomateMacros from 'domains/reporting/pages/ticket-insights/macros/AutomateMacros'
import { integrationsState } from 'fixtures/integrations'
import { messagesSentPerMacro } from 'fixtures/stats'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

jest.mock('domains/reporting/hooks/useStatResource')
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
jest.mock(
    'domains/reporting/pages/common/filters/DEPRECATED_ChannelsStatsFilter',
    () => () => <div>ChannelsStatsFilter</div>,
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>

describe('AutomateMacros', () => {
    const defaultState = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: withDefaultLogicalOperator([TicketChannel.Chat]),
                integrations: withDefaultLogicalOperator([
                    integrationsState.integrations[0].id,
                ]),
            },
        },
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

        const { container } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AutomateMacros />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
