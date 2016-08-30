import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import TicketAssignee from '../../../../detail/components/ticketdetails/TicketAssignee'

export default class AssignUserAction extends React.Component {
    setAssignee(assignee) {
        this.props.updateActionArgs(
            this.props.index,
            Map({assignee_user: Map(assignee)})
        )
    }

    render() {
        const {index, action, agents, deleteAction} = this.props
        return (
            <div className="assignee">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4>SET ASSIGNEE</h4>
                <TicketAssignee
                    currentAssignee={action.getIn(['arguments', 'assignee_user', 'name'])}
                    agents={agents}
                    setAgent={assignee => this.setAssignee(assignee)}
                    suffix="macro-modal"
                />
                <div className="ui divider"></div>
            </div>
        )
    }
}

AssignUserAction.propTypes = {
    action: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
    deleteAction: PropTypes.func.isRequired
}
