import React from 'react'

import { render, screen } from '@testing-library/react'

import { ListUsersParams } from '@gorgias/api-queries'
import { User } from '@gorgias/api-types'
import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { agents } from 'fixtures/agents'
import { OrderDirection } from 'models/api/types'
import { UserSortableProperties } from 'models/user/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import { assumeMock } from 'utils/testing'

import { UsersSettingsItem } from '../UsersSettingsItem'
import { UsersSettingsTable } from '../UsersSettingsTable'

jest.mock('@gorgias/merchant-ui-kit', () => ({
    LoadingSpinner: jest.fn(() => <div data-testid="loading-spinner" />),
}))

jest.mock('pages/common/components/table/cells/HeaderCellProperty', () =>
    jest.fn(() => <div data-testid="header-cell" />),
)

jest.mock('pages/common/components/table/cells/BodyCell', () =>
    jest.fn(({ children, innerClassName }) => (
        <div data-testid={`body-cell-${innerClassName}`}>{children}</div>
    )),
)

jest.mock('pages/common/components/table/TableBodyRow', () =>
    jest.fn(({ children }) => (
        <div data-testid="table-body-row">{children}</div>
    )),
)

jest.mock('../UsersSettingsItem', () => ({
    UsersSettingsItem: jest.fn(() => <tr data-testid="user-item" />),
}))

const mockedHeaderCellProperty = assumeMock(HeaderCellProperty)
assumeMock(BodyCell)
assumeMock(TableBodyRow)
const mockedUsersSettingsItem = assumeMock(UsersSettingsItem)
const mockedLoadingSpinner = assumeMock(LoadingSpinner)

describe('<UsersSettingsTable />', () => {
    const defaultProps = {
        isLoading: false,
        users: agents as unknown as User[],
        onSortOptionsChange: jest.fn(),
        options: {
            order_by: `${UserSortableProperties.Name}:${OrderDirection.Asc}`,
        } as unknown as ListUsersParams,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the table with headers', () => {
        render(<UsersSettingsTable {...defaultProps} />)

        for (const title of ['User', 'Email', 'Role', '2FA']) {
            expect(
                mockedHeaderCellProperty.mock.calls.some(
                    (call) => call[0] && call[0].title === title,
                ),
            ).toBe(true)
        }
    })

    it('should render loading spinner when isLoading is true', () => {
        render(<UsersSettingsTable {...defaultProps} isLoading={true} />)

        expect(mockedLoadingSpinner).toHaveBeenCalledTimes(1)
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should render users when provided', () => {
        render(<UsersSettingsTable {...defaultProps} />)

        expect(mockedUsersSettingsItem).toHaveBeenCalledTimes(agents.length)

        for (const agent of agents) {
            expect(mockedUsersSettingsItem).toHaveBeenCalledWith(
                { user: agent },
                {},
            )
        }

        expect(screen.getAllByTestId('user-item').length).toBe(agents.length)
    })

    it('should render without errors when users array is empty', () => {
        expect(() => {
            render(<UsersSettingsTable {...defaultProps} users={[]} />)
        }).not.toThrow()
    })

    it('should call onSortOptionsChange when header is clicked', () => {
        render(<UsersSettingsTable {...defaultProps} />)

        const onClickName = mockedHeaderCellProperty.mock.calls[0][0].onClick!
        const onClickEmail = mockedHeaderCellProperty.mock.calls[1][0].onClick!

        onClickName()
        expect(defaultProps.onSortOptionsChange).toHaveBeenCalledWith(
            UserSortableProperties.Name,
            OrderDirection.Desc,
        )

        onClickEmail()
        expect(defaultProps.onSortOptionsChange).toHaveBeenCalledWith(
            UserSortableProperties.Email,
            OrderDirection.Asc,
        )
    })

    it('should parse order_by correctly', () => {
        const props = {
            ...defaultProps,
            options: {
                order_by: `${UserSortableProperties.Email}:${OrderDirection.Desc}`,
            } as unknown as ListUsersParams,
        }

        render(<UsersSettingsTable {...props} />)

        const emailHeader = mockedHeaderCellProperty.mock.calls[1][0]
        expect(emailHeader.isOrderedBy).toBe(true)
        expect(emailHeader.direction).toBe(OrderDirection.Desc)
    })
})
