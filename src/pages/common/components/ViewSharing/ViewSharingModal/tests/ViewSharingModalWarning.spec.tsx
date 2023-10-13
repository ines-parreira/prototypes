import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import ViewSharingModalWarning from '../ViewSharingModalWarning'

describe('<ViewSharingModalWarning/>', () => {
    const getTeam = (id: number) => ({id, name: `Team ${id}`})
    const getUser = (id: number) => ({id, name: `User ${id}`})

    describe('render()', () => {
        it('should not render anything because view is public', () => {
            const {container} = render(
                <ViewSharingModalWarning
                    initialTeams={fromJS([])}
                    initialUsers={fromJS([])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not render anything because selected items are the same than initial items', () => {
            const {container} = render(
                <ViewSharingModalWarning
                    initialTeams={fromJS([getTeam(1)])}
                    initialUsers={fromJS([getUser(1)])}
                    selectedTeams={fromJS([getTeam(1)])}
                    selectedUsers={fromJS([getUser(1)])}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render one missing team', () => {
            const {container} = render(
                <ViewSharingModalWarning
                    initialTeams={fromJS([getTeam(1)])}
                    initialUsers={fromJS([getUser(1)])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([getUser(1)])}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render two missing teams', () => {
            const {container} = render(
                <ViewSharingModalWarning
                    initialTeams={fromJS([getTeam(1), getTeam(2)])}
                    initialUsers={fromJS([getUser(1)])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([getUser(1)])}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render one missing user', () => {
            const {container} = render(
                <ViewSharingModalWarning
                    initialTeams={fromJS([getTeam(1)])}
                    initialUsers={fromJS([getUser(1)])}
                    selectedTeams={fromJS([getTeam(1)])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render two missing users', () => {
            const {container} = render(
                <ViewSharingModalWarning
                    initialTeams={fromJS([getTeam(1)])}
                    initialUsers={fromJS([getUser(1), getUser(2)])}
                    selectedTeams={fromJS([getTeam(1)])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render one missing user and one missing team', () => {
            const {container} = render(
                <ViewSharingModalWarning
                    initialTeams={fromJS([getTeam(1)])}
                    initialUsers={fromJS([getUser(1)])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render two missing users and two missing teams', () => {
            const {container} = render(
                <ViewSharingModalWarning
                    initialTeams={fromJS([getTeam(1), getTeam(2)])}
                    initialUsers={fromJS([getUser(1), getUser(2)])}
                    selectedTeams={fromJS([])}
                    selectedUsers={fromJS([])}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
