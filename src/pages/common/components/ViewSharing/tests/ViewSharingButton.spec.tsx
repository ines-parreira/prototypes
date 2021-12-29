import React from 'react'
import {fromJS, Map} from 'immutable'
import {shallow} from 'enzyme'

import {ViewSharingButtonContainer} from '../ViewSharingButton'
import {user} from '../../../../../fixtures/users'
import {BASIC_AGENT_ROLE} from '../../../../../config/user'
import {SYSTEM_VIEW_CATEGORY} from '../../../../../constants/view'
import {ViewVisibility} from '../../../../../models/view/types'

const minProps = {
    currentUser: fromJS(user),
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
    hasViewSharingFeature: true,
    dispatch: jest.fn(),
}

describe('<ViewSharingButton/>', () => {
    describe('render()', () => {
        it('should render as public', () => {
            const component = shallow(
                <ViewSharingButtonContainer
                    {...minProps}
                    view={fromJS({visibility: ViewVisibility.Public})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as shared', () => {
            const component = shallow(
                <ViewSharingButtonContainer
                    {...minProps}
                    view={fromJS({visibility: ViewVisibility.Shared})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as private', () => {
            const component = shallow(
                <ViewSharingButtonContainer
                    {...minProps}
                    view={fromJS({visibility: ViewVisibility.Private})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as disabled because this is a system view', () => {
            const component = shallow(
                <ViewSharingButtonContainer
                    {...minProps}
                    view={fromJS({
                        visibility: ViewVisibility.Public,
                        category: SYSTEM_VIEW_CATEGORY,
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as disabled because user is not allowed', () => {
            const roles = fromJS([{name: BASIC_AGENT_ROLE}])
            const component = shallow(
                <ViewSharingButtonContainer
                    {...minProps}
                    currentUser={(fromJS(user) as Map<any, any>).set(
                        'roles',
                        roles
                    )}
                    view={fromJS({visibility: ViewVisibility.Public})}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
