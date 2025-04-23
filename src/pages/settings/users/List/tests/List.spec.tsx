import React from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Link } from 'react-router-dom'

import { User } from '@gorgias/api-queries'

import { agents } from 'fixtures/agents'
import {
    basicMonthlyHelpdeskPlan as mockedBasicMonthlyHelpdeskPlan,
    starterHelpdeskPlan,
} from 'fixtures/productPrices'
import useAppDispatch from 'hooks/useAppDispatch'
import { OrderDirection } from 'models/api/types'
import { UserSortableProperties } from 'models/user/types'
import Navigation from 'pages/common/components/Navigation/Navigation'
import Search from 'pages/common/components/Search'
import UsersSettingsTable from 'pages/settings/users/List/UsersSettingsTable'
import { useUserList } from 'pages/settings/users/List/useUserList'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'
import { getAccountOwnerId } from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'

import UserList from '..'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Link: jest.fn(() => <div>Link Mock</div>),
}))
const mockedLink = assumeMock(Link)

jest.mock('pages/settings/users/List/useUserList')
const mockedUseUserList = assumeMock(useUserList)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch')
const mockedUseAppDispatch = assumeMock(useAppDispatch)
jest.mock('state/notifications/actions')
jest.mock('hooks/useAppSelector', () => jest.fn((fn: () => unknown) => fn()))
jest.mock('state/currentAccount/selectors')
const mockedGetAccountOwnerId = assumeMock(getAccountOwnerId)
jest.mock('state/billing/selectors', () => ({
    getCurrentHelpdeskPlan: jest.fn(() => mockedBasicMonthlyHelpdeskPlan),
}))
const mockedGetCurrentHelpdeskProduct = assumeMock(getCurrentHelpdeskPlan)

jest.mock('pages/common/components/Navigation/Navigation', () =>
    jest.fn(() => null),
)
jest.mock('../UsersSettingsTable', () => jest.fn(() => null))
const mockedUsersSettingsTable = assumeMock(UsersSettingsTable)

jest.mock('pages/common/components/Search', () => {
    return jest.fn(({ value, onChange, placeholder }) => (
        <input
            data-testid="search-input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
        />
    ))
})
const mockedSearch = assumeMock(Search)

describe('<List />', () => {
    beforeEach(() => {
        mockedUseAppDispatch.mockImplementation(() => mockedDispatch)
        mockedGetAccountOwnerId.mockImplementation(() => agents[0].id)
        mockedUseUserList.mockImplementation(() => ({
            params: { order_by: 'name:asc' },
            isLoading: false,
            isError: false,
            users: [],
            hasPrevItems: false,
            hasNextItems: false,
            fetchPrevItems: jest.fn(),
            fetchNextItems: jest.fn(),
            setOrderBy: jest.fn(),
            setSearch: jest.fn(),
        }))
    })

    it('should render a link with correct `to` prop', () => {
        render(<UserList />)
        expect(mockedLink.mock.calls[0][0].to).toBe('/app/settings/users/add/')
    })

    it('should render a text saying how many users can be managed', () => {
        const { rerender } = render(<UserList />)
        expect(screen.getByText(/as many users/)).toBeInTheDocument()

        mockedGetCurrentHelpdeskProduct.mockImplementationOnce(
            () => starterHelpdeskPlan,
        )
        rerender(<UserList />)
        expect(screen.getByText(/up to 3 users/)).toBeInTheDocument()
    })

    it('should render a loader', () => {
        mockedUseUserList.mockImplementationOnce(() => ({
            params: { order_by: 'name:asc' },
            isLoading: true,
            isError: false,
            users: [],
            hasPrevItems: false,
            hasNextItems: false,
            fetchPrevItems: jest.fn(),
            fetchNextItems: jest.fn(),
            setOrderBy: jest.fn(),
            setSearch: jest.fn(),
        }))
        render(<UserList />)
        expect(mockedUsersSettingsTable).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {},
        )
    })

    it('should dispatch an error', () => {
        mockedUseUserList.mockImplementationOnce(() => ({
            params: { order_by: 'name:asc' },
            isLoading: false,
            isError: true,
            users: [],
            hasPrevItems: false,
            hasNextItems: false,
            fetchPrevItems: jest.fn(),
            fetchNextItems: jest.fn(),
            setOrderBy: jest.fn(),
            setSearch: jest.fn(),
        }))
        render(<UserList />)
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
        expect(notify).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                message: 'Failed to fetch users',
                status: NotificationStatus.Error,
            }),
        )
    })

    it('should provide correct props to `Navigation`', () => {
        const fetchPrevItems = jest.fn()
        const fetchNextItems = jest.fn()
        mockedUseUserList.mockImplementationOnce(() => ({
            params: { order_by: 'name:asc' },
            isLoading: false,
            isError: false,
            users: [],
            hasPrevItems: true,
            hasNextItems: true,
            fetchPrevItems,
            fetchNextItems,
            setOrderBy: jest.fn(),
            setSearch: jest.fn(),
        }))
        render(<UserList />)
        expect(Navigation).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                hasPrevItems: true,
                hasNextItems: true,
                fetchPrevItems,
                fetchNextItems,
            }),
            {},
        )
    })

    it('should provide correct props to `UsersSettingsTable`', () => {
        mockedUseUserList.mockImplementationOnce(() => ({
            params: { order_by: 'name:asc' },
            isLoading: false,
            isError: false,
            users: agents as User[],
            hasPrevItems: false,
            hasNextItems: false,
            fetchPrevItems: jest.fn(),
            fetchNextItems: jest.fn(),
            setOrderBy: jest.fn(),
            setSearch: jest.fn(),
        }))
        render(<UserList />)
        expect(mockedUsersSettingsTable).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: false,
                users: agents,
                onSortOptionsChange: expect.any(Function),
                options: expect.objectContaining({
                    order_by: 'name:asc',
                }),
            }),
            {},
        )
    })

    it('should reset cursor when sorting is changed', () => {
        const setOrderByMock = jest.fn()

        mockedUseUserList.mockImplementationOnce(() => ({
            params: { order_by: 'name:asc' },
            isLoading: false,
            isError: false,
            users: agents as User[],
            hasPrevItems: true,
            hasNextItems: true,
            fetchPrevItems: jest.fn(),
            fetchNextItems: jest.fn(),
            setOrderBy: setOrderByMock,
            setSearch: jest.fn(),
        }))

        render(<UserList />)

        const onSortOptionsChange =
            mockedUsersSettingsTable.mock.calls[0][0].onSortOptionsChange
        onSortOptionsChange(UserSortableProperties.Name, OrderDirection.Desc)

        expect(setOrderByMock).toHaveBeenCalledWith(
            UserSortableProperties.Name,
            OrderDirection.Desc,
        )
    })

    it('should render search input with correct placeholder', () => {
        render(<UserList />)

        expect(mockedSearch).toHaveBeenCalledWith(
            expect.objectContaining({
                placeholder: 'Search users...',
                value: '',
            }),
            {},
        )
    })

    it('should fetch users when searching', async () => {
        const setSearchMock = jest.fn()

        mockedUseUserList.mockImplementation(() => ({
            params: { order_by: 'name:asc' },
            isLoading: false,
            isError: false,
            users: agents as User[],
            hasPrevItems: true,
            hasNextItems: true,
            fetchPrevItems: jest.fn(),
            fetchNextItems: jest.fn(),
            setOrderBy: jest.fn(),
            setSearch: setSearchMock,
        }))

        render(<UserList />)

        const searchTerm = 'foo'
        const searchInput = screen.getByTestId('search-input')
        act(() => {
            fireEvent.change(searchInput, { target: { value: searchTerm } })
        })

        await waitFor(() => {
            expect(setSearchMock).toHaveBeenCalledWith(searchTerm)
        })
    })

    it('should display "No results" message when search returns no users', () => {
        mockedUseUserList.mockImplementationOnce(() => ({
            params: { order_by: 'name:asc', search: 'foo' },
            isLoading: false,
            isError: false,
            users: [],
            hasPrevItems: false,
            hasNextItems: false,
            fetchPrevItems: jest.fn(),
            fetchNextItems: jest.fn(),
            setOrderBy: jest.fn(),
            setSearch: jest.fn(),
        }))

        render(<UserList />)

        expect(screen.getByText('No results')).toBeInTheDocument()
        expect(
            screen.getByText(/You may want to try using a different name/),
        ).toBeInTheDocument()
    })
})
