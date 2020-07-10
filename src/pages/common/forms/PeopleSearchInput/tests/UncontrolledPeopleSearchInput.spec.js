import React from 'react'
import {render} from 'enzyme'
import {fromJS} from 'immutable'

import UncontrolledPeopleSearchInput from '../UncontrolledPeopleSearchInput'

const teams = fromJS({
    all: {
        1: {id: 1, name: 'Team 1', decoration: {}},
        2: {id: 2, name: 'Team 2', decoration: {}},
    },
})

const users = fromJS({
    all: [
        {id: 1, name: 'User 1', email: 'email1@foo.com', meta: {}},
        {id: 2, name: 'User 2', email: 'email2@foo.com', meta: {}},
    ],
})

describe('<UncontrolledPeopleSearchInput/>', () => {
    let onTeamClick
    let onUserClick

    beforeEach(() => {
        onTeamClick = jest.fn()
        onUserClick = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = render(
                <UncontrolledPeopleSearchInput
                    teams={teams.get('all').valueSeq()}
                    users={users.get('all')}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
