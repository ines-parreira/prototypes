import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'

import {RootState} from '../../../state/types'
import AgentsStatsFilter from '../AgentsStatsFilter'
import {agents} from '../../../fixtures/agents'
import {teams} from '../../../fixtures/teams'

const mockStore = configureMockStore([thunk])

describe('AgentsStatsFilter', () => {
    const defaultState = {
        stats: fromJS({
            filters: null,
        }),
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
    } as RootState

    it('should render agents stats filter', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <AgentsStatsFilter value={[agents[0].id, teams[0].id]} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should merge stats filters on item select', () => {
        const store = mockStore(defaultState)
        const {getByLabelText} = render(
            <Provider store={store}>
                <AgentsStatsFilter value={[]} />
            </Provider>
        )

        fireEvent.click(getByLabelText(agents[0].name))

        expect(store.getActions()).toMatchSnapshot()
    })
})
