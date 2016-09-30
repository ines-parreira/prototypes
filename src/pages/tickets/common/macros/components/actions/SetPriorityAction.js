import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import TicketPriority from '../../../../detail/components/ticketdetails/TicketPriority'

export default class SetPriorityAction extends React.Component {
    _togglePriority = () => {
        this.props.updateActionArgs(
            this.props.index,
            Map({priority: this.props.action.getIn(['arguments', 'priority']) === 'normal' ? 'high' : 'normal'})
        )
    }

    render() {
        const {index, action, deleteAction} = this.props
        return (
            <div className="priority">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4 className="inline">SET PRIORITY</h4>
                <TicketPriority
                    priority={action.getIn(['arguments', 'priority'])}
                    togglePriority={this._togglePriority}
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
