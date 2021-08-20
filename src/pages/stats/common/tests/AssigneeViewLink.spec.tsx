import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {LinkProps} from 'react-router-dom'
import {render} from '@testing-library/react'

import {RootState, StoreDispatch} from '../../../../state/types'
import AssigneeViewLink from '../AssigneeViewLink'
import {agents as agentsFixtures} from '../../../../fixtures/agents'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../ViewLink', () => (props: LinkProps) => (
    <div>
        Link Mock
        {JSON.stringify(props, null, 2)}
    </div>
))

describe('AssigneeViewLink', () => {
    const defaultState: Partial<RootState> = {
        agents: fromJS({all: agentsFixtures}),
    }

    const store = mockStore(defaultState)

    it.each<[string, string]>([
        [
            'not prepare a link if no agent exists under the passed name',
            'Marcus Miller',
        ],
        [
            'prepare a link when an agent exists under the passed name',
            'Acme Support',
        ],
        [
            'prepare a link when "Unassigned" is passed as agent name',
            'Unassigned',
        ],
    ])('should %s', (name, agentName) => {
        const {container} = render(
            <Provider store={store}>
                <AssigneeViewLink
                    agentName={agentName}
                    filters={[
                        {
                            left: 'ticket.created_datetime',
                            operator: 'gte',
                            right: '2021-02-03T13:14:15Z',
                        },
                    ]}
                >
                    click here!
                </AssigneeViewLink>
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
})
