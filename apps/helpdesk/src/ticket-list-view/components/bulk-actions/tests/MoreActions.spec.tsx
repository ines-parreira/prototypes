import type { ComponentProps } from 'react'

import { useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { JobType } from '@gorgias/helpdesk-queries'

import { UserRole } from 'config/types/user'
import type { TagDropdownMenu } from 'tags'

import type ApplyMacro from '../ApplyMacro'
import MoreActions from '../MoreActions'
import type PriorityDropdownMenu from '../PriorityDropdownMenu'
import type TeamAssigneeDropdownMenu from '../TeamAssigneeDropdownMenu'

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

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
    '../PriorityDropdownMenu',
    () =>
        ({ onClick }: ComponentProps<typeof PriorityDropdownMenu>) => (
            <button onClick={() => onClick({ name: 'high' })}>
                PriorityDropdownMenuMock
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

    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    it('should trigger a job for marking as unread tickets', async () => {
        renderWithStore(minProps)
        await userEvent.click(screen.getByText('more_horiz'))
        await userEvent.click(screen.getByText('Mark as unread'))

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Mark as unread',
            }),
            { updates: { is_unread: true } },
            'mark_as_unread',
        )
    })

    it('should trigger a job for marking as read tickets', async () => {
        renderWithStore(minProps)
        await userEvent.click(screen.getByText('more_horiz'))
        await userEvent.click(screen.getByText('Mark as read'))

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Mark as read',
            }),
            { updates: { is_unread: false } },
            'mark_as_read',
        )
    })

    it('should trigger a job for exporting tickets', async () => {
        renderWithStore(minProps)
        await userEvent.click(screen.getByText('more_horiz'))
        await userEvent.click(screen.getByText('Export tickets'))

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.ExportTicket,
                label: 'Export tickets',
            }),
            undefined,
            'export_tickets',
        )
    })

    it('should trigger a job for trashing tickets', async () => {
        renderWithStore(minProps)
        await userEvent.click(screen.getByText('more_horiz'))
        await userEvent.click(screen.getByText('Delete'))
        await userEvent.click(screen.getByText('Confirm'))

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Delete',
            }),
            { updates: { trashed_datetime: expect.any(String) } },
        )
    })

    it('should trigger a job for untrashing tickets', async () => {
        renderWithStore(minProps, {
            ...defaultStore,
            views: fromJS({
                active: {
                    filters: 'isNotEmpty(ticket.trashed_datetime)',
                },
            }),
        })
        await userEvent.click(screen.getByText('more_horiz'))
        await userEvent.click(screen.getByText('Undelete'))

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Undelete',
            }),
            { updates: { trashed_datetime: null } },
            'untrash',
        )
    })

    it('should trigger a job for deleting tickets', async () => {
        renderWithStore(minProps, {
            ...defaultStore,
            views: fromJS({
                active: {
                    filters: 'isNotEmpty(ticket.trashed_datetime)',
                },
            }),
        })
        await userEvent.click(screen.getByText('more_horiz'))
        await userEvent.click(screen.getByText('Delete forever'))
        await userEvent.click(screen.getByText('Confirm'))

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.DeleteTicket,
                label: 'Delete forever',
            }),
            undefined,
        )
    })

    it('should disable bulk action buttons', async () => {
        renderWithStore({
            ...minProps,
            isDisabled: true,
        })
        await userEvent.click(screen.getByText('more_horiz'))
        expect(screen.queryByText('Mark as read')).not.toBeInTheDocument
    })

    it('should trigger a job for applying a tag', async () => {
        renderWithStore()
        await userEvent.click(screen.getByText('more_horiz'))
        await userEvent.click(screen.getByText('Add tag'))
        expect(screen.getByText('arrow_back')).toBeInTheDocument
        await userEvent.click(screen.getByText('TagDropdownMenuMock'))

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

    it('should trigger a job for applying a macro', async () => {
        renderWithStore()
        await userEvent.click(screen.getByText('more_horiz'))
        await userEvent.click(screen.getByText('Apply macro'))
        await userEvent.click(screen.getByText('ApplyMacroMock'))

        expect(minProps.onComplete).toHaveBeenCalledWith()
        expect(logEventMock).toHaveBeenCalledWith(SegmentEvent.BulkAction, {
            type: 'apply-macro',
            location: 'split-view-mode',
        })

        expect(screen.queryByText('ApplyMacroMock')).not.toBeInTheDocument
        expect(screen.queryByText('Apply macro')).not.toBeInTheDocument
    })

    it('should trigger a job for assigning a team', async () => {
        renderWithStore()
        await userEvent.click(screen.getByText('more_horiz'))
        await userEvent.click(screen.getByText('Assign to team'))
        expect(screen.getByText('arrow_back')).toBeInTheDocument
        await userEvent.click(screen.getByText('TeamAssigneeDropdownMenuMock'))

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

    it('should trigger a job for changing priority when feature flag is enabled', async () => {
        useFlagMock.mockReturnValue(true)
        renderWithStore()
        await userEvent.click(screen.getByText('more_horiz'))
        await userEvent.click(screen.getByText('Change priority'))
        expect(screen.getByText('arrow_back')).toBeInTheDocument
        await userEvent.click(screen.getByText('PriorityDropdownMenuMock'))

        expect(minProps.launchJob).toHaveBeenCalledWith(
            expect.objectContaining({
                type: JobType.UpdateTicket,
                label: 'Change priority',
            }),
            { updates: { priority: 'high' } },
            'priority',
        )
        expect(screen.queryByText('PriorityDropdownMenuMock')).not
            .toBeInTheDocument
        expect(screen.queryByText('Change priority')).not.toBeInTheDocument
    })

    it('should not show priority option when feature flag is disabled', async () => {
        useFlagMock.mockReturnValue(false)
        renderWithStore()
        await userEvent.click(screen.getByText('more_horiz'))

        expect(screen.queryByText('Change priority')).not.toBeInTheDocument
    })

    it('should not display the inaccessible actions for user below agent role', async () => {
        renderWithStore(minProps, {
            ...defaultStore,
            currentUser: fromJS({
                role: { name: UserRole.BasicAgent },
            }),
        })
        await userEvent.click(screen.getByText('more_horiz'))

        expect(screen.queryByText('Export tickets')).not.toBeInTheDocument
        expect(screen.queryByText('Delete')).not.toBeInTheDocument
    })

    it('should not display the inaccessible actions on trash-like view for user below agent role', async () => {
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
        await userEvent.click(screen.getByText('more_horiz'))

        expect(screen.queryByText('Undelete')).not.toBeInTheDocument
        expect(screen.queryByText('Delete forever')).not.toBeInTheDocument
    })

    it('should display singular noun', async () => {
        renderWithStore({ ...minProps, selectionCount: 1 })
        await userEvent.click(screen.getByText('more_horiz'))
        await userEvent.click(screen.getByText('Delete'))

        expect(
            screen.getByText('Are you sure you want to delete 1 ticket?'),
        ).toBeInTheDocument()
    })

    it('should display plural noun', async () => {
        renderWithStore(minProps)
        await userEvent.click(screen.getByText('more_horiz'))
        await userEvent.click(screen.getByText('Delete'))

        expect(
            screen.getByText('Are you sure you want to delete tickets?'),
        ).toBeInTheDocument()
    })
})
