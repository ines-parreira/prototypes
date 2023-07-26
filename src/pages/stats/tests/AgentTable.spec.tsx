import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {AgentsTable} from 'pages/stats/AgentsTable'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AgentTable>', () => {
    it('should render the table title', () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsTable />
            </Provider>
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
    })
})
