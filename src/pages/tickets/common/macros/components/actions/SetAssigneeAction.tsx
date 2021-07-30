import React, {Component} from 'react'
import {fromJS, Map} from 'immutable'

import TicketAssignee from '../../../../detail/components/TicketDetails/TicketAssignee/TicketAssignee'

import css from './SetAssigneeAction.less'

type Props = {
    action: Map<any, any>
    index: number
    handleTeams?: boolean
    handleUsers?: boolean
    updateActionArgs: (index: number, args: Map<any, any>) => void
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
        const {action, handleTeams, handleUsers} = this.props
        return (
            <TicketAssignee
                className={css.assignee}
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
            />
        )
    }
}
