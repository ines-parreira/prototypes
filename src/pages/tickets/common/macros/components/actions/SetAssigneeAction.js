// @flow

import React from 'react'
import {fromJS, Map} from 'immutable'

import TicketAssignee from '../../../../detail/components/TicketDetails/TicketAssignee'

import css from './SetAssigneeAction.less'

type Props = {
    action: Map<*, *>,
    teams?: Map<*, *>,
    agents?: Map<*, *>,
    index: number,
    handleTeams?: boolean,
    handleUsers?: boolean,
    updateActionArgs: (index: number, args: Map<*, *>) => void,
}

export default class SetAssigneeAction extends React.Component<Props> {
    static defaultProps = {
        teams: fromJS([]),
        agents: fromJS([]),
        handleTeams: false,
        handleUsers: false,
    }

    setUserAssignee(user: Object) {
        this.props.updateActionArgs(this.props.index, fromJS({assignee_user: user}))
    }

    setTeamAssignee(team: Object) {
        this.props.updateActionArgs(this.props.index, fromJS({assignee_team: team}))
    }

    render() {
        const {action, agents, teams, handleTeams, handleUsers} = this.props
        return (
            <TicketAssignee
                className={css.assignee}
                currentAssigneeUser={action.getIn(['arguments', 'assignee_user'])}
                currentAssigneeTeam={action.getIn(['arguments', 'assignee_team'])}
                handleTeams={handleTeams}
                handleUsers={handleUsers}
                users={agents}
                teams={teams}
                setUser={(user) => this.setUserAssignee(user)}
                setTeam={(team) => this.setTeamAssignee(team)}
                suffix="macro-modal"
            />
        )
    }
}
