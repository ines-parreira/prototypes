// @flow
import classNames from 'classnames'
import type {List, Map} from 'immutable'
import React from 'react'
import {connect} from 'react-redux'

import type {TicketMessageSourceType} from '../../../../../business/types/ticket.ts'
import * as newMessageActions from '../../../../../state/newMessage/actions.ts'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors.ts'
import {getActionTemplate} from '../../../../../utils.ts'

import TicketAttachments from './TicketAttachments'
import css from './TicketReply.less'
import TicketReplyAction from './TicketReplyAction'
import TicketReplyEditor from './TicketReplyEditor'

type Props = {
    actions: Object,
    deleteAttachment?: (number) => void,
    className?: string,
    ticket: Map<*, *>,
    newMessageType: TicketMessageSourceType,
    newMessageAttachments: List<*>,
    appliedMacro: ?Map<*, *>,
    isNewMessagePublic: boolean,
    richAreaRef: () => void,
}

@connect(
    (state) => {
        return {
            isNewMessagePublic: newMessageSelectors.isNewMessagePublic(state),
            newMessageType: newMessageSelectors.getNewMessageType(state),
            newMessageAttachments: newMessageSelectors.getNewMessageAttachments(
                state
            ),
        }
    },
    {
        deleteAttachment: newMessageActions.deleteAttachment,
    }
)
// $FlowFixMe
export default class TicketReply extends React.Component<Props> {
    _renderAttachments = () => {
        const {newMessageAttachments, deleteAttachment} = this.props

        return (
            <TicketAttachments
                removable
                attachments={newMessageAttachments}
                deleteAttachment={deleteAttachment}
                className="p-2"
            />
        )
    }

    _renderActions = () => {
        const {ticket, appliedMacro, actions} = this.props

        const backendActions = appliedMacro
            ? appliedMacro.get('actions').filter((action) => {
                  const actionTemplate = getActionTemplate(action.get('name'))
                  return actionTemplate && actionTemplate.execution === 'back'
              })
            : []

        if (!appliedMacro || !backendActions) {
            return null
        }

        return (
            <div>
                {backendActions.map((action, key) => (
                    <TicketReplyAction
                        key={key}
                        index={appliedMacro.get('actions').indexOf(action)}
                        action={action}
                        update={actions.ticket.updateActionArgsOnApplied}
                        remove={actions.ticket.deleteActionOnApplied}
                        ticketId={ticket.get('id')}
                    />
                ))}
            </div>
        )
    }

    render() {
        const {
            ticket,
            isNewMessagePublic,
            actions,
            richAreaRef,
            className: passedClassName,
        } = this.props

        const className = classNames(css.component, passedClassName, {
            [css.internal]: !isNewMessagePublic,
        })

        return (
            <div className={className}>
                <TicketReplyEditor
                    actions={actions}
                    ticket={ticket}
                    richAreaRef={richAreaRef}
                />
                {this._renderAttachments()}
                {this._renderActions()}
            </div>
        )
    }
}
