import React, {PropTypes} from 'react'
import {Map} from 'immutable'
import TicketStatus from '../../../../detail/components/ticketdetails/TicketStatus'

export default class SetStatusAction extends React.Component {
    setStatus(status) {
        this.props.updateActionArgs(
            this.props.index,
            Map({ status })
        )
    }

    render() {
        const { action, deleteAction } = this.props
        return (
            <div className="status">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(action.get('id'))}
                />
                <h4>SET STATUS</h4>
                <TicketStatus
                    currentStatus={action.getIn(['arguments', 'status'])}
                    setStatus={status => this.setStatus(status)}
                    suffix="macro-modal"
                    position="bottom left"
                />
                <div className="ui divider"></div>
            </div>
        )
    }
}

SetStatusAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
    deleteAction: PropTypes.func.isRequired
}
