import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import {JobType} from '@gorgias/api-queries'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {fromJS} from 'immutable'
import {TagDropdownMenu} from 'tags'

import {UserRole} from 'config/types/user'
import MoreActions from '../MoreActions'
import TeamAssigneeDropdownMenu from '../TeamAssigneeDropdownMenu'
import UserAssigneeDropdownMenu from '../UserAssigneeDropdownMenu'

jest.mock(
    'tags/TagDropdownMenu',
    () =>
        ({onClick}: ComponentProps<typeof TagDropdownMenu>) =>
            (
                <button onClick={() => onClick({name: 'tag'})}>
                    TagDropdownMenu
                </button>
            )
)
jest.mock(
    '../TeamAssigneeDropdownMenu',
    () =>
        ({onClick}: ComponentProps<typeof TeamAssigneeDropdownMenu>) =>
            (
                <button onClick={() => onClick({id: 8})}>
                    TeamAssigneeDropdownMenu
                </button>
            )
)
jest.mock(
    '../UserAssigneeDropdownMenu',
    () =>
        ({onClick}: ComponentProps<typeof UserAssigneeDropdownMenu>) =>
            (
                <button onClick={() => onClick({id: 3, name: 'user'})}>
                    UserAssigneeDropdownMenu
                </button>
            )
)

const mockStore = configureMockStore([thunk])

const defaultStore = {
    currentUser: fromJS({
        role: {name: UserRole.Agent},
    }),
    views: fromJS({}),
}

describe('<MoreActions />', () => {
    const minProps = {
        isDisabled: false,
        isLoading: false,
        launchJob: jest.fn(),
        selectionCount: null,
    }

    const renderWithStore = (
        props: ComponentProps<typeof MoreActions> = minProps,
        store = defaultStore
    ) =>
        render(
            <Provider store={mockStore(store)}>
                <MoreActions {...props} />
            </Provider>
        )

    it('should trigger a job for marking as unread tickets', () => {
        renderWithStore(minProps)
        screen.getByText('more_horiz').click()
        screen.getByText('Mark as unread').click()

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Mark as unread',
            }),
            {updates: {is_unread: true}}
        )
    })

    it('should trigger a job for marking as read tickets', () => {
        renderWithStore(minProps)
        screen.getByText('more_horiz').click()
        screen.getByText('Mark as read').click()

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Mark as read',
            }),
            {updates: {is_unread: false}}
        )
    })

    it('should trigger a job for exporting tickets', () => {
        renderWithStore(minProps)
        screen.getByText('more_horiz').click()
        screen.getByText('Export tickets').click()

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.ExportTicket,
                label: 'Export tickets',
            }),
            undefined
        )
    })

    it('should trigger a job for trashing tickets', () => {
        renderWithStore(minProps)
        screen.getByText('more_horiz').click()
        screen.getByText('Delete').click()
        screen.getByText('Confirm').click()

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Delete',
            }),
            {updates: {trashed_datetime: expect.any(String)}}
        )
    })

    it('should trigger a job for untrashing tickets', () => {
        renderWithStore(minProps, {
            ...defaultStore,
            views: fromJS({
                active: {
                    filters: 'isNotEmpty(ticket.trashed_datetime)',
                },
            }),
        })
        screen.getByText('more_horiz').click()
        screen.getByText('Undelete').click()

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Undelete',
            }),
            {updates: {trashed_datetime: null}}
        )
    })

    it('should trigger a job for deleting tickets', () => {
        renderWithStore(minProps, {
            ...defaultStore,
            views: fromJS({
                active: {
                    filters: 'isNotEmpty(ticket.trashed_datetime)',
                },
            }),
        })
        screen.getByText('more_horiz').click()
        screen.getByText('Delete forever').click()
        screen.getByText('Confirm').click()

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.DeleteTicket,
                label: 'Delete forever',
            }),
            undefined
        )
    })

    it('should disable bulk action buttons', () => {
        renderWithStore({
            ...minProps,
            isDisabled: true,
        })
        screen.getByText('more_horiz').click()
        expect(screen.queryByText('Mark as read')).not.toBeInTheDocument
    })

    it('should trigger a job for applying a tag', () => {
        renderWithStore()
        screen.getByText('more_horiz').click()
        screen.getByText('Add tag').click()
        expect(screen.getByText('arrow_back')).toBeInTheDocument
        screen.getByText('TagDropdownMenu').click()

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Add tag',
            }),
            {updates: {tags: ['tag']}}
        )
        expect(screen.queryByText('TagDropdownMenu')).not.toBeInTheDocument
        expect(screen.queryByText('Add tag')).not.toBeInTheDocument
    })

    it('should trigger a job for assigning a user', () => {
        const {getByText} = renderWithStore()
        getByText('more_horiz').click()
        getByText('Assign to').click()
        expect(screen.getByText('arrow_back')).toBeInTheDocument
        getByText('UserAssigneeDropdownMenu').click()

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Assign to',
            }),
            {updates: {assignee_user: {id: 3, name: 'user'}}}
        )
        expect(screen.queryByText('TagDropdownMenu')).not.toBeInTheDocument
        expect(screen.queryByText('Assign to')).not.toBeInTheDocument
    })

    it('should trigger a job for assigning a team', () => {
        renderWithStore()
        screen.getByText('more_horiz').click()
        screen.getByText('Assign to team').click()
        expect(screen.getByText('arrow_back')).toBeInTheDocument
        screen.getByText('TeamAssigneeDropdownMenu').click()

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Assign to team',
            }),
            {
                updates: {assignee_team_id: 8},
            }
        )
        expect(screen.queryByText('TagDropdownMenu')).not.toBeInTheDocument
        expect(screen.queryByText('Assign to team')).not.toBeInTheDocument
    })

    it('should not display the inaccessible actions for user below agent role', () => {
        renderWithStore(minProps, {
            ...defaultStore,
            currentUser: fromJS({
                role: {name: UserRole.BasicAgent},
            }),
        })
        screen.getByText('more_horiz').click()

        expect(screen.queryByText('Export tickets')).not.toBeInTheDocument
        expect(screen.queryByText('Delete')).not.toBeInTheDocument
    })

    it('should not display the inaccessible actions on trash-like view for user below agent role', () => {
        renderWithStore(minProps, {
            currentUser: fromJS({
                role: {name: UserRole.BasicAgent},
            }),
            views: fromJS({
                active: {
                    filters: 'isNotEmpty(ticket.trashed_datetime)',
                },
            }),
        })
        screen.getByText('more_horiz').click()

        expect(screen.queryByText('Undelete')).not.toBeInTheDocument
        expect(screen.queryByText('Delete forever')).not.toBeInTheDocument
    })

    it('should display singular noun', () => {
        renderWithStore({...minProps, selectionCount: 1})
        screen.getByText('more_horiz').click()
        screen.getByText('Delete').click()

        expect(
            screen.getByText('Are you sure you want to delete 1 ticket?')
        ).toBeInTheDocument()
    })

    it('should display plural noun', () => {
        renderWithStore(minProps)
        screen.getByText('more_horiz').click()
        screen.getByText('Delete').click()

        expect(
            screen.getByText('Are you sure you want to delete tickets?')
        ).toBeInTheDocument()
    })
})
