import { useState } from 'react'

import { Emoji } from 'emoji-mart'

import {
    Icon,
    ListItem,
    ListSection,
    Select,
    StatusButton,
    Text,
} from '@gorgias/axiom'
import type { Team } from '@gorgias/helpdesk-queries'

import { SELECT_WIDTH } from '../../../../../../components/TicketAssignee/components/constant'
import type {
    TeamOption,
    TeamSection,
} from '../../../../../../components/TicketAssignee/hooks/useTeamOptions'
import {
    NO_TEAM_OPTION,
    useTeamOptions,
} from '../../../../../../components/TicketAssignee/hooks/useTeamOptions'

import css from '../../../../../../components/TicketAssignee/components/SelectStyles.less'

type BulkTeamAssignSelectProps = {
    onChange: (team: Team | null) => void | Promise<void>
    isDisabled?: boolean
}

export function BulkTeamAssignSelect({
    onChange,
    isDisabled = false,
}: BulkTeamAssignSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const {
        teamsMap,
        teamSections,
        isLoading,
        search,
        setSearch,
        onLoad,
        shouldLoadMore,
    } = useTeamOptions({
        currentTeam: null,
        includeNoTeamOption: true,
    })

    const handleChange = (option: TeamOption) => {
        if (option.id === NO_TEAM_OPTION.id) {
            onChange(null)
            return
        }

        const team = teamsMap.get(option.id)
        if (team) {
            onChange(team)
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setSearch('')
        }
    }

    return (
        <Select
            placeholder="Assign team"
            items={teamSections}
            isSearchable={true}
            searchValue={search}
            onSearchChange={setSearch}
            selectedItem={null}
            onSelect={handleChange}
            isLoading={isLoading}
            isDisabled={isDisabled}
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            aria-label="Assign team"
            minWidth={SELECT_WIDTH}
            maxWidth={SELECT_WIDTH}
            maxHeight={220}
            onLoadMore={() => shouldLoadMore && onLoad()}
            size="sm"
            trigger={({ ref, isOpen: open }) => (
                <StatusButton
                    ref={ref}
                    leadingSlot={<Icon name="users" size="sm" />}
                    trailingSlot={
                        <Icon
                            name={
                                open ? 'arrow-chevron-up' : 'arrow-chevron-down'
                            }
                            size="xs"
                        />
                    }
                    className={css.trigger}
                >
                    <Text as="span" size="sm" variant="bold">
                        Assign team
                    </Text>
                </StatusButton>
            )}
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
                                        <Emoji emoji={emoji} size={16} />
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
