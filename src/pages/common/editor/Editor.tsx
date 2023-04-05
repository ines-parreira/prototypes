import cn from 'classnames'
import React from 'react'

import ReplyMessageChannel from 'pages/tickets/detail/components/ReplyArea/ReplyMessageChannel'
import TicketSubmitButtons from 'pages/tickets/detail/components/ReplyArea/TicketSubmitButtons'
import TicketReplyArea from 'pages/tickets/detail/components/ReplyArea/TicketReplyArea'
import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'

import useForm from './hooks/useForm'
import useMacros from './hooks/useMacros'
import css from './Editor.less'

type Props = {
    onBlur?: () => void
    onFocus?: () => void
    submit: (args: SubmitArgs) => any
}

export default function Editor({onBlur, onFocus, submit}: Props) {
    const {formRef, onSubmit, setTicketStatus} = useForm(submit)
    const {hasShown, isActive, onChangeActive} = useMacros()

    return (
        <div
            className={cn('d-print-none', css.container)}
            onBlur={onBlur}
            onFocus={onFocus}
        >
            <form ref={formRef} id="ticket-reply-editor" onSubmit={onSubmit}>
                <ReplyMessageChannel />
                <ReplyForm>
                    <TicketReplyArea
                        hasShownMacros={hasShown}
                        isMacrosActive={isActive}
                        onChangeMacrosActive={onChangeActive}
                    />
                    <TicketSubmitButtons setTicketStatus={setTicketStatus} />
                </ReplyForm>
            </form>
        </div>
    )
}
