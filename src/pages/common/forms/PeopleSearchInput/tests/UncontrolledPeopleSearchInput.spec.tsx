import React from 'react'
import {render} from 'enzyme'
import {fromJS} from 'immutable'

import UncontrolledPeopleSearchInput from '../UncontrolledPeopleSearchInput'

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

describe('<UncontrolledPeopleSearchInput/>', () => {
    let onTeamClick: jest.MockedFunction<any>
    let onUserClick: jest.MockedFunction<any>

    beforeEach(() => {
        onTeamClick = jest.fn()
        onUserClick = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = render(
                <UncontrolledPeopleSearchInput
                    teams={teams.get('all')}
                    users={users.get('all')}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
