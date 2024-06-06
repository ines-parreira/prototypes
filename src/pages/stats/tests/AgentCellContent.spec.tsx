import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {AgentCellContent} from 'pages/stats/AgentCellContent'
import {RootState, StoreDispatch} from 'state/types'
import {agents} from 'fixtures/agents'
import {mergeStatsFilters} from 'state/stats/statsSlice'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AgentCellContent>', () => {
    const agent = agents[0]

    const defaultState = {
        agents: fromJS({
            all: agents,
        }),
    } as RootState

    it('should render agent name', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AgentCellContent agent={agent} />
            </Provider>
        )

        expect(screen.getByText(agents[0].name)).toBeInTheDocument()
    })

    it('should dispatch agent id on click agent name', () => {
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <AgentCellContent agent={agent} />
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
