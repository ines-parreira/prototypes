import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import DEPRECATED_AgentsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_AgentsStatsFilter'
import {
    initialState,
    mergeStatsFilters,
} from 'domains/reporting/state/stats/statsSlice'
import { agents } from 'fixtures/agents'
import { teams } from 'fixtures/teams'
import { RootState } from 'state/types'

const mockStore = configureMockStore([thunk])

describe('DEPRECATED_AgentsStatsFilter', () => {
    const defaultState = {
        stats: initialState,
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
    } as RootState

    it('should render agents stats filter', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <DEPRECATED_AgentsStatsFilter
                    value={[agents[0].id, teams[0].id]}
                />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should merge stats filters on item select', () => {
        const store = mockStore(defaultState)
        const { getByLabelText } = render(
            <Provider store={store}>
                <DEPRECATED_AgentsStatsFilter value={[]} />
            </Provider>,
        )

        fireEvent.click(getByLabelText(agents[0].name))

        expect(store.getActions()).toContainEqual(
            mergeStatsFilters({ agents: [agents[0].id] }),
        )
    })
})
