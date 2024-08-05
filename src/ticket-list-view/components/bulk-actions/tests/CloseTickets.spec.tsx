import React from 'react'
import {render, waitFor} from '@testing-library/react'
import {JobType} from '@gorgias/api-queries'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {view} from 'fixtures/views'
import {useBulkAction} from 'jobs'
import {RootState} from 'state/types'
import {assumeMock} from 'utils/testing'

import CloseTickets from '../CloseTickets'

const mockStore = configureMockStore([thunk])

const mockCreateJob = jest.fn()
jest.mock('jobs/useBulkAction')
const useBulkActionMock = assumeMock(useBulkAction)

describe('<CloseTickets />', () => {
    const minProps = {
        onComplete: jest.fn(),
        ticketIds: [],
    }
    const defaultState: Partial<RootState> = {
        views: fromJS({
            active: view,
            items: [view],
        }),
    }

    beforeEach(() => {
        useBulkActionMock.mockReturnValue({
            createJob: mockCreateJob,
            isLoading: false,
        })
    })

    it('should render', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <CloseTickets {...minProps} />
            </Provider>
        )

        expect(getByText('check_circle')).toBeInTheDocument()
    })

    it('should create job at view level', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <CloseTickets {...minProps} />
            </Provider>
        )
        getByText('check_circle').click()

        expect(useBulkActionMock).toHaveBeenCalledWith({
            jobType: JobType.UpdateTicket,
            level: 'view',
            params: {
                updates: {status: 'closed'},
            },
            ticketIds: [],
        })
    })

    it('should create job at ticket level', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <CloseTickets {...minProps} ticketIds={[1, 2]} />
            </Provider>
        )
        getByText('check_circle').click()

        expect(useBulkActionMock).toHaveBeenCalledWith({
            jobType: JobType.UpdateTicket,
            level: 'ticket',
            params: {
                updates: {status: 'closed'},
            },
            ticketIds: [1, 2],
        })
    })

    it('should clear selected tickets once `close ticket` bulk action is applied', async () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <CloseTickets {...minProps} />
            </Provider>
        )
        getByText('check_circle').click()

        await waitFor(() => expect(minProps.onComplete).toHaveBeenCalled())
    })
})
