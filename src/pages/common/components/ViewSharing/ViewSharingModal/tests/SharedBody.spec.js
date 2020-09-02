import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import SharedBody from '../SharedBody'

describe('<SharedBody/>', () => {
    let onTeamClick
    let onUserClick
    let onRemoveTeam
    let onRemoveUser

    const getTeam = (id) => ({id, name: `Team ${id}`})
    const getUser = (id) => ({id, name: `User ${id}`})

    beforeEach(() => {
        onTeamClick = jest.fn()
        onUserClick = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <SharedBody
                    availableTeams={fromJS([getTeam(1)])}
                    availableUsers={fromJS([getUser(1)])}
                    selectedTeams={fromJS([getTeam(2), getTeam(3)])}
                    selectedUsers={fromJS([getUser(2), getUser(3)])}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                    onRemoveTeam={onRemoveTeam}
                    onRemoveUser={onRemoveUser}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
