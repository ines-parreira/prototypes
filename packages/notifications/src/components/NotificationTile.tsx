import type { ReactNode } from 'react'

import { Link } from 'react-router-dom'

import type { IconName } from '@gorgias/axiom'
import {
    Box,
    Dot,
    DropdownIcon,
    Menu,
    MenuItem,
    StatusButton,
    Tag,
    Text,
    Tile,
    TileContent,
    TileHeader,
    TileListItem,
} from '@gorgias/axiom'

import { formatRelativeTime } from '../utils/formatRelativeTime'

export interface NotificationTileProps {
    id: string
    icon: IconName | ReactNode
    title: string
    children?: ReactNode
    createdDatetime: string
    readDatetime: string | null
    href?: string
    onClick?: () => void
    onMarkAsUnread?: () => void
    isListItem?: boolean
}

export function NotificationTile({
    id,
    icon,
    title,
    children,
    createdDatetime,
    readDatetime,
    href,
    onClick,
    onMarkAsUnread,
    isListItem,
}: NotificationTileProps) {
    const isRead = readDatetime !== null
    const content = (
        <>
            <TileHeader title={title} leadingSlot={icon} />
            <TileContent>
                <Box gap="xxs" flexDirection="column">
                    <Text size="sm">{children}</Text>
                    <Box>
                        {isRead ? (
                            <Menu
                                trigger={
                                    <StatusButton
                                        leadingSlot="check"
                                        trailingSlot={
                                            <DropdownIcon isOpen={false} />
                                        }
                                    >
                                        Read
                                    </StatusButton>
                                }
                            >
                                <MenuItem
                                    onAction={onMarkAsUnread}
                                    leadingSlot="undo"
                                    label="Mark as unread"
                                />
                            </Menu>
                        ) : (
                            <Tag leadingSlot={<Dot color="red" size="sm" />}>
                                {formatRelativeTime(createdDatetime)}
                            </Tag>
                        )}
                    </Box>
                </Box>
            </TileContent>
        </>
    )

    if (isListItem) {
        return (
            <TileListItem
                id={id}
                textValue={title}
                type="bottom-border"
                as={Link}
                to={href}
                onClick={onClick}
            >
                {content}
            </TileListItem>
        )
    }

    return (
        <Tile type="bottom-border" as={Link} onClick={onClick} to={href}>
            {content}
        </Tile>
    )
}
