import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {agents} from 'fixtures/agents'
import {AgentNameCellContent} from 'pages/stats/support-performance/agents/AgentNameCellContent'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import {RootState, StoreDispatch} from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AgentNameCellContent>', () => {
    const agent = agents[0]

    const defaultState = {
        agents: fromJS({
            all: agents,
        }),
    } as RootState

    it('should render agent name', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AgentNameCellContent agent={agent} />
            </Provider>
        )

        expect(screen.getByText(agents[0].name)).toBeInTheDocument()
    })

    it('should dispatch agent id on click agent name', () => {
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <AgentNameCellContent agent={agent} />
            </Provider>
        )

        fireEvent.click(screen.getByText(agents[0].name))

        expect(store.getActions()).toMatchObject(
            expect.arrayContaining([
                expect.objectContaining(
                    mergeStatsFilters({agents: [agents[0].id]})
                ),
            ])
        )
    })
})
