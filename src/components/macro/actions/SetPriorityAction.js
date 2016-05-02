import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import TicketPriority from './../../ticket/ticketview/ticketdetails/TicketPriority'

export default class SetPriorityAction extends React.Component {
    togglePriority() {
        this.props.updateActionArgs(
            this.props.index,
            Map({ priority: this.props.action.getIn(['arguments', 'priority']) === 'normal' ? 'high' : 'normal'})
        )
    }

    render() {
        const { action, deleteAction } = this.props
        return (
            <div className="priority">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(action.get('id'))}
                />
                <h4>SET PRIORITY</h4>
                <TicketPriority
                    priority={action.getIn(['arguments', 'priority'])}
                    togglePriority={() => this.togglePriority()}
                />
                <div className="ui divider"></div>
            </div>
        )
    }
}

SetPriorityAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
    deleteAction: PropTypes.func.isRequired
}
