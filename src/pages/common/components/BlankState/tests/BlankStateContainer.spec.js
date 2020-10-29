import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import BlankStateContainer, {
    TICKET_CLOSED_BY_CURRENT_AGENT_7_DAYS,
} from '../BlankStateContainer.tsx'
import {initialState} from '../../../../../state/currentUser/reducers.ts'

const mockStore = configureMockStore([thunk])

describe('BlankStateContainer', () => {
    it('should inject props from the redux state', () => {
        const store = mockStore({
            stats: fromJS({
                [TICKET_CLOSED_BY_CURRENT_AGENT_7_DAYS]: {
                    data: {
                        lines: [
                            [
                                {name: 'Steve', type: 'string'},
                                {value: 45, type: 'number'},
                            ],
                        ],
                    },
                },
            }),
            currentUser: initialState,
        })
        const component = shallow(
            <Provider store={store}>
                <BlankStateContainer />
            </Provider>
        )
        expect(component.dive()).toMatchSnapshot()
    })
})
