import React, {ComponentProps} from 'react'
import {getQueriesForElement, render, waitFor} from '@testing-library/react'
import {JobType} from '@gorgias/api-queries'
import {fromJS} from 'immutable'

import {useBulkAction} from 'jobs'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {assumeMock} from 'utils/testing'

import ApplyMacro from '../ApplyMacro'
import BulkActions from '../BulkActions'
import CloseTickets from '../CloseTickets'

jest.mock(
    '../ApplyMacro',
    () =>
        ({onComplete}: ComponentProps<typeof ApplyMacro>) =>
            <div onClick={onComplete}>ApplyMacro</div>
)
jest.mock(
    '../CloseTickets',
    () =>
        ({isDisabled, onClick}: ComponentProps<typeof CloseTickets>) =>
            (
                <div onClick={onClick}>
                    CloseTickets
                    {isDisabled}
                </div>
            )
)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

const mockCreateJob = jest.fn()
jest.mock('jobs/useBulkAction')
const useBulkActionMock = assumeMock(useBulkAction)

describe('<BulkActions />', () => {
    const minProps = {
        onComplete: jest.fn(),
        selectedTickets: {},
    }

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(mockedDispatch)
        useAppSelectorMock.mockReturnValue(fromJS({}))
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
        useAppSelectorMock.mockReturnValue(fromJS({}))

        const {getByText, baseElement} = render(<BulkActions {...minProps} />)
        getByText('more_horiz').click()
        getQueriesForElement(baseElement).getByText('Mark as unread').click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {is_unread: true},
        })
    })

    it('should trigger a job for marking as read tickets', () => {
        useAppSelectorMock.mockReturnValue(fromJS({}))

        const {getByText, baseElement} = render(<BulkActions {...minProps} />)
        getByText('more_horiz').click()
        getQueriesForElement(baseElement).getByText('Mark as read').click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {is_unread: false},
        })
    })

    it('should trigger a job for exporting tickets', () => {
        useAppSelectorMock.mockReturnValue(fromJS({}))

        const {getByText, baseElement} = render(<BulkActions {...minProps} />)
        getByText('more_horiz').click()
        getQueriesForElement(baseElement).getByText('Export tickets').click()

        expect(mockCreateJob).toHaveBeenCalledWith(
            JobType.ExportTicket,
            undefined
        )
    })

    it('should trigger a job for deleting tickets', () => {
        useAppSelectorMock.mockReturnValue(fromJS({}))

        const {getByText, baseElement} = render(<BulkActions {...minProps} />)
        getByText('more_horiz').click()
        getQueriesForElement(baseElement).getByText('Delete').click()

        expect(mockCreateJob).toHaveBeenCalledWith(JobType.UpdateTicket, {
            updates: {trashed_datetime: expect.any(String)},
        })
    })
})
