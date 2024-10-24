import classNames from 'classnames'
import {Emoji} from 'emoji-mart'
import pluralize from 'pluralize'
import React, {useRef, useState} from 'react'

import {useListTeams} from 'models/team/queries'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './VoiceIntegrationPreferencesTeamSelect.less'

type Props = {
    value?: Maybe<number>
    onChange: (teamId: number | null) => void
}

export const NO_TEAM_SELECTED_LABEL = 'Route to all available agents'

export default function VoiceIntegrationPreferencesTeamSelect({
    value,
    onChange,
}: Props) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const {data, isLoading, error} = useListTeams({limit: 100})
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    const options = data?.data?.data
    const selectedTeam = options?.find((team) => team.id === value)

    const noTeamSelectedIcon = (
        <i className={classNames('material-icons', css.icon)}>people</i>
    )

    return (
        <>
            {!!error && (
                <div className={css.error}>Error: Unable to retrieve teams</div>
            )}
            <SelectInputBox
                prefix={
                    !selectedTeam ? (
                        noTeamSelectedIcon
                    ) : selectedTeam.decoration?.emoji ? (
                        <Emoji
                            emoji={selectedTeam.decoration.emoji}
                            size={20}
                        />
                    ) : null
                }
                label={selectedTeam?.name || NO_TEAM_SELECTED_LABEL}
                onToggle={setIsDropdownOpen}
                floating={floatingRef}
                ref={targetRef}
                placeholder="Select a team"
                isDisabled={!!error || isLoading}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isDropdownOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={selectedTeam?.name}
                        >
                            <DropdownSearch autoFocus />
                            <DropdownBody>
                                <DropdownItem
                                    option={{
                                        label: NO_TEAM_SELECTED_LABEL,
                                        value: null,
                                    }}
                                    onClick={() => onChange(null)}
                                    shouldCloseOnSelect
                                    className={css.dropdownItem}
                                >
                                    {noTeamSelectedIcon}
                                    <div>{NO_TEAM_SELECTED_LABEL}</div>
                                </DropdownItem>
                                {options?.map((option) => (
                                    <DropdownItem
                                        key={option.id}
                                        option={{
                                            label: option.name,
                                            value: option.id,
                                        }}
                                        onClick={() => onChange(option.id)}
                                        shouldCloseOnSelect
                                        className={css.dropdownItem}
                                    >
                                        {option?.decoration?.emoji && (
                                            <Emoji
                                                emoji={option.decoration.emoji}
                                                size={20}
                                            />
                                        )}
                                        <div className={css.teamDetails}>
                                            <div>{option.name}</div>
                                            <div className={css.membersCount}>
                                                {option.members?.length}{' '}
                                                {pluralize(
                                                    'member',
                                                    option.members?.length
                                                )}
                                            </div>
                                        </div>
                                    </DropdownItem>
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        </>
    )
}
