import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import type { ListUsersParams } from '@gorgias/helpdesk-queries'
import type { User } from '@gorgias/helpdesk-types'

import { agents } from 'fixtures/agents'
import { OrderDirection } from 'models/api/types'
import { UserSortableProperties } from 'models/user/types'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'

import { UsersSettingsItem } from '../UsersSettingsItem'
import { UsersSettingsTable } from '../UsersSettingsTable'

jest.mock('pages/common/components/table/cells/HeaderCellProperty', () =>
    jest.fn(() => <th data-testid="header-cell" />),
)

jest.mock('../UsersSettingsItem', () => ({
    UsersSettingsItem: jest.fn(() => <tr data-testid="user-item" />),
}))

const mockedHeaderCellProperty = assumeMock(HeaderCellProperty)
const mockedUsersSettingsItem = assumeMock(UsersSettingsItem)

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

    it('should render skeleton when isLoading is true', () => {
        render(<UsersSettingsTable {...defaultProps} isLoading={true} />)

        // Check that skeleton is rendered instead of users
        expect(mockedUsersSettingsItem).not.toHaveBeenCalled()

        // Check for skeleton elements in the table body
        const tableBody = screen.getByRole('table').querySelector('tbody')
        expect(tableBody).toBeInTheDocument()

        // Verify that no user items are rendered
        expect(screen.queryAllByTestId('user-item')).toHaveLength(0)
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
