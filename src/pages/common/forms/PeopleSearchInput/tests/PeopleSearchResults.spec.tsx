import React from 'react'
import {render} from 'enzyme'
import {fromJS, Map} from 'immutable'

import PeopleSearchResults from '../PeopleSearchResults'

const teams: Map<any, any> = fromJS({
    all: {
        1: {id: 1, name: 'Team 1', decoration: {}},
        2: {id: 2, name: 'Team 2', decoration: {}},
    },
})

const users: Map<any, any> = fromJS({
    all: [
        {id: 1, name: 'User 1', email: 'email1@foo.com', meta: {}},
        {id: 2, name: 'User 2', email: 'email2@foo.com', meta: {}},
    ],
})

describe('<PeopleSearchResults/>', () => {
    let onTeamClick: jest.MockedFunction<any>
    let onUserClick: jest.MockedFunction<any>

    beforeEach(() => {
        onTeamClick = jest.fn()
        onUserClick = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = render(
                <PeopleSearchResults
                    handleTeams
                    handleUsers
                    teams={(teams.get('all') as Map<any, any>).valueSeq()}
                    users={users.get('all')}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with custom children displayed before teams', () => {
            const component = render(
                <PeopleSearchResults
                    handleTeams
                    handleUsers
                    teams={(teams.get('all') as Map<any, any>).valueSeq()}
                    users={users.get('all')}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                >
                    <span>foo</span>
                </PeopleSearchResults>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without teams', () => {
            const component = render(
                <PeopleSearchResults
                    handleTeams={false}
                    handleUsers
                    teams={(teams.get('all') as Map<any, any>).valueSeq()}
                    users={users.get('all')}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without users', () => {
            const component = render(
                <PeopleSearchResults
                    handleTeams
                    handleUsers={false}
                    teams={(teams.get('all') as Map<any, any>).valueSeq()}
                    users={users.get('all')}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
