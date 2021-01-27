import React, {useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {EditorState} from 'draft-js'

import {
    getNewMessageChannel,
    getNewMessageSignature,
    isNewMessagePublic,
    isNewMessageEmailExtraAdded,
    isForward,
} from '../../../../state/newMessage/selectors'
import {addEmailExtra} from '../../../../state/newMessage/actions'
import Ellipsis from '../../components/Ellipsis'
import {RootState} from '../../../../state/types'
import {getBody, getTicket} from '../../../../state/ticket/selectors'
import {
    getReplyThreadMessages,
    isSignatureTextAdded,
} from '../../../../state/newMessage/emailExtraUtils'
import {convertFromHTML} from '../../../../utils/editor'
import {TicketChannel} from '../../../../business/types/ticket'

type OwnProps = {
    editorState: EditorState
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const EmailExtraButtonContainer = ({
    editorState,
    signature,
    addEmailExtra,
    ticketMessages,
    isNewMessageEmailExtraAdded,
    newMessageChannel,
    isNewMessagePublic,
    isNewMessageForward,
    ticket,
}: Props) => {
    const replyThreadMessages = useMemo(() => {
        return ticketMessages.size
            ? getReplyThreadMessages(ticketMessages.toJS())
            : []
    }, [ticketMessages])

    const emailExtraAvailable = useMemo<boolean>(() => {
        return !!(
            signature.get('text') ||
            convertFromHTML(signature.get('html', '')).hasText() ||
            replyThreadMessages.length
        )
    }, [signature, replyThreadMessages])

    const signatureInTheContent = useMemo<boolean>(() => {
        const contentState = editorState.getCurrentContent()
        return contentState && isSignatureTextAdded(contentState, signature)
    }, [editorState, signature])

    if (
        !isNewMessagePublic ||
        newMessageChannel !== TicketChannel.Email ||
        !emailExtraAvailable ||
        (signatureInTheContent && !replyThreadMessages.length) ||
        isNewMessageEmailExtraAdded
    ) {
        return null
    }

    return (
        <Ellipsis
            title="Show trimmed content"
            onClick={() => {
                addEmailExtra({
                    contentState: editorState.getCurrentContent(),
                    emailExtraArgs: {
                        signature,
                        replyThreadMessages,
                        isForwarded: isNewMessageForward,
                        ticket: ticket.toJS(),
                    },
                })
            }}
        />
    )
}

const connector = connect(
    (state: RootState) => {
        return {
            signature: getNewMessageSignature(state),
            ticket: getTicket(state),
            ticketMessages: getBody(state),
            isNewMessageEmailExtraAdded: isNewMessageEmailExtraAdded(state),
            newMessageChannel: getNewMessageChannel(state),
            isNewMessagePublic: isNewMessagePublic(state),
            isNewMessageForward: isForward(state),
        }
    },
    {
        addEmailExtra,
    }
)

export default connector(EmailExtraButtonContainer)
