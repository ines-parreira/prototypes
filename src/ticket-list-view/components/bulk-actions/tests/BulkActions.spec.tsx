import React, { ComponentProps } from 'react'

import { render, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { JobType } from '@gorgias/api-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { UserRole } from 'config/types/user'
import { useBulkAction } from 'jobs'
import { assumeMock } from 'utils/testing'

import AssignUser from '../AssignUser'
import BulkActions from '../BulkActions'
import CloseTickets from '../CloseTickets'
import MoreActions from '../MoreActions'

jest.mock('common/segment')
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
        const { getByText } = renderWithStore({
            ...minProps,
            hasSelectedAll: false,
        })

        getByText('CloseTicketsMock').click()
        expect(mockCreateJob).not.toHaveBeenCalled()
    })

    it('should trigger bulk action to close tickets', async () => {
        const { getByText } = renderWithStore()
        getByText('CloseTicketsMock').click()

        expect(mockCreateJob).toHaveBeenCalled()
        await waitFor(() => expect(minProps.onComplete).toHaveBeenCalled())
    })

    it('should trigger bulk action to assign user', async () => {
        const { getByText } = renderWithStore()
        getByText('AssignUserMock').click()

        await waitFor(() => expect(minProps.onComplete).toHaveBeenCalled())
    })

    it('should prepare job at view level', () => {
        const { getByText } = renderWithStore()
        getByText('CloseTicketsMock').click()

        expect(useBulkActionMock).toHaveBeenCalledWith('view', [])
    })

    it('should prepare job at ticket level', () => {
        const { getByText } = renderWithStore({
            ...minProps,
            hasSelectedAll: false,
            selectedTickets: {
                1: true,
                2: false,
            },
        })
        getByText('CloseTicketsMock').click()

        expect(useBulkActionMock).toHaveBeenCalledWith('ticket', [1])
    })

    it('should trigger job when MoreActions calls it', async () => {
        const { getByText } = renderWithStore()
        getByText('MoreActionsMock').click()

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
})
