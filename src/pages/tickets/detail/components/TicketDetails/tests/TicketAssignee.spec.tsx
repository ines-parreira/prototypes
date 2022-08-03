import React, {ComponentProps} from 'react'
import {shallow, mount} from 'enzyme'
import {Map, fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import TicketAssignee, {
    TicketAssigneeContainer,
} from '../TicketAssignee/TicketAssignee'

const teams: Map<any, any> = fromJS({
    all: [
        {id: 1, name: 'Team 1', decoration: {}},
        {id: 2, name: 'Team 2', decoration: {}},
    ],
})

const users: Map<any, any> = fromJS({
    all: [
        {id: 1, name: 'User 1', email: 'email1@foo.com', meta: {}},
        {id: 2, name: 'User 2', email: 'email2@foo.com', meta: {}},
    ],
})

const minProps: Omit<
    ComponentProps<typeof TicketAssigneeContainer>,
    'handleTeams' | 'handleUsers'
> = {
    currentAssigneeUser: null,
    currentAssigneeTeam: null,
    menuDirection: 'right',
    setUser: jest.fn(),
    setTeam: jest.fn(),
    className: 'classname',
    transparent: true,
    dispatch: jest.fn(),
    users: users.get('all'),
    teams: teams.get('all'),
    currentUser: fromJS({}),
}

describe('<TicketAssignee/>', () => {
    describe('render()', () => {
        it('should not display any agent info because there is no assignee', () => {
            const component = shallow(<TicketAssigneeContainer {...minProps} />)
            expect(component).toMatchSnapshot()
        })

        it('should display the info of the agent assigned', () => {
            const component = shallow(
                <TicketAssigneeContainer
                    {...minProps}
                    currentAssigneeUser={fromJS({id: 1, name: 'Steve Frizeli'})}
                    profilePictureUrl="profilePictureUrl"
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the email of the agent assigned as its name because it has no name', () => {
            const component = shallow(
                <TicketAssigneeContainer
                    {...minProps}
                    users={fromJS([
                        {id: 1, email: 'steve@acme.gorgias.io'},
                        users.getIn(['all', 1]),
                    ])}
                    currentAssigneeUser={fromJS({
                        id: 1,
                        email: 'steve@acme.gorgias.io',
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the info of the agent assigned even if a team is assigned too', () => {
            const component = shallow(
                <TicketAssigneeContainer
                    {...minProps}
                    currentAssigneeUser={fromJS({
                        id: 1,
                        email: 'steve@acme.gorgias.io',
                    })}
                    currentAssigneeTeam={fromJS({id: 1, name: 'Team 1'})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the name of the team assigned because there is no user assigned', () => {
            const component = shallow(
                <TicketAssigneeContainer
                    {...minProps}
                    currentAssigneeTeam={fromJS({id: 1, name: 'Team 1'})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display users only', () => {
            const component = shallow(
                <TicketAssigneeContainer {...minProps} handleTeams={false} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display teams only', () => {
            const component = shallow(
                <TicketAssigneeContainer {...minProps} handleUsers={false} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should not display teams because object is empty', () => {
            const component = shallow(
                <TicketAssigneeContainer {...minProps} teams={fromJS([])} />
            )

            expect(component).toMatchSnapshot()
        })
    })

    it('should read data from the redux store correctly', () => {
        const mockStore = configureMockStore([thunk])
        const store = mockStore({
            agents: users,
            teams,
            currentUser: fromJS({id: 1, email: 'steve@acme.gorgias.io'}),
        })

        const defaultProps: ComponentProps<typeof TicketAssignee> = {
            currentAssigneeUser: null,
            currentAssigneeTeam: null,
            menuDirection: 'right',
            setUser: jest.fn(),
            setTeam: jest.fn(),
            className: 'classname',
            transparent: false,
        }

        const component = mount(
            <Provider store={store}>
                <TicketAssignee {...defaultProps} />
            </Provider>
        )
        expect(component).toMatchSnapshot()
    })
})
