import React from 'react'

import ReplyForm from 'pages/tickets/detail/components/ReplyForm'
import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'

type Props = {
    submit: (args: SubmitArgs) => any
}

export default function Editor({submit}: Props) {
    return <ReplyForm submit={submit} />
}
