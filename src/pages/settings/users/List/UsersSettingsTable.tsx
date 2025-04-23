import React, { useMemo } from 'react'

import { ListUsersParams } from '@gorgias/api-queries'
import { User } from '@gorgias/api-types'
import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { OrderDirection } from 'models/api/types'
import { UserSortableProperties } from 'models/user/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import { UsersSettingsItem } from './UsersSettingsItem'

import css from './UsersSettingsTable.less'

type Props = {
    isLoading: boolean
    users: User[]
    onSortOptionsChange: (
        orderBy: UserSortableProperties,
        orderDir: OrderDirection,
    ) => void
    options: ListUsersParams
}

export function UsersSettingsTable({
    isLoading,
    users,
    onSortOptionsChange,
    options,
}: Props) {
    const orderByValue = useMemo(
        () => options.order_by?.split(':')[0],
        [options.order_by],
    )
    const orderDirValue = useMemo(
        () => options.order_by?.split(':')[1] as OrderDirection,
        [options.order_by],
    )

    const defaultDescendingSort = [UserSortableProperties.Name]

    const handleSortChange = (orderBy: UserSortableProperties) => {
        onSortOptionsChange(
            orderBy,
            orderBy === orderByValue
                ? orderDirValue === OrderDirection.Asc
                    ? OrderDirection.Desc
                    : OrderDirection.Asc
                : defaultDescendingSort.includes(orderBy)
                  ? OrderDirection.Desc
                  : OrderDirection.Asc,
        )
    }

    return (
        <TableWrapper>
            <thead className={css.tableHead}>
                <tr>
                    <HeaderCellProperty
                        className={css.headerCellProperty}
                        titleClassName={css.headerCellPropertyTitle}
                        direction={orderDirValue}
                        isOrderedBy={
                            orderByValue === UserSortableProperties.Name
                        }
                        onClick={() =>
                            handleSortChange(UserSortableProperties.Name)
                        }
                        title="User"
                    />
                    <HeaderCellProperty
                        className={css.headerCellProperty}
                        titleClassName={css.headerCellPropertyTitle}
                        direction={orderDirValue}
                        isOrderedBy={
                            orderByValue === UserSortableProperties.Email
                        }
                        onClick={() =>
                            handleSortChange(UserSortableProperties.Email)
                        }
                        title="Email"
                    />
                    <HeaderCellProperty
                        className={css.headerCellProperty}
                        titleClassName={css.headerCellPropertyTitle}
                        direction={orderDirValue}
                        isOrderedBy={
                            orderByValue === UserSortableProperties.Role
                        }
                        onClick={() =>
                            handleSortChange(UserSortableProperties.Role)
                        }
                        title="Role"
                    />
                    <HeaderCellProperty
                        className={css.headerCellProperty}
                        titleClassName={css.headerCellPropertyTitle}
                        direction={orderDirValue}
                        isOrderedBy={
                            orderByValue ===
                            UserSortableProperties.Has2FAEnabled
                        }
                        onClick={() =>
                            handleSortChange(
                                UserSortableProperties.Has2FAEnabled,
                            )
                        }
                        title="2FA"
                    />
                </tr>
            </thead>
            <TableBody>
                {isLoading ? (
                    <TableBodyRow>
                        <BodyCell innerClassName={css.empty} colSpan={4}>
                            <LoadingSpinner size="medium" />
                        </BodyCell>
                    </TableBodyRow>
                ) : (
                    users.map((user: User) => (
                        <UsersSettingsItem key={user.id} user={user} />
                    ))
                )}
            </TableBody>
        </TableWrapper>
    )
}

export default UsersSettingsTable
