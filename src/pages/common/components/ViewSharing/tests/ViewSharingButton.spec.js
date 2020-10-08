import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import ViewSharingButton from '../ViewSharingButton'
import {currentUser} from '../../../../../fixtures/users'
import {BASIC_AGENT_ROLE} from '../../../../../config/user.ts'
import {
    SYSTEM_VIEW_CATEGORY,
    ViewVisibility,
} from '../../../../../constants/view.ts'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const getState = (currentUser) => ({
    currentUser,
    agents: fromJS({
        all: [
            {id: 1, name: 'User 1'},
            {id: 2, name: 'User 2'},
            {id: 3, name: 'User 3'},
        ],
    }),
    teams: fromJS({
        all: {
            '1': {id: 1, name: 'Team 1'},
            '2': {id: 2, name: 'Team 2'},
            '3': {id: 3, name: 'Team 3'},
        },
    }),
})

describe('<ViewSharingButton/>', () => {
    describe('render()', () => {
        it('should render as public', () => {
            const view = fromJS({visibility: ViewVisibility.PUBLIC})
            const admin = fromJS(currentUser)
            const store = mockStore(getState(admin))

            const component = shallow(
                <ViewSharingButton store={store} className="foo" view={view} />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render as shared', () => {
            const view = fromJS({visibility: ViewVisibility.SHARED})
            const admin = fromJS(currentUser)
            const store = mockStore(getState(admin))

            const component = shallow(
                <ViewSharingButton store={store} className="foo" view={view} />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render as private', () => {
            const view = fromJS({visibility: ViewVisibility.PRIVATE})
            const admin = fromJS(currentUser)
            const store = mockStore(getState(admin))

            const component = shallow(
                <ViewSharingButton store={store} className="foo" view={view} />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render as disabled because this is a system view', () => {
            const view = fromJS({
                visibility: ViewVisibility.PUBLIC,
                category: SYSTEM_VIEW_CATEGORY,
            })
            const admin = fromJS(currentUser)
            const store = mockStore(getState(admin))

            const component = shallow(
                <ViewSharingButton store={store} className="foo" view={view} />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render as disabled because user is not allowed', () => {
            const view = fromJS({visibility: ViewVisibility.PUBLIC})
            const roles = fromJS([{name: BASIC_AGENT_ROLE}])
            const basicAgent = fromJS(currentUser).set('roles', roles)
            const store = mockStore(getState(basicAgent))

            const component = shallow(
                <ViewSharingButton store={store} className="foo" view={view} />
            )

            expect(component.dive()).toMatchSnapshot()
        })
    })
})
