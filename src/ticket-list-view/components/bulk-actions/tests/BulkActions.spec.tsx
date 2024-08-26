import React, {ComponentProps} from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {JobType} from '@gorgias/api-queries'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {fromJS} from 'immutable'
import {useBulkAction} from 'jobs'
import {TagDropdownMenu} from 'tags'
import {assumeMock} from 'utils/testing'

import {UserRole} from 'config/types/user'
import ApplyMacro from '../ApplyMacro'
import BulkActions from '../BulkActions'
import CloseTickets from '../CloseTickets'
import TeamAssigneeDropdownMenu from '../TeamAssigneeDropdownMenu'
import UserAssigneeDropdownMenu from '../UserAssigneeDropdownMenu'

jest.mock(
    '../ApplyMacro',
    () =>
        ({isDisabled, onComplete}: ComponentProps<typeof ApplyMacro>) =>
            (
                <button disabled={isDisabled} onClick={onComplete}>
                    ApplyMacro
                </button>
            )
)
jest.mock(
    '../CloseTickets',
    () =>
        ({isDisabled, onClick}: ComponentProps<typeof CloseTickets>) =>
            (
                <button disabled={isDisabled} onClick={onClick}>
                    CloseTickets
                </button>
            )
)
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

const mockCreateJob = jest.fn()
jest.mock('jobs/useBulkAction')
const useBulkActionMock = assumeMock(useBulkAction)

const mockStore = configureMockStore([thunk])

const defaultStore = {
    currentUser: fromJS({
        role: {name: UserRole.Agent},
    }),
    views: fromJS({}),
}

describe('<BulkActions />', () => {
    const renderWithStore = (
        props: ComponentProps<typeof BulkActions> = minProps,
        store = defaultStore
    ) =>
        render(
            <Provider store={mockStore(store)}>
                <BulkActions {...props} />
            </Provider>
        )

    const minProps = {
        hasSelectedAll: true,
        onComplete: jest.fn(),
        selectedTickets: {},
    }

    beforeEach(() => {
        useBulkActionMock.mockReturnValue({
            createJob: mockCreateJob,
            isLoading: false,
        })
    })

    it('should clear selected tickets once `close ticket` bulk action is applied', async () => {
        const {getByText} = renderWithStore()
        getByText('CloseTickets').click()

        await waitFor(() => expect(minProps.onComplete).toHaveBeenCalled())
    })

    it('should clear selected tickets once `apply macro` bulk action is applied', () => {
        const {getByText} = renderWithStore()
        getByText('ApplyMacro').click()

        expect(minProps.onComplete).toHaveBeenCalled()
    })

    it('should prepare job at view level', () => {
        const {getByText} = renderWithStore()
        getByText('CloseTickets').click()

        expect(useBulkActionMock).toHaveBeenCalledWith('view', [])
    })

    it('should prepare job at ticket level', () => {
        const {getByText} = renderWithStore({
            ...minProps,
            hasSelectedAll: false,
            selectedTickets: {
                1: true,
                2: false,
            },
        })
        getByText('CloseTickets').click()

        expect(useBulkActionMock).toHaveBeenCalledWith('ticket', [1])
    })

    it('should trigger a job for marking as unread tickets', () => {
        const {getByText} = renderWithStore(minProps)
        getByText('more_horiz').click()
        screen.queryByText('Mark as unread')?.click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {is_unread: true},
        })
    })

    it('should trigger a job for marking as read tickets', () => {
        const {getByText} = renderWithStore(minProps)
        getByText('more_horiz').click()
        screen.queryByText('Mark as read')?.click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {is_unread: false},
        })
    })

    it('should trigger a job for exporting tickets', () => {
        const {getByText} = renderWithStore(minProps)
        getByText('more_horiz').click()
        screen.queryByText('Export tickets')?.click()

        expect(mockCreateJob).toHaveBeenCalledWith(
            JobType.ExportTicket,
            undefined
        )
    })

    it('should trigger a job for trashing tickets', () => {
        const {getByText} = renderWithStore(minProps)
        getByText('more_horiz').click()
        screen.queryByText('Delete')?.click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {trashed_datetime: expect.any(String)},
        })
    })

    it('should trigger a job for untrashing tickets', () => {
        const {getByText} = renderWithStore(minProps, {
            ...defaultStore,
            views: fromJS({
                active: {
                    filters: 'isNotEmpty(ticket.trashed_datetime)',
                },
            }),
        })
        getByText('more_horiz').click()
        screen.queryByText('Undelete')?.click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {
                trashed_datetime: null,
            },
        })
    })

    it('should trigger a job for deleting tickets', () => {
        const {getByText} = renderWithStore(minProps, {
            ...defaultStore,
            views: fromJS({
                active: {
                    filters: 'isNotEmpty(ticket.trashed_datetime)',
                },
            }),
        })
        getByText('more_horiz').click()
        screen.queryByText('Delete forever')?.click()

        expect(mockCreateJob).toHaveBeenCalledWith(
            JobType.DeleteTicket,
            undefined
        )
    })

    it('should disable bulk action buttons', () => {
        const {getByText} = renderWithStore({
            ...minProps,
            hasSelectedAll: false,
        })
        getByText('more_horiz').click()
        expect(screen.queryByText('Mark as read')).not.toBeInTheDocument

        getByText('CloseTickets').click()
        expect(mockCreateJob).not.toHaveBeenCalled()
    })

    it('should trigger a job for applying a tag', () => {
        const {getByText} = renderWithStore()
        getByText('more_horiz').click()
        getByText('Add tag').click()
        expect(screen.getByText('arrow_back')).toBeInTheDocument
        getByText('TagDropdownMenu').click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {tags: ['tag']},
        })
        expect(screen.queryByText('TagDropdownMenu')).not.toBeInTheDocument
        expect(screen.queryByText('Add tag')).not.toBeInTheDocument
    })

    it('should trigger a job for assigning a user', () => {
        const {getByText} = renderWithStore()
        getByText('more_horiz').click()
        getByText('Assign to').click()
        expect(screen.getByText('arrow_back')).toBeInTheDocument
        getByText('UserAssigneeDropdownMenu').click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {assignee_user: {id: 3, name: 'user'}},
        })
        expect(screen.queryByText('TagDropdownMenu')).not.toBeInTheDocument
        expect(screen.queryByText('Assign to')).not.toBeInTheDocument
    })

    it('should trigger a job for assigning a team', () => {
        const {getByText} = renderWithStore()
        getByText('more_horiz').click()
        getByText('Assign to team').click()
        expect(screen.getByText('arrow_back')).toBeInTheDocument
        getByText('TeamAssigneeDropdownMenu').click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {assignee_team_id: 8},
        })
        expect(screen.queryByText('TagDropdownMenu')).not.toBeInTheDocument
        expect(screen.queryByText('Assign to team')).not.toBeInTheDocument
    })

    it('should not display the inaccessible actions for user below agent role', () => {
        const {getByText} = renderWithStore(minProps, {
            ...defaultStore,
            currentUser: fromJS({
                role: {name: UserRole.BasicAgent},
            }),
        })
        getByText('more_horiz').click()

        expect(screen.queryByText('Export tickets')).not.toBeInTheDocument
        expect(screen.queryByText('Delete')).not.toBeInTheDocument
    })

    it('should not display the inaccessible actions on trash-like view for user below agent role', () => {
        const {getByText} = renderWithStore(minProps, {
            currentUser: fromJS({
                role: {name: UserRole.BasicAgent},
            }),
            views: fromJS({
                active: {
                    filters: 'isNotEmpty(ticket.trashed_datetime)',
                },
            }),
        })
        getByText('more_horiz').click()

        expect(screen.queryByText('Undelete')).not.toBeInTheDocument
        expect(screen.queryByText('Delete forever')).not.toBeInTheDocument
    })
})
