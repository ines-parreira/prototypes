import React, {useState} from 'react'
import {Dropdown, DropdownMenu, DropdownToggle} from 'reactstrap'
import {Map, List} from 'immutable'

import css from './UncontrolledPeopleSearchInput.less'

import PeopleSearchInput from './PeopleSearchInput'
import PeopleSearchResults from './PeopleSearchResults'

type Props = {
    className?: string
    autoFocus?: boolean
    teams: List<Map<any, any>>
    users: List<Map<any, any>>
    onTeamClick: (team: Map<any, any>) => void
    onUserClick: (user: Map<any, any>) => void
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
        (team!.get('name') as string)
            .toLowerCase()
            .includes(filter.toLowerCase())
    ) as List<Map<any, any>>

    const filteredUsers = users.filter((user) => {
        const agentLabel: string = user!.get('name') || user!.get('email')
        return agentLabel.toLowerCase().includes(filter.toLowerCase())
    }) as List<Map<any, any>>

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
