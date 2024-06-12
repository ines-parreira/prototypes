import React from 'react'
import {render, screen} from '@testing-library/react'
import {Link} from 'react-router-dom'

import {agents} from 'fixtures/agents'
import {
    basicMonthlyHelpdeskPrice as mockedBasicMonthlyHelpdeskPrice,
    starterHelpdeskPrice,
} from 'fixtures/productPrices'
import {usePaginatedQuery} from 'hooks/usePaginatedQuery'
import Navigation from 'pages/common/components/Navigation/Navigation'
import Row from 'pages/settings/users/List/Row'
import {getCurrentHelpdeskPlan} from 'state/billing/selectors'
import {getAccountOwnerId} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'
import {assumeMock} from 'utils/testing'

import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import UserList from '..'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Link: jest.fn(() => <div>Link Mock</div>),
}))
const mockedLink = assumeMock(Link)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch')
const mockedUseAppDispatch = assumeMock(useAppDispatch)
jest.mock('state/notifications/actions')
jest.mock('hooks/useAppSelector', () => jest.fn((fn: () => unknown) => fn()))
jest.mock('state/currentAccount/selectors')
const mockedGetAccountOwnerId = assumeMock(getAccountOwnerId)
jest.mock('state/billing/selectors', () => ({
    getCurrentHelpdeskPlan: jest.fn(() => mockedBasicMonthlyHelpdeskPrice),
}))
const mockedGetCurrentHelpdeskProduct = assumeMock(getCurrentHelpdeskPlan)

jest.mock('pages/common/components/Navigation/Navigation', () =>
    jest.fn(() => null)
)
jest.mock('../Row', () => jest.fn(() => null))
const mockedRow = assumeMock(Row)

jest.mock('hooks/usePaginatedQuery/usePaginatedQuery')
const mockedUsePaginatedQuery = assumeMock(usePaginatedQuery)

describe('<List />', () => {
    beforeEach(() => {
        mockedUseAppDispatch.mockImplementation(() => mockedDispatch)
        mockedGetAccountOwnerId.mockImplementation(() => agents[0].id)
        mockedUsePaginatedQuery.mockImplementation(
            () => ({} as ReturnType<typeof usePaginatedQuery>)
        )
    })

    it('should render a link with correct `to` prop', () => {
        render(<UserList />)
        expect(mockedLink.mock.calls[0][0].to).toBe('/app/settings/users/add/')
    })

    it('should render a text saying how many users can be managed', () => {
        const {rerender} = render(<UserList />)
        expect(screen.getByText(/as many users/)).toBeInTheDocument()

        mockedGetCurrentHelpdeskProduct.mockImplementationOnce(
            () => starterHelpdeskPrice
        )
        rerender(<UserList />)
        expect(screen.getByText(/up to 3 users/)).toBeInTheDocument()
    })

    it('should render a loader', () => {
        mockedUsePaginatedQuery.mockImplementationOnce(
            () =>
                ({
                    isLoading: true,
                } as ReturnType<typeof usePaginatedQuery>)
        )
        render(<UserList />)
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should dispatch an error', () => {
        mockedUsePaginatedQuery.mockImplementationOnce(
            () =>
                ({
                    error: {},
                } as ReturnType<typeof usePaginatedQuery>)
        )
        render(<UserList />)
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
        expect(notify).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                status: NotificationStatus.Error,
            })
        )
    })

    it('should provide correct props to `Navigation`', () => {
        const hasPreviousPage = () => undefined
        const fetchPreviousPage = () => undefined
        const hasNextPage = () => undefined
        const fetchNextPage = () => undefined
        mockedUsePaginatedQuery.mockImplementationOnce(
            () =>
                ({
                    hasPreviousPage,
                    fetchPreviousPage,
                    hasNextPage,
                    fetchNextPage,
                } as unknown as ReturnType<typeof usePaginatedQuery>)
        )
        render(<UserList />)
        expect(Navigation).toHaveBeenNthCalledWith(
            1,
            {
                hasPrevItems: hasPreviousPage,
                fetchPrevItems: fetchPreviousPage,
                hasNextItems: hasNextPage,
                fetchNextItems: fetchNextPage,
            },
            {}
        )
    })

    it('should provide correct props to `Row`', () => {
        mockedUsePaginatedQuery.mockImplementationOnce(
            () =>
                ({
                    data: {
                        data: {
                            data: agents,
                        },
                    },
                } as unknown as ReturnType<typeof usePaginatedQuery>)
        )
        render(<UserList />)
        expect(mockedRow.mock.calls).toEqual([
            [{agent: agents[0], isAccountOwner: true}, {}],
            [{agent: agents[1], isAccountOwner: false}, {}],
        ])
    })
})
