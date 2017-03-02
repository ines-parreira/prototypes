import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import TicketPriority from '../../../../detail/components/ticketdetails/TicketPriority'

export default class SetPriorityAction extends React.Component {
    componentDidMount() {
        this.props.updateActionArgs(this.props.index, fromJS({priority: 'normal'}))
    }

    _togglePriority = () => {
        const priority = this.props.action.getIn(['arguments', 'priority']) === 'normal' ? 'high' : 'normal'
        this.props.updateActionArgs(this.props.index, fromJS({priority}))
    }

    render() {
        const {index, action, deleteAction} = this.props

        const value = action.getIn(['arguments', 'priority'])

        if (!value) {
            return null
        }

        return (
            <div className="priority">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4 className="inline">SET PRIORITY</h4>
                <TicketPriority
                    priority={value}
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
