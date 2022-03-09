import React from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'

import {EventObjectType, EventType} from 'models/event/types'
import {events as events} from 'fixtures/event'
import {RootState, StoreDispatch} from 'state/types'

import UserAuditRow from '../UserAuditRow'

global.Math.random = () => 0.8

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    agents: fromJS({
        all: [
            {id: 1, name: 'agent 1', email: 'agent1@gorgias.io'},
            {id: 2, name: 'agent 2', email: 'agent2@gorgias.io'},
        ],
    }),
} as RootState

describe('<UserAuditRow/>', () => {
    it('should render with a user, event type and object type', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <UserAuditRow eventItem={events[1]} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should not render user when no agents are in store', () => {
        const {container} = render(
            <Provider store={mockStore({agents: fromJS({})})}>
                <UserAuditRow eventItem={events[1]} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it.each([
        EventObjectType.Ticket,
        EventObjectType.Customer,
        EventObjectType.User,
    ])('should render with a link to %s object type', (objectType) => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <UserAuditRow
                    eventItem={{
                        ...events[0],
                        object_type: objectType,
                        type: '' as EventType,
                    }}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
