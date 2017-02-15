import React, {PropTypes} from 'react'
import classNames from 'classnames'
import {fromJS} from 'immutable'

import TicketAttachments from './TicketAttachments'
import TicketReplyAction from './TicketReplyAction'
import TicketReplyEditor from './TicketReplyEditor'

import {getActionTemplate} from '../../../../../utils'

export default class TicketReply extends React.Component {
    _handleFiles = (files) => {
        const newFiles = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const {name, size, type} = file
            newFiles.push({url: null, name, size, content_type: type, file})
        }

        this.props.actions.ticket.addAttachments(this.props.ticket, newFiles)
    }

    _renderAttachments = () => {
        const {ticket, actions} = this.props

        return (
            <div className="attachments-wrapper">
                <TicketAttachments
                    removable
                    attachments={ticket.getIn(['newMessage', 'attachments'], fromJS([]))}
                    deleteAttachment={actions.ticket.deleteAttachment}
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
        const {ticket, actions, autoFocus} = this.props
        const className = classNames('TicketReply', {
            internal: ticket.get('newMessage') && !ticket.getIn(['newMessage', 'public']),
        })

        return (
            <div className={className}>
                <TicketReplyEditor
                    actions={actions}
                    ticket={ticket}
                    handleFiles={this._handleFiles}
                    ref="editor"
                    autoFocus={autoFocus}
                />
                {this._renderAttachments()}
                {this._renderActions()}
            </div>
        )
    }
}

TicketReply.propTypes = {
    actions: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    appliedMacro: PropTypes.object,
    autoFocus: PropTypes.bool,
}
