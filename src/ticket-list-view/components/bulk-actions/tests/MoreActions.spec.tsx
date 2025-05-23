import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { JobType } from '@gorgias/helpdesk-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { UserRole } from 'config/types/user'
import { TagDropdownMenu } from 'tags'
import { assumeMock } from 'utils/testing'

import ApplyMacro from '../ApplyMacro'
import MoreActions from '../MoreActions'
import TeamAssigneeDropdownMenu from '../TeamAssigneeDropdownMenu'

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

jest.mock(
    'tags/TagDropdownMenu',
    () =>
        ({ onClick }: ComponentProps<typeof TagDropdownMenu>) => (
            <button onClick={() => onClick({ name: 'tag' })}>
                TagDropdownMenuMock
            </button>
        ),
)
jest.mock(
    '../TeamAssigneeDropdownMenu',
    () =>
        ({ onClick }: ComponentProps<typeof TeamAssigneeDropdownMenu>) => (
            <button onClick={() => onClick({ id: 8 })}>
                TeamAssigneeDropdownMenuMock
            </button>
        ),
)
jest.mock(
    '../ApplyMacro',
    () =>
        ({ onApplyMacro }: ComponentProps<typeof ApplyMacro>) => (
            <button onClick={() => onApplyMacro()}>ApplyMacroMock</button>
        ),
)

const mockStore = configureMockStore([thunk])

const defaultStore = {
    currentUser: fromJS({
        role: { name: UserRole.Agent },
    }),
    views: fromJS({}),
}

describe('<MoreActions />', () => {
    const minProps = {
        isDisabled: false,
        isLoading: false,
        launchJob: jest.fn(),
        onComplete: jest.fn(),
        selectionCount: null,
        ticketIds: [],
    }

    const renderWithStore = (
        props: ComponentProps<typeof MoreActions> = minProps,
        store = defaultStore,
    ) =>
        render(
            <Provider store={mockStore(store)}>
                <MoreActions {...props} />
            </Provider>,
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
            { updates: { is_unread: true } },
            'mark_as_unread',
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
            { updates: { is_unread: false } },
            'mark_as_read',
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
            undefined,
            'export_tickets',
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
            { updates: { trashed_datetime: expect.any(String) } },
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
            { updates: { trashed_datetime: null } },
            'untrash',
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
            undefined,
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
        screen.getByText('TagDropdownMenuMock').click()

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Add tag',
            }),
            { updates: { tags: ['tag'] } },
            'tag',
        )
        expect(screen.queryByText('TagDropdownMenuMock')).not.toBeInTheDocument
        expect(screen.queryByText('Add tag')).not.toBeInTheDocument
    })

    it('should trigger a job for applying a macro', () => {
        renderWithStore()
        screen.getByText('more_horiz').click()
        screen.getByText('Apply macro').click()
        screen.getByText('ApplyMacroMock').click()

        expect(minProps.onComplete).toHaveBeenCalledWith()
        expect(logEventMock).toHaveBeenCalledWith(SegmentEvent.BulkAction, {
            type: 'apply-macro',
            location: 'split-view-mode',
        })

        expect(screen.queryByText('ApplyMacroMock')).not.toBeInTheDocument
        expect(screen.queryByText('Apply macro')).not.toBeInTheDocument
    })

    it('should trigger a job for assigning a team', () => {
        renderWithStore()
        screen.getByText('more_horiz').click()
        screen.getByText('Assign to team').click()
        expect(screen.getByText('arrow_back')).toBeInTheDocument
        screen.getByText('TeamAssigneeDropdownMenuMock').click()

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Assign to team',
            }),
            {
                updates: { assignee_team_id: 8 },
            },
            'team',
        )
        expect(screen.queryByText('TagDropdownMenuMock')).not.toBeInTheDocument
        expect(screen.queryByText('Assign to team')).not.toBeInTheDocument
    })

    it('should not display the inaccessible actions for user below agent role', () => {
        renderWithStore(minProps, {
            ...defaultStore,
            currentUser: fromJS({
                role: { name: UserRole.BasicAgent },
            }),
        })
        screen.getByText('more_horiz').click()

        expect(screen.queryByText('Export tickets')).not.toBeInTheDocument
        expect(screen.queryByText('Delete')).not.toBeInTheDocument
    })

    it('should not display the inaccessible actions on trash-like view for user below agent role', () => {
        renderWithStore(minProps, {
            currentUser: fromJS({
                role: { name: UserRole.BasicAgent },
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
        renderWithStore({ ...minProps, selectionCount: 1 })
        screen.getByText('more_horiz').click()
        screen.getByText('Delete').click()

        expect(
            screen.getByText('Are you sure you want to delete 1 ticket?'),
        ).toBeInTheDocument()
    })

    it('should display plural noun', () => {
        renderWithStore(minProps)
        screen.getByText('more_horiz').click()
        screen.getByText('Delete').click()

        expect(
            screen.getByText('Are you sure you want to delete tickets?'),
        ).toBeInTheDocument()
    })
})
