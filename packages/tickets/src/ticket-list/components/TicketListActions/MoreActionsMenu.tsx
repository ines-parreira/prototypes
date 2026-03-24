import { useCallback, useEffect, useMemo, useState } from 'react'

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
} from '@gorgias/axiom'
import type { Team, TicketPriority, TicketTag } from '@gorgias/helpdesk-queries'

import {
    NO_TEAM_OPTION,
    useTeamOptions,
} from '../../../components/TicketAssignee/hooks/useTeamOptions'
import { useBulkActionMenuState } from '../../hooks/useBulkActionMenuState'
import { useIsTrashLikeView } from '../../hooks/useIsTrashLikeView'
import { AddTagSubMenu } from './AddTagSubMenu'
import { PrioritySubMenu } from './PrioritySubMenu'

import css from './MoreActionsMenu.module.less'

type Props = {
    viewId: number
    isDisabled: boolean
    onMarkAsUnread: () => void
    onMarkAsRead: () => void
    onAddTag: (tag: TicketTag) => void | Promise<void>
    onAssignTeam: (team: Team | null) => void
    onChangePriority: (priority: TicketPriority) => void
    onExportTickets: () => void
    onApplyMacro: () => void
    onMoveToTrash: () => void
    onUndelete: () => void
    onDeleteForever: () => void
}

export function MoreActionsMenu({
    viewId,
    isDisabled,
    onMarkAsUnread,
    onMarkAsRead,
    onAddTag,
    onAssignTeam,
    onChangePriority,
    onExportTickets,
    onApplyMacro,
    onMoveToTrash,
    onUndelete,
    onDeleteForever,
}: Props) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { canUseRestrictedBulkActions } = useBulkActionMenuState()
    const isTrashLikeView = useIsTrashLikeView(viewId)
    const { teamsMap, teamSections, search, setSearch } = useTeamOptions({
        currentTeam: null,
        enabled: isMenuOpen,
    })
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
            <Tooltip
                trigger={<span className={css.overflowLabel}>{label}</span>}
            >
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
                <Tooltip
                    trigger={
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon="dots-meatballs-horizontal"
                            aria-label="More actions"
                            isDisabled={isDisabled}
                        />
                    }
                >
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
            {canUseRestrictedBulkActions && (
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
            {canUseRestrictedBulkActions &&
                (isTrashLikeView ? (
                    <>
                        <MenuItem
                            id="undelete"
                            label={renderOverflowLabel('Undelete')}
                            onAction={onUndelete}
                        />
                        <MenuItem
                            id="delete-forever"
                            label={renderOverflowLabel('Delete forever')}
                            intent={Intent.Destructive}
                            onAction={onDeleteForever}
                        />
                    </>
                ) : (
                    <MenuItem
                        id="delete"
                        label={renderOverflowLabel('Delete')}
                        intent={Intent.Destructive}
                        onAction={onMoveToTrash}
                    />
                ))}
        </Menu>
    )
}
