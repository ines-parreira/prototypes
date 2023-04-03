import React from 'react'

import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'

import useForm from './hooks/useForm'

type Props = {
    onBlur?: () => void
    onFocus?: () => void
    submit: (args: SubmitArgs) => any
}

export default function Editor({onBlur, onFocus, submit}: Props) {
    const {formRef, onSubmit, setTicketStatus} = useForm(submit)

    return (
        <ReplyForm
            formRef={formRef}
            onBlur={onBlur}
            onFocus={onFocus}
            onSubmit={onSubmit}
            setTicketStatus={setTicketStatus}
        />
    )
}
