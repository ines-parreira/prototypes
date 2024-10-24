import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import React from 'react'

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
            const {container} = render(
                <PeopleSearchResults
                    handleTeams
                    handleUsers
                    teams={(teams.get('all') as Map<any, any>).valueSeq()}
                    users={users.get('all')}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                />
            )

            expect(container).toMatchSnapshot()
        })

        it('should render with custom children displayed before teams', () => {
            const customContent = 'foo'
            const {getByText} = render(
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

            expect(getByText(customContent)).toBeInTheDocument()
        })

        it('should render without teams', () => {
            const {queryByText} = render(
                <PeopleSearchResults
                    handleTeams={false}
                    handleUsers
                    teams={(teams.get('all') as Map<any, any>).valueSeq()}
                    users={users.get('all')}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                />
            )

            expect(queryByText('Teams')).not.toBeInTheDocument()
        })

        it('should render without users', () => {
            const {queryByText} = render(
                <PeopleSearchResults
                    handleTeams
                    handleUsers={false}
                    teams={(teams.get('all') as Map<any, any>).valueSeq()}
                    users={users.get('all')}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                />
            )

            expect(queryByText('Users')).not.toBeInTheDocument()
        })
    })
})
