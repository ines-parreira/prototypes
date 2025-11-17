import { Link } from 'react-router-dom'

import type { LegacyColorType as ColorType } from '@gorgias/axiom'
import { LegacyBadge as Badge } from '@gorgias/axiom'
import type { User } from '@gorgias/helpdesk-types'

import { AvailabilityStatusTag, UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import Avatar from 'pages/common/components/Avatar/Avatar'
import bodyCellCss from 'pages/common/components/table/cells/BodyCell.less'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import { RoleLabel } from 'pages/common/utils/labels'
import { getAccountOwnerId } from 'state/currentAccount/selectors'

import css from './UsersSettingsItem.less'

type Props = {
    user: User
}

export function UsersSettingsItem({ user }: Props) {
    const accountOwnerId = useAppSelector(getAccountOwnerId)
    const isAccountOwner = user.id === accountOwnerId

    const to = `/app/settings/users/${user.id}`
    const isBot = user.role?.name === UserRole.Bot

    const availability = user.availability_status?.status
    const avatarBadgerColor = isBot
        ? ''
        : !availability || availability === AvailabilityStatusTag.Offline
          ? 'var(--neutral-grey-4)'
          : availability === AvailabilityStatusTag.Busy
            ? 'var(--feedback-warning)'
            : 'var(--feedback-success)'

    const twoFABadgeType: ColorType = isBot
        ? 'light-grey'
        : user.has_2fa_enabled
          ? 'light-success'
          : 'light-error'
    const twoFABadgeText: string = isBot
        ? 'N/A'
        : user.has_2fa_enabled
          ? 'Enabled'
          : 'Disabled'

    return (
        <TableBodyRow>
            <td className={bodyCellCss.wrapper}>
                <Link to={to} tabIndex={-1}>
                    <BodyCellContent>
                        <Avatar
                            name={user.name || user.email}
                            url={user.meta?.profile_picture_url}
                            size={36}
                            shape="round"
                            badgeColor={avatarBadgerColor}
                        />{' '}
                        <span className={css.name}>{user.name}</span>
                    </BodyCellContent>
                </Link>
            </td>
            <td className={bodyCellCss.wrapper}>
                <Link to={to} tabIndex={-1}>
                    <BodyCellContent className={css.email}>
                        {user.email}
                    </BodyCellContent>
                </Link>
            </td>
            <td className={bodyCellCss.wrapper}>
                <Link to={to} tabIndex={-1}>
                    <BodyCellContent>
                        {isAccountOwner ? (
                            <Badge type="blue">Account Owner</Badge>
                        ) : (
                            <RoleLabel
                                role={{ name: user.role?.name as UserRole }}
                            />
                        )}
                    </BodyCellContent>
                </Link>
            </td>
            <td className={bodyCellCss.wrapper}>
                <Link to={to} tabIndex={-1}>
                    <BodyCellContent>
                        <Badge type={twoFABadgeType}>{twoFABadgeText}</Badge>
                    </BodyCellContent>
                </Link>
            </td>
        </TableBodyRow>
    )
}
