import type { ComponentProps } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { JobType } from '@gorgias/helpdesk-queries'

import { UserRole } from 'config/types/user'
import { useBulkAction } from 'jobs'

import type AssignUser from '../AssignUser'
import BulkActions from '../BulkActions'
import type CloseTickets from '../CloseTickets'
import type MoreActions from '../MoreActions'

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

jest.mock(
    '../AssignUser',
    () =>
        ({ onClick }: ComponentProps<typeof AssignUser>) => (
            <button onClick={onClick}>AssignUserMock</button>
        ),
)
jest.mock(
    '../CloseTickets',
    () =>
        ({ isDisabled, onClick }: ComponentProps<typeof CloseTickets>) => (
            <button disabled={isDisabled} onClick={onClick}>
                CloseTicketsMock
            </button>
        ),
)
const mockJobType = JobType.DeleteTicket
jest.mock(
    '../MoreActions',
    () =>
        ({ isDisabled, launchJob }: ComponentProps<typeof MoreActions>) => (
            <button
                disabled={isDisabled}
                onClick={() =>
                    launchJob({
                        label: 'Delete',
                        type: mockJobType,
                        event: 'delete',
                    })
                }
            >
                MoreActionsMock
            </button>
        ),
)

const mockCreateJob = jest.fn()
jest.mock('jobs/useBulkAction')
const useBulkActionMock = assumeMock(useBulkAction)

const mockStore = configureMockStore([thunk])

const defaultStore = {
    currentUser: fromJS({
        role: { name: UserRole.Agent },
    }),
    views: fromJS({}),
}

describe('<BulkActions />', () => {
    const minProps = {
        hasSelectedAll: true,
        onComplete: jest.fn(),
        selectedTickets: {},
        selectionCount: null,
    }

    const renderWithStore = (
        props: ComponentProps<typeof BulkActions> = minProps,
        store = defaultStore,
    ) =>
        render(
            <Provider store={mockStore(store)}>
                <BulkActions {...props} />
            </Provider>,
        )

    beforeEach(() => {
        useBulkActionMock.mockReturnValue({
            createJob: mockCreateJob,
            isLoading: false,
        })
    })

    it('should disable bulk action buttons', () => {
        renderWithStore({
            ...minProps,
            hasSelectedAll: false,
        })

        screen.getByText('CloseTicketsMock').click()
        expect(mockCreateJob).not.toHaveBeenCalled()
    })

    it('should trigger bulk action to close tickets', async () => {
        renderWithStore()
        screen.getByText('CloseTicketsMock').click()

        expect(mockCreateJob).toHaveBeenCalled()
        await waitFor(() => expect(minProps.onComplete).toHaveBeenCalled())
    })

    it('should trigger bulk action to assign user', async () => {
        renderWithStore()
        screen.getByText('AssignUserMock').click()

        await waitFor(() => expect(minProps.onComplete).toHaveBeenCalled())
    })

    it('should prepare job at view level', () => {
        renderWithStore()
        screen.getByText('CloseTicketsMock').click()

        expect(useBulkActionMock).toHaveBeenCalledWith('view', [])
    })

    it('should prepare job at ticket level', () => {
        renderWithStore({
            ...minProps,
            hasSelectedAll: false,
            selectedTickets: {
                1: true,
                2: false,
            },
        })
        screen.getByText('CloseTicketsMock').click()

        expect(useBulkActionMock).toHaveBeenCalledWith('ticket', [1])
    })

    it('should trigger job when MoreActions calls it', async () => {
        renderWithStore()
        screen.getByText('MoreActionsMock').click()

        await waitFor(() =>
            expect(mockCreateJob).toHaveBeenCalledWith(mockJobType, undefined),
        )
        await waitFor(() =>
            expect(logEventMock).toHaveBeenCalledWith(SegmentEvent.BulkAction, {
                type: 'delete',
                location: 'split-view-mode',
            }),
        )
    })

    it('should handle priority updates through launchJob', async () => {
        renderWithStore()

        // Simulate a priority update job
        const priorityJob = {
            type: JobType.UpdateTicket,
            event: 'priority',
        }
        const priorityParams = {
            updates: { priority: 'high' },
        }

        // This would be called by MoreActions when priority is selected
        const launchJob = (job: any, params?: any, action?: any) => {
            mockCreateJob(job.type!, params)
            logEvent(SegmentEvent.BulkAction, {
                type: job.event,
                location: 'split-view-mode',
                value: params?.updates?.priority,
            })
            minProps.onComplete(action)
        }

        launchJob(priorityJob, priorityParams, 'priority')

        expect(mockCreateJob).toHaveBeenCalledWith(
            JobType.UpdateTicket,
            priorityParams,
        )
        expect(logEventMock).toHaveBeenCalledWith(SegmentEvent.BulkAction, {
            type: 'priority',
            location: 'split-view-mode',
            value: 'high',
        })
        expect(minProps.onComplete).toHaveBeenCalledWith('priority')
    })
})
