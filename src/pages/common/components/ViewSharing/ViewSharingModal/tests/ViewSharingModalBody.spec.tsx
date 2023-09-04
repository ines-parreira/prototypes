import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {ViewVisibility} from 'models/view/types'
import {ViewSharingModalBodyContainer} from '../ViewSharingModalBody'

describe('<ViewSharingModalBody/>', () => {
    const minProps = {
        error: null,
        isLoading: false,
        setVisibility: jest.fn(),
        onTeamClick: jest.fn(),
        onUserClick: jest.fn(),
        onRemoveTeam: jest.fn(),
        onRemoveUser: jest.fn(),
        users: fromJS([]),
        teams: fromJS([]),
        dispatch: jest.fn(),
    }

    describe('render()', () => {
        it('should render as a spinner', () => {
            const component = shallow(
                <ViewSharingModalBodyContainer
                    {...minProps}
                    visibility={ViewVisibility.Public}
                    isLoading
                    initialTeams={fromJS([])}
                    initialUsers={fromJS([])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render an error', () => {
            const component = shallow(
                <ViewSharingModalBodyContainer
                    {...minProps}
                    visibility={ViewVisibility.Public}
                    error={new Error('foo bar')}
                    initialTeams={fromJS([])}
                    initialUsers={fromJS([])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render public body', () => {
            const component = shallow(
                <ViewSharingModalBodyContainer
                    {...minProps}
                    visibility={ViewVisibility.Public}
                    initialTeams={fromJS([])}
                    initialUsers={fromJS([])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render shared body', () => {
            const component = shallow(
                <ViewSharingModalBodyContainer
                    {...minProps}
                    visibility={ViewVisibility.Shared}
                    initialTeams={fromJS([])}
                    initialUsers={fromJS([])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render private body', () => {
            const component = shallow(
                <ViewSharingModalBodyContainer
                    {...minProps}
                    visibility={ViewVisibility.Private}
                    initialTeams={fromJS([])}
                    initialUsers={fromJS([])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
