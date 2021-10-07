import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classNames from 'classnames'
import {fromJS, List, Map} from 'immutable'

import {RootState} from '../../../../../state/types'
import {canReply} from '../../../../../business/ticket'
import {
    deleteActionOnApplied,
    updateActionArgsOnApplied,
} from '../../../../../state/ticket/actions'
import {deleteAttachment} from '../../../../../state/newMessage/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {getActionTemplate} from '../../../../../utils'
import RichField from '../../../../common/forms/RichField/RichField'

import TicketAttachments from './TicketAttachments'
import css from './TicketReply.less'
import TicketReplyAction from './TicketReplyAction'
import TicketReplyEditor from './TicketReplyEditor'

type Props = {
    appliedMacro?: Map<any, any>
    applyMacro: (macro: Map<any, any>) => void
    className?: string
    macros: List<any>
    richAreaRef: (ref: RichField | null) => void
    shouldDisplayQuickReply: boolean
    ticket: Map<any, any>
} & ConnectedProps<typeof connector>

export class TicketReplyContainer extends Component<Props> {
    renderAttachments = () => {
        const {newMessageAttachments, deleteAttachment} = this.props

        return (
            <TicketAttachments
                removable
                attachments={newMessageAttachments}
                deleteAttachment={deleteAttachment}
                className="p-2 d-flex flex-wrap"
            />
        )
    }

    renderActions = () => {
        const {
            ticket,
            appliedMacro,
            deleteActionOnApplied,
            updateActionArgsOnApplied,
        } = this.props

        const backendActions = appliedMacro
            ? ((appliedMacro.get('actions') as List<any>).filter(
                  (action: Map<any, any>) => {
                      const actionTemplate = getActionTemplate(
                          action.get('name')
                      )
                      return (
                          !!actionTemplate &&
                          actionTemplate.execution === 'back'
                      )
                  }
              ) as List<any>)
            : (fromJS([]) as List<any>)

        if (!appliedMacro || !backendActions) {
            return null
        }

        return (
            <div>
                {backendActions.map((action: Map<any, any>, key) => (
                    <TicketReplyAction
                        key={key}
                        index={(appliedMacro.get('actions') as List<
                            any
                        >).indexOf(action)}
                        action={action}
                        update={updateActionArgsOnApplied}
                        remove={deleteActionOnApplied}
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
            richAreaRef,
            className: passedClassName,
            newMessageType,
            newMessageAttachments,
            macros,
            applyMacro,
            shouldDisplayQuickReply,
        } = this.props

        const canReplyResult = canReply(
            newMessageType,
            newMessageAttachments.size,
            ticket.getIn(['reply_options', newMessageType, 'reason'])
        )

        const className = classNames(css.component, passedClassName, {
            [css.internal]: !isNewMessagePublic,
            'alert-warning': !!canReplyResult,
        })

        return (
            <div className={className}>
                {!!canReplyResult ? (
                    <div className={css.alert}>{canReplyResult.message}</div>
                ) : (
                    <TicketReplyEditor
                        ticket={ticket}
                        richAreaRef={richAreaRef}
                        macros={macros}
                        applyMacro={applyMacro}
                        shouldDisplayQuickReply={shouldDisplayQuickReply}
                    />
                )}
                {this.renderAttachments()}
                {this.renderActions()}
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        return {
            isNewMessagePublic: newMessageSelectors.isNewMessagePublic(state),
            newMessageAttachments: newMessageSelectors.getNewMessageAttachments(
                state
            ),
            newMessageType: newMessageSelectors.getNewMessageType(state),
        }
    },
    {
        deleteActionOnApplied,
        deleteAttachment,
        updateActionArgsOnApplied,
    }
)

export default connector(TicketReplyContainer)
