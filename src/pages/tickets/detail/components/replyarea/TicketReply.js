import React, {PropTypes} from 'react'
import classNames from 'classnames'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import TicketAttachments from './TicketAttachments'
import TicketReplyAction from './TicketReplyAction'
import TicketReplyEditor from './TicketReplyEditor'

import * as newMessageActions from '../../../../../state/newMessage/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {getActionTemplate} from '../../../../../utils'

@connect((state) => {
    return {
        isNewMessagePublic: newMessageSelectors.isNewMessagePublic(state),
        newMessage: state.newMessage,
    }
}, {
    deleteAttachment: newMessageActions.deleteAttachment,
})
export default class TicketReply extends React.Component {
    static propTypes = {
        actions: PropTypes.object.isRequired,
        deleteAttachment: PropTypes.func.isRequired,
        className: PropTypes.string,
        ticket: PropTypes.object.isRequired,
        newMessage: PropTypes.object.isRequired,
        appliedMacro: PropTypes.object,
        isNewMessagePublic: PropTypes.bool.isRequired,
    }

    _renderAttachments = () => {
        const {newMessage} = this.props

        return (
            <div className="attachments-wrapper">
                <TicketAttachments
                    removable
                    attachments={newMessage.getIn(['newMessage', 'attachments'], fromJS([]))}
                    deleteAttachment={this.props.deleteAttachment}
                />
            </div>
        )
    }

    _renderActions = () => {
        const {ticket, appliedMacro, actions} = this.props

        const backendActions = appliedMacro ?
            appliedMacro.get('actions').filter(
                action => getActionTemplate(action.get('name')).execution === 'back'
            ) : []

        if (!backendActions) {
            return null
        }

        return (
            <div>
                {
                    backendActions.map((action, key) => (
                        <TicketReplyAction
                            key={key}
                            index={appliedMacro.get('actions').indexOf(action)}
                            action={action}
                            update={actions.ticket.updateActionArgsOnApplied}
                            remove={actions.ticket.deleteActionOnApplied}
                            ticketId={ticket.get('id')}
                        />
                    ))
                }
            </div>
        )
    }

    render() {
        const {ticket, isNewMessagePublic, actions} = this.props

        const className = classNames('TicketReply', this.props.className, {
            internal: !isNewMessagePublic,
        })

        return (
            <div className={className}>
                <TicketReplyEditor
                    actions={actions}
                    ticket={ticket}
                />
                {this._renderAttachments()}
                {this._renderActions()}
            </div>
        )
    }
}
