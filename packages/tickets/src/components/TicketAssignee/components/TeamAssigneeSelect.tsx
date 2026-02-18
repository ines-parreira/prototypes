import { useCallback, useState } from 'react'

import { useShortcuts } from '@repo/utils'
import { Emoji } from 'emoji-mart'
import { isNumber } from 'lodash'

import {
    Box,
    Icon,
    ListItem,
    ListSection,
    Select,
    StatusButton,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { Team, TicketTeam } from '@gorgias/helpdesk-queries'

import type { TeamOption, TeamSection } from '../hooks/useTeamOptions'
import { NO_TEAM_OPTION, useTeamOptions } from '../hooks/useTeamOptions'
import { SELECT_WIDTH } from './constant'

import css from './SelectStyles.less'

export type TeamAssigneeSelectProps = {
    value: TicketTeam | null
    onChange: (team: Team | null) => void | Promise<void>
    isDisabled?: boolean
}

export function TeamAssigneeSelect({
    value,
    onChange,
    isDisabled = false,
}: TeamAssigneeSelectProps) {
    const [isTeamAssigneeOpen, setIsTeamAssigneeOpen] = useState(false)
    const {
        teamsMap,
        teamSections,
        selectedOption,
        isLoading,
        search,
        setSearch,
        onLoad,
        shouldLoadMore,
    } = useTeamOptions({ currentTeam: value })

    const handleChange = useCallback(
        (option: TeamOption) => {
            if (option.id === NO_TEAM_OPTION.id) {
                onChange(null)
            } else {
                const team = teamsMap.get(option.id)
                if (team) {
                    onChange(team)
                }
            }
        },
        [teamsMap, onChange],
    )

    const handleOpenChange = useCallback(
        (isOpen: boolean) => {
            setIsTeamAssigneeOpen(isOpen)
            if (!isOpen) {
                setSearch('')
            }
        },
        [setIsTeamAssigneeOpen, setSearch],
    )

    const actions = {
        OPEN_TEAM_ASSIGNEE: {
            action: (event: Event) => {
                event.preventDefault()
                handleOpenChange(!isTeamAssigneeOpen)
            },
        },
    }

    useShortcuts('TicketHeader', actions)

    return (
        <Select
            placeholder="No team"
            items={teamSections}
            isSearchable={true}
            searchValue={search}
            onSearchChange={setSearch}
            // @ts-expect-error - the generic expects a TeamSection
            selectedItem={selectedOption}
            // @ts-expect-error - the generic expects a TeamSection handler
            onSelect={handleChange}
            isLoading={isLoading}
            isDisabled={isDisabled || isLoading}
            minWidth={SELECT_WIDTH}
            maxWidth={SELECT_WIDTH}
            maxHeight={220}
            onLoadMore={() => shouldLoadMore && onLoad()}
            isOpen={isTeamAssigneeOpen}
            onOpenChange={handleOpenChange}
            aria-label="Team selection"
            size="sm"
            trigger={({ selectedText, isPlaceholder, isOpen, ref }) => {
                const emoji = isNumber(selectedOption?.id)
                    ? teamsMap.get(selectedOption?.id)?.decoration?.emoji
                    : null
                return (
                    <Tooltip placement="bottom">
                        <StatusButton
                            ref={ref}
                            leadingSlot={
                                !!emoji ? (
                                    <Box>
                                        <Emoji emoji={emoji} size={16} />{' '}
                                    </Box>
                                ) : (
                                    <Icon name="users" size="sm" />
                                )
                            }
                            trailingSlot={
                                <Icon
                                    name={
                                        isOpen
                                            ? 'arrow-chevron-up'
                                            : 'arrow-chevron-down'
                                    }
                                    size="xs"
                                />
                            }
                            className={css.trigger}
                        >
                            {isPlaceholder ? 'No team' : selectedText}
                        </StatusButton>
                        <TooltipContent
                            title={
                                isPlaceholder ? 'Assign team' : 'Assigned team'
                            }
                        />
                    </Tooltip>
                )
            }}
        >
            {(section: TeamSection) => (
                <ListSection
                    id={section.id}
                    name={section.name}
                    items={section.items}
                >
                    {(option) => {
                        const emoji =
                            option.id !== NO_TEAM_OPTION.id
                                ? teamsMap.get(option.id)?.decoration?.emoji
                                : null

                        return (
                            <ListItem
                                key={option.id}
                                textValue={option.label}
                                label={option.label}
                                leadingSlot={
                                    !!emoji ? (
                                        <span
                                            style={{
                                                display: 'flex',
                                            }}
                                        >
                                            <Emoji emoji={emoji} size={16} />
                                        </span>
                                    ) : (
                                        <Icon name="user" size="sm" />
                                    )
                                }
                            />
                        )
                    }}
                </ListSection>
            )}
        </Select>
    )
}
