import { useCallback, useEffect, useMemo, useState } from 'react'

import { hasRole, UserRole } from '@repo/utils'

import {
    Button,
    Intent,
    Menu,
    MenuItem,
    MenuPlacement,
    MenuSize,
    SubMenu,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'
import type { Team, TicketPriority, TicketTag } from '@gorgias/helpdesk-queries'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import {
    NO_TEAM_OPTION,
    useTeamOptions,
} from '../../../components/TicketAssignee/hooks/useTeamOptions'
import { AddTagSubMenu } from './AddTagSubMenu'
import { PrioritySubMenu } from './PrioritySubMenu'

import css from './MoreActionsMenu.module.less'

type Props = {
    isDisabled: boolean
    onMarkAsUnread: () => void
    onMarkAsRead: () => void
    onAddTag: (tag: TicketTag) => void | Promise<void>
    onAssignTeam: (team: Team | null) => void
    onChangePriority: (priority: TicketPriority) => void
    onExportTickets: () => void
    onApplyMacro: () => void
    onMoveToTrash: () => void
}

export function MoreActionsMenu({
    isDisabled,
    onMarkAsUnread,
    onMarkAsRead,
    onAddTag,
    onAssignTeam,
    onChangePriority,
    onExportTickets,
    onApplyMacro,
    onMoveToTrash,
}: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { data: currentUser } = useGetCurrentUser()
    const { teamsMap, teamSections, search, setSearch } = useTeamOptions({
        currentTeam: null,
        enabled: isMenuOpen,
    })
    const canExportTickets = useMemo(
        () => currentUser && hasRole(currentUser.data, UserRole.Agent),
        [currentUser],
    )
    const teamOptions = useMemo(
        () => [
            NO_TEAM_OPTION,
            ...teamSections.flatMap((section) => section.items),
        ],
        [teamSections],
    )

    useEffect(() => {
        if (isDisabled) {
            setIsMenuOpen(false)
            setSearch('')
        }
    }, [isDisabled, setSearch])

    const handleMenuOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                setSearch('')
            }
            setIsMenuOpen(open)
        },
        [setSearch],
    )

    const handleAssignTeam = useCallback(
        (teamId: number | typeof NO_TEAM_OPTION.id) => {
            if (teamId === NO_TEAM_OPTION.id) {
                onAssignTeam(null)
                return
            }
            const team = teamsMap.get(teamId)
            if (team) {
                onAssignTeam(team)
            }
        },
        [onAssignTeam, teamsMap],
    )

    const renderOverflowLabel = useCallback((label: string) => {
        return (
            <Tooltip>
                <TooltipTrigger>
                    <span className={css.overflowLabel}>{label}</span>
                </TooltipTrigger>
                <TooltipContent title={label} />
            </Tooltip>
        )
    }, [])

    return (
        <Menu
            placement={MenuPlacement.BottomRight}
            size={MenuSize.Sm}
            aria-label="More bulk actions"
            isOpen={isMenuOpen}
            onOpenChange={handleMenuOpenChange}
            trigger={
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon="dots-meatballs-horizontal"
                            aria-label="More actions"
                            isDisabled={isDisabled}
                        />
                    </TooltipTrigger>
                    <TooltipContent
                        title={
                            isDisabled
                                ? 'Select one or more tickets to perform actions'
                                : 'More actions'
                        }
                    />
                </Tooltip>
            }
        >
            <MenuItem
                id="mark-as-unread"
                label={renderOverflowLabel('Mark as unread')}
                onAction={onMarkAsUnread}
            />
            <MenuItem
                id="mark-as-read"
                label={renderOverflowLabel('Mark as read')}
                onAction={onMarkAsRead}
            />
            <AddTagSubMenu
                isEnabled={isMenuOpen}
                renderOverflowLabel={renderOverflowLabel}
                onAddTag={onAddTag}
            />
            <SubMenu
                id="assign-team"
                label={renderOverflowLabel('Assign to team')}
                maxHeight={256}
                maxWidth={256}
                isSearchable
                searchValue={search}
                onSearchChange={setSearch}
            >
                {teamOptions.map((option) => (
                    <MenuItem
                        key={option.id}
                        id={`assign-team-${option.id}`}
                        label={renderOverflowLabel(option.label)}
                        onAction={() => handleAssignTeam(option.id)}
                    />
                ))}
            </SubMenu>
            <PrioritySubMenu onChangePriority={onChangePriority} />
            {canExportTickets && (
                <MenuItem
                    id="export-tickets"
                    label={renderOverflowLabel('Export tickets')}
                    onAction={onExportTickets}
                />
            )}
            <MenuItem
                id="apply-macro"
                label={renderOverflowLabel('Apply macro')}
                onAction={onApplyMacro}
            />
            <MenuItem
                id="move-to-trash"
                label={renderOverflowLabel('Move to trash')}
                intent={Intent.Destructive}
                onAction={onMoveToTrash}
            />
        </Menu>
    )
}
