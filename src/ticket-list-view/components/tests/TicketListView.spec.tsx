import {render} from '@testing-library/react'
import React from 'react'
import {UseInfiniteQueryResult} from '@tanstack/react-query'
import {AxiosResponse} from 'axios'

import {ticket} from 'fixtures/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {Ticket} from 'models/ticket/types'
import {useGetViewItems} from 'models/view/queries'
import {assumeMock} from 'utils/testing'

import TicketListView from '../TicketListView'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('pages/common/components/SkeletonLoader', () => () => {
    return <div>Loader</div>
})

const response = {
    isInitialLoading: false,
    data: {pages: [{data: {data: [ticket]}}]},
} as unknown as UseInfiniteQueryResult<
    AxiosResponse<ApiListResponseCursorPagination<Ticket[]>>,
    unknown
>

jest.mock('models/view/queries')
const useGetViewItemsMock = assumeMock(useGetViewItems)

describe('<TicketListView />', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue({
            name: 'view name',
        })
    })

    it('should display a list of tickets', () => {
        useGetViewItemsMock.mockReturnValue(response)
        const {getByText} = render(<TicketListView viewId="1" />)

        expect(getByText(ticket.subject)).toBeInTheDocument()
        expect(getByText('view name')).toBeInTheDocument()
    })

    it('should display a loader', () => {
        useGetViewItemsMock.mockReturnValue({
            ...response,
            isInitialLoading: true,
        } as UseInfiniteQueryResult<AxiosResponse<ApiListResponseCursorPagination<Ticket[]>>, unknown>)
        const {getByText} = render(<TicketListView viewId="1" />)

        expect(getByText('Loader')).toBeInTheDocument()
    })

    it('should display message when view is empty', () => {
        useGetViewItemsMock.mockReturnValue({
            ...response,
            data: {pages: [{data: {data: []}}]},
        } as unknown as UseInfiniteQueryResult<AxiosResponse<ApiListResponseCursorPagination<Ticket[]>>, unknown>)
        const {getByText} = render(<TicketListView viewId="1" />)

        expect(getByText(/this view is empty/i)).toBeInTheDocument()
    })
})
