import React from 'react'
import {render, waitFor} from '@testing-library/react'
import {JobType} from '@gorgias/api-queries'
import {fromJS} from 'immutable'

import {useBulkAction} from 'jobs'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {assumeMock} from 'utils/testing'

import BulkActions from '../BulkActions'

jest.mock('jobs/useBulkAction')
const mockCreateJob = jest.fn()
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

const useBulkActionMock = assumeMock(useBulkAction)

describe('<BulkActions />', () => {
    const minProps = {selectedTickets: {}, clearSelection: jest.fn()}

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(mockedDispatch)
        useBulkActionMock.mockReturnValue({
            createJob: mockCreateJob,
            isLoading: false,
        })
    })

    it('should render', () => {
        const {getByText} = render(<BulkActions {...minProps} />)

        expect(getByText('check_circle')).toBeInTheDocument()
    })

    it('should create job at view level', () => {
        useAppSelectorMock.mockReturnValue(fromJS({}))

        const {getByText} = render(<BulkActions {...minProps} />)
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
        useAppSelectorMock.mockReturnValue(fromJS({}))

        const {getByText} = render(
            <BulkActions {...minProps} selectedTickets={{1: true, 2: false}} />
        )
        getByText('check_circle').click()

        expect(useBulkActionMock).toHaveBeenCalledWith({
            jobType: JobType.UpdateTicket,
            level: 'ticket',
            params: {
                updates: {status: 'closed'},
            },
            ticketIds: [1],
        })
    })

    it('should clear selected tickets after bulk action', async () => {
        useAppSelectorMock.mockReturnValue(fromJS({}))

        const {getByText} = render(<BulkActions {...minProps} />)
        getByText('check_circle').click()

        await waitFor(() => expect(minProps.clearSelection).toHaveBeenCalled())
    })
})
