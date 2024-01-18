import React, {Component, ComponentProps} from 'react'
import {fromJS, Map} from 'immutable'
import {DropdownMenu} from 'reactstrap'

import TicketAssignee from 'pages/tickets/detail/components/TicketDetails/TicketAssignee/TicketAssignee'

type Props = {
    action: Map<string, any>
    index: number
    handleTeams?: boolean
    handleUsers?: boolean
    updateActionArgs: (index: number, args: Map<any, any>) => void
    dropdownContainer?: ComponentProps<typeof DropdownMenu>['container']
}

export default class SetAssigneeAction extends Component<Props> {
    static defaultProps: Pick<Props, 'handleTeams' | 'handleUsers'> = {
        handleTeams: false,
        handleUsers: false,
    }

    setUserAssignee(user: Maybe<Record<string, unknown>>) {
        this.props.updateActionArgs(
            this.props.index,
            fromJS({assignee_user: user})
        )
    }

    setTeamAssignee(team: Maybe<Record<string, unknown>>) {
        this.props.updateActionArgs(
            this.props.index,
            fromJS({assignee_team: team})
        )
    }

    render() {
        const {action, handleTeams, handleUsers, dropdownContainer} = this.props
        return (
            <TicketAssignee
                currentAssigneeUser={action.getIn([
                    'arguments',
                    'assignee_user',
                ])}
                currentAssigneeTeam={action.getIn([
                    'arguments',
                    'assignee_team',
                ])}
                handleTeams={handleTeams}
                handleUsers={handleUsers}
                setUser={(user) => this.setUserAssignee(user)}
                setTeam={(team) => this.setTeamAssignee(team)}
                dropdownContainer={dropdownContainer}
            />
        )
    }
}
