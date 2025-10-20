import { useCallback } from 'react'

import { Emoji } from 'emoji-mart'
import { isNumber } from 'lodash'

import { Icon, ListItem, LoadingSpinner, NewTag, Select } from '@gorgias/axiom'
import { Team } from '@gorgias/helpdesk-queries'

import {
    NO_TEAM_OPTION,
    TeamOption,
    useTeamOptions,
} from '../hooks/useTeamOptions'
import { useUpdateTicketTeam } from '../hooks/useUpdateTicketTeam'

type Props = {
    ticketId: number
    currentTeam: Team | null
}

export function TeamAssignee({ ticketId, currentTeam }: Props) {
    const { updateTicketTeam, isLoading: isUpdatingTeam } =
        useUpdateTicketTeam(ticketId)

    const {
        teamsMap,
        teamOptions,
        selectedOption,
        isLoading,
        search,
        setSearch,
        onLoad,
        shouldLoadMore,
    } = useTeamOptions({ currentTeam })

    const handleChange = useCallback(
        async (option: TeamOption) => {
            try {
                if (option.id === NO_TEAM_OPTION.id) {
                    await updateTicketTeam(null)
                } else {
                    const team = teamsMap.get(option.id)
                    if (team) {
                        await updateTicketTeam(team)
                    }
                }
            } catch {}
        },
        [teamsMap, updateTicketTeam],
    )

    return (
        <Select
            placeholder="No team"
            items={teamOptions}
            isSearchable={true}
            searchValue={search}
            onSearchChange={setSearch}
            selectedItem={selectedOption}
            onSelect={handleChange}
            isLoading={isLoading}
            isDisabled={isUpdatingTeam || isLoading}
            maxHeight={220}
            onLoadMore={() => shouldLoadMore && onLoad()}
            aria-label="Team selection"
            trigger={({ selectedText, isPlaceholder, isOpen }) => {
                const emoji = isNumber(selectedOption?.id)
                    ? teamsMap.get(selectedOption?.id)?.decoration?.emoji
                    : null
                return (
                    <NewTag
                        leadingSlot={
                            isUpdatingTeam || isLoading ? (
                                <LoadingSpinner size={16} />
                            ) : !!emoji ? (
                                <span
                                    style={{
                                        display: 'flex',
                                    }}
                                >
                                    <Emoji emoji={emoji} size={16} />{' '}
                                </span>
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
                    >
                        {isPlaceholder ? 'No team' : selectedText}
                    </NewTag>
                )
            }}
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
                                <Icon
                                    name={
                                        option.id === NO_TEAM_OPTION.id
                                            ? 'close'
                                            : 'users'
                                    }
                                    size="sm"
                                />
                            )
                        }
                    />
                )
            }}
        </Select>
    )
}
