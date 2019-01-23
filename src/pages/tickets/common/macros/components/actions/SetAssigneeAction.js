import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import TicketAssignee from '../../../../detail/components/TicketDetails/TicketAssignee'

export default class SetAssigneeAction extends React.Component {
    setAssignee(assignee) {
        this.props.updateActionArgs(this.props.index, fromJS({assignee_user: assignee}))
    }

    render() {
        const {action, agents} = this.props
        return (
            <TicketAssignee
                currentAssignee={action.getIn(['arguments', 'assignee_user', 'name'])}
                agents={agents}
                setAgent={assignee => this.setAssignee(assignee)}
                suffix="macro-modal"
            />
        )
    }
}

SetAssigneeAction.propTypes = {
    action: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
}
