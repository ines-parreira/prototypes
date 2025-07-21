import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import SharedBody from '../SharedBody'

describe('<SharedBody/>', () => {
    let onTeamClick: jest.MockedFunction<any>
    let onUserClick: jest.MockedFunction<any>
    let onRemoveTeam: jest.MockedFunction<any>
    let onRemoveUser: jest.MockedFunction<any>

    const getTeam = (id: number) => ({ id, name: `Team ${id}` })
    const getUser = (id: number) => ({ id, name: `User ${id}` })

    beforeEach(() => {
        onTeamClick = jest.fn()
        onUserClick = jest.fn()
        onRemoveTeam = jest.fn()
        onRemoveUser = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const { container } = render(
                <SharedBody
                    availableTeams={fromJS([getTeam(1)])}
                    availableUsers={fromJS([getUser(1)])}
                    selectedTeams={fromJS([getTeam(2), getTeam(3)])}
                    selectedUsers={fromJS([getUser(2), getUser(3)])}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                    onRemoveTeam={onRemoveTeam}
                    onRemoveUser={onRemoveUser}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
