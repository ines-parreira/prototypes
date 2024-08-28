import React, {ComponentProps} from 'react'
import {render, waitFor} from '@testing-library/react'
import {JobType} from '@gorgias/api-queries'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {UserRole} from 'config/types/user'
import {useBulkAction} from 'jobs'
import {assumeMock} from 'utils/testing'

import ApplyMacro from '../ApplyMacro'
import BulkActions from '../BulkActions'
import CloseTickets from '../CloseTickets'
import MoreActions from '../MoreActions'

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
const mockJobType = JobType.DeleteTicket
jest.mock(
    '../MoreActions',
    () =>
        ({isDisabled, launchJob}: ComponentProps<typeof MoreActions>) =>
            (
                <button
                    disabled={isDisabled}
                    onClick={() => launchJob(mockJobType)}
                >
                    MoreActions
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
    const minProps = {
        hasSelectedAll: true,
        onComplete: jest.fn(),
        selectedTickets: {},
        selectionCount: null,
    }

    const renderWithStore = (
        props: ComponentProps<typeof BulkActions> = minProps,
        store = defaultStore
    ) =>
        render(
            <Provider store={mockStore(store)}>
                <BulkActions {...props} />
            </Provider>
        )

    beforeEach(() => {
        useBulkActionMock.mockReturnValue({
            createJob: mockCreateJob,
            isLoading: false,
        })
    })

    it('should disable bulk action buttons', () => {
        const {getByText} = renderWithStore({
            ...minProps,
            hasSelectedAll: false,
        })

        getByText('CloseTickets').click()
        expect(mockCreateJob).not.toHaveBeenCalled()
    })

    it('should trigger bulk action to close tickets', async () => {
        const {getByText} = renderWithStore()
        getByText('CloseTickets').click()

        expect(mockCreateJob).toHaveBeenCalled()
        await waitFor(() => expect(minProps.onComplete).toHaveBeenCalled())
    })

    it('should trigger bulk action to apply macro', () => {
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

    it('should trigger job when MoreActions calls it', async () => {
        const {getByText} = renderWithStore()
        getByText('MoreActions').click()

        await waitFor(() =>
            expect(mockCreateJob).toHaveBeenCalledWith(mockJobType, undefined)
        )
    })
})
