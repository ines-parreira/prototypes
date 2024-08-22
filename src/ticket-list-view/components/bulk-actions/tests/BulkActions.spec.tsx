import React, {ComponentProps} from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {JobType} from '@gorgias/api-queries'

import {useBulkAction} from 'jobs'
import {TagDropdownMenu} from 'tags'
import {assumeMock} from 'utils/testing'

import ApplyMacro from '../ApplyMacro'
import BulkActions from '../BulkActions'
import CloseTickets from '../CloseTickets'
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

describe('<BulkActions />', () => {
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
        const {getByText} = render(<BulkActions {...minProps} />)
        getByText('CloseTickets').click()

        await waitFor(() => expect(minProps.onComplete).toHaveBeenCalled())
    })

    it('should clear selected tickets once `apply macro` bulk action is applied', () => {
        const {getByText} = render(<BulkActions {...minProps} />)
        getByText('ApplyMacro').click()

        expect(minProps.onComplete).toHaveBeenCalled()
    })

    it('should prepare job at view level', () => {
        const {getByText} = render(<BulkActions {...minProps} />)
        getByText('CloseTickets').click()

        expect(useBulkActionMock).toHaveBeenCalledWith('view', [])
    })

    it('should prepare job at ticket level', () => {
        const {getByText} = render(
            <BulkActions
                {...minProps}
                hasSelectedAll={false}
                selectedTickets={{
                    1: true,
                    2: false,
                }}
            />
        )
        getByText('CloseTickets').click()

        expect(useBulkActionMock).toHaveBeenCalledWith('ticket', [1])
    })

    it('should trigger a job for marking as unread tickets', () => {
        const {getByText} = render(<BulkActions {...minProps} />)
        getByText('more_horiz').click()
        screen.queryByText('Mark as unread')?.click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {is_unread: true},
        })
    })

    it('should trigger a job for marking as read tickets', () => {
        const {getByText} = render(<BulkActions {...minProps} />)
        getByText('more_horiz').click()
        screen.queryByText('Mark as read')?.click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {is_unread: false},
        })
    })

    it('should trigger a job for exporting tickets', () => {
        const {getByText} = render(<BulkActions {...minProps} />)
        getByText('more_horiz').click()
        screen.queryByText('Export tickets')?.click()

        expect(mockCreateJob).toHaveBeenCalledWith(
            JobType.ExportTicket,
            undefined
        )
    })

    it('should trigger a job for deleting tickets', () => {
        const {getByText} = render(<BulkActions {...minProps} />)
        getByText('more_horiz').click()
        screen.queryByText('Delete')?.click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {trashed_datetime: expect.any(String)},
        })
    })

    it('should disable bulk action buttons', () => {
        const {getByText} = render(
            <BulkActions {...minProps} hasSelectedAll={false} />
        )
        getByText('more_horiz').click()
        expect(screen.queryByText('Mark as read')).not.toBeInTheDocument

        getByText('CloseTickets').click()
        expect(mockCreateJob).not.toHaveBeenCalled()
    })

    it('should trigger a job for applying a tag', () => {
        const {getByText} = render(<BulkActions {...minProps} />)
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
        const {getByText} = render(<BulkActions {...minProps} />)
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
})
