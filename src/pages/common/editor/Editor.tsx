import cn from 'classnames'
import React from 'react'

import ReplyMessageChannel from 'pages/tickets/detail/components/ReplyArea/ReplyMessageChannel'
import TicketSubmitButtons from 'pages/tickets/detail/components/ReplyArea/TicketSubmitButtons'
import TicketReplyArea from 'pages/tickets/detail/components/ReplyArea/TicketReplyArea'
import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'

import useForm from './hooks/useForm'
import css from './Editor.less'

type Props = {
    onBlur?: () => void
    onFocus?: () => void
    submit: (args: SubmitArgs) => any
}

export default function Editor({onBlur, onFocus, submit}: Props) {
    const {formRef, onSubmit, setTicketStatus} = useForm(submit)

    return (
        <div
            className={cn('d-print-none', css.container)}
            onBlur={onBlur}
            onFocus={onFocus}
        >
            <form ref={formRef} id="ticket-reply-editor" onSubmit={onSubmit}>
                <ReplyMessageChannel />
                <ReplyForm>
                    <TicketReplyArea />
                    <TicketSubmitButtons setTicketStatus={setTicketStatus} />
                </ReplyForm>
            </form>
        </div>
    )
}
