import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {ViewSharingModalBodyContainer} from '../ViewSharingModalBody'
import {ViewVisibility} from '../../../../../../constants/view'

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
                    visibility={ViewVisibility.PUBLIC}
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
                    visibility={ViewVisibility.PUBLIC}
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
                    visibility={ViewVisibility.PUBLIC}
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
                    visibility={ViewVisibility.SHARED}
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
                    visibility={ViewVisibility.PRIVATE}
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
