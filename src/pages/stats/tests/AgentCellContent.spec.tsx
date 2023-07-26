import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {AgentCellContent} from 'pages/stats/AgentCellContent'
import {RootState, StoreDispatch} from 'state/types'
import {agents} from 'fixtures/agents'
import {MERGE_STATS_FILTERS} from 'state/stats/constants'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AgentCellContent>', () => {
    const agentId = agents[0].id

    const defaultState = {
        agents: fromJS({
            all: agents,
        }),
    } as RootState

    it('should render agent name', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AgentCellContent agentId={agentId} />
            </Provider>
        )

        expect(screen.getByText(agents[0].name)).toBeInTheDocument()
    })

    it('should dispatch agent id on click agent name', () => {
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <AgentCellContent agentId={agentId} />
            </Provider>
        )

        fireEvent.click(screen.getByText(agents[0].name))

        expect(store.getActions()).toMatchObject(
            expect.arrayContaining([
                expect.objectContaining({
                    filters: fromJS({agents: [agents[0].id]}),
                    type: MERGE_STATS_FILTERS,
                }),
            ])
        )
    })
})
