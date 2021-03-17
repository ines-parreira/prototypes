// @flow

// $FlowFixMe
import React, {useState} from 'react'
import {Dropdown, DropdownMenu, DropdownToggle} from 'reactstrap'
import {type Map, List} from 'immutable'

import css from './UncontrolledPeopleSearchInput.less'

import PeopleSearchInput from './PeopleSearchInput.tsx'
import PeopleSearchResults from './PeopleSearchResults'

type Props = {
    className?: string,
    autoFocus?: boolean,
    teams: List<Map<*, *>>,
    users: List<Map<*, *>>,
    onTeamClick: (team: Map<*, *>) => void,
    onUserClick: (user: Map<*, *>) => void,
}

export default function UncontrolledPeopleSearchInput({
    className,
    autoFocus,
    teams,
    users,
    onTeamClick,
    onUserClick,
}: Props) {
    const [filter, setFilter] = useState('')
    const [isOpen, setOpen] = useState(false)
    const toggle = () => setOpen(!isOpen)

    const filteredTeams = teams.filter((team) =>
        team.get('name').toLowerCase().includes(filter.toLowerCase())
    )

    const filteredUsers = users.filter((user) => {
        const agentLabel = user.get('name') || user.get('email')
        return agentLabel.toLowerCase().includes(filter.toLowerCase())
    })

    return (
        <Dropdown isOpen={isOpen} className={className} toggle={toggle}>
            <DropdownToggle
                tag="div"
                data-toggle="dropdown"
                aria-expanded={isOpen}
            >
                <PeopleSearchInput
                    value={filter}
                    onChange={setFilter}
                    autoFocus={autoFocus}
                    className={className}
                />
            </DropdownToggle>
            <DropdownMenu className={css.dropdown}>
                <PeopleSearchResults
                    handleTeams
                    handleUsers
                    teams={filteredTeams}
                    users={filteredUsers}
                    onTeamClick={onTeamClick}
                    onUserClick={onUserClick}
                />
            </DropdownMenu>
        </Dropdown>
    )
}
