import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import ViewSharingModalWarning from '../ViewSharingModalWarning'

describe('<ViewSharingModalWarning/>', () => {
    const getTeam = (id) => ({id, name: `Team ${id}`})
    const getUser = (id) => ({id, name: `User ${id}`})

    describe('render()', () => {
        it('should not render anything because view is public', () => {
            const component = shallow(
                <ViewSharingModalWarning
                    isPublic
                    initialTeams={fromJS([])}
                    initialUsers={fromJS([])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should not render anything because selected items are the same than initial items', () => {
            const component = shallow(
                <ViewSharingModalWarning
                    isPublic={false}
                    initialTeams={fromJS([getTeam(1)])}
                    initialUsers={fromJS([getUser(1)])}
                    selectedTeams={fromJS([getTeam(1)])}
                    selectedUsers={fromJS([getUser(1)])}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render one missing team', () => {
            const component = shallow(
                <ViewSharingModalWarning
                    isPublic={false}
                    initialTeams={fromJS([getTeam(1)])}
                    initialUsers={fromJS([getUser(1)])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([getUser(1)])}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render two missing teams', () => {
            const component = shallow(
                <ViewSharingModalWarning
                    isPublic={false}
                    initialTeams={fromJS([getTeam(1), getTeam(2)])}
                    initialUsers={fromJS([getUser(1)])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([getUser(1)])}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render one missing user', () => {
            const component = shallow(
                <ViewSharingModalWarning
                    isPublic={false}
                    initialTeams={fromJS([getTeam(1)])}
                    initialUsers={fromJS([getUser(1)])}
                    selectedTeams={fromJS([getTeam(1)])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render two missing users', () => {
            const component = shallow(
                <ViewSharingModalWarning
                    isPublic={false}
                    initialTeams={fromJS([getTeam(1)])}
                    initialUsers={fromJS([getUser(1), getUser(2)])}
                    selectedTeams={fromJS([getTeam(1)])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render one missing user and one missing team', () => {
            const component = shallow(
                <ViewSharingModalWarning
                    isPublic={false}
                    initialTeams={fromJS([getTeam(1)])}
                    initialUsers={fromJS([getUser(1)])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render two missing users and two missing teams', () => {
            const component = shallow(
                <ViewSharingModalWarning
                    isPublic={false}
                    initialTeams={fromJS([getTeam(1), getTeam(2)])}
                    initialUsers={fromJS([getUser(1), getUser(2)])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
