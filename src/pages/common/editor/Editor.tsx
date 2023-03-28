import React from 'react'

import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'

import useForm from './hooks/useForm'

type Props = {
    submit: (args: SubmitArgs) => any
}

export default function Editor({submit}: Props) {
    const {formRef, onSubmit, setTicketStatus} = useForm(submit)

    return (
        <ReplyForm
            formRef={formRef}
            onSubmit={onSubmit}
            setTicketStatus={setTicketStatus}
        />
    )
}
