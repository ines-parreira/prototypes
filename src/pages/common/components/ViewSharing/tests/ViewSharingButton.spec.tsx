import React from 'react'
import {fromJS, Map} from 'immutable'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import ViewSharingButton from '../ViewSharingButton'
import {user} from '../../../../../fixtures/users'
import {BASIC_AGENT_ROLE} from '../../../../../config/user'
import {
    SYSTEM_VIEW_CATEGORY,
    ViewVisibility,
} from '../../../../../constants/view'
import {AccountFeatures} from '../../../../../state/currentAccount/types'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const getState = (currentUser: Map<any, any>) => ({
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
    currentAccount: fromJS({
        features: fromJS({[AccountFeatures.ViewSharing]: true}),
    }),
})

describe('<ViewSharingButton/>', () => {
    describe('render()', () => {
        it('should render as public', () => {
            const view = fromJS({visibility: ViewVisibility.PUBLIC})
            const admin = fromJS(user)
            const store = mockStore(getState(admin))

            const component = shallow(
                <ViewSharingButton
                    {...({store} as any)}
                    className="foo"
                    view={view}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render as shared', () => {
            const view = fromJS({visibility: ViewVisibility.SHARED})
            const admin = fromJS(user)
            const store = mockStore(getState(admin))

            const component = shallow(
                <ViewSharingButton
                    {...({store} as any)}
                    className="foo"
                    view={view}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render as private', () => {
            const view = fromJS({visibility: ViewVisibility.PRIVATE})
            const admin = fromJS(user)
            const store = mockStore(getState(admin))

            const component = shallow(
                <ViewSharingButton
                    {...({store} as any)}
                    className="foo"
                    view={view}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render as disabled because this is a system view', () => {
            const view = fromJS({
                visibility: ViewVisibility.PUBLIC,
                category: SYSTEM_VIEW_CATEGORY,
            })
            const admin = fromJS(user)
            const store = mockStore(getState(admin))

            const component = shallow(
                <ViewSharingButton
                    {...({store} as any)}
                    className="foo"
                    view={view}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should render as disabled because user is not allowed', () => {
            const view = fromJS({visibility: ViewVisibility.PUBLIC})
            const roles = fromJS([{name: BASIC_AGENT_ROLE}])
            const basicAgent = (fromJS(user) as Map<any, any>).set(
                'roles',
                roles
            )
            const store = mockStore(getState(basicAgent))

            const component = shallow(
                <ViewSharingButton
                    {...({store} as any)}
                    className="foo"
                    view={view}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })
    })
})
