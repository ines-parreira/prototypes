import { useCallback } from 'react'

import { Emoji } from 'emoji-mart'
import { isNumber } from 'lodash'

import {
    Icon,
    ListItem,
    ListSection,
    LegacyLoadingSpinner as LoadingSpinner,
    Select,
    Tag,
} from '@gorgias/axiom'
import { TicketTeam } from '@gorgias/helpdesk-queries'

import {
    NO_TEAM_OPTION,
    TeamOption,
    TeamSection,
    useTeamOptions,
} from '../hooks/useTeamOptions'
import { useUpdateTicketTeam } from '../hooks/useUpdateTicketTeam'

import css from './SelectStyles.less'

type Props = {
    ticketId: number
    currentTeam: TicketTeam | null
}

export function TeamAssignee({ ticketId, currentTeam }: Props) {
    const { updateTicketTeam, isLoading: isUpdatingTeam } =
        useUpdateTicketTeam(ticketId)

    const {
        teamsMap,
        teamSections,
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

    const clearSearch = useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                setSearch('')
            }
        },
        [setSearch],
    )

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
            isDisabled={isUpdatingTeam || isLoading}
            minWidth={210}
            maxWidth={210}
            maxHeight={220}
            onLoadMore={() => shouldLoadMore && onLoad()}
            onOpenChange={clearSearch}
            aria-label="Team selection"
            size="sm"
            trigger={({ selectedText, isPlaceholder, isOpen, ref }) => {
                const emoji = isNumber(selectedOption?.id)
                    ? teamsMap.get(selectedOption?.id)?.decoration?.emoji
                    : null
                return (
                    <Tag
                        ref={ref}
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
                        className={css.trigger}
                    >
                        {isPlaceholder ? 'No team' : selectedText}
                    </Tag>
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
