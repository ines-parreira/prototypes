import type { FormEvent } from 'react'
import { useCallback, useRef, useState } from 'react'

import { TicketStatus } from 'business/types/ticket'
import type { SubmitArgs } from 'pages/tickets/detail/TicketDetailContainer'

export default function useForm(submit: (args: SubmitArgs) => any) {
    const [ticketStatus, setTicketStatus] = useState<TicketStatus>(
        TicketStatus.Open,
    )
    const formRef = useRef<HTMLFormElement | null>(null)

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()

            const form = formRef.current
            if (!form) return

            // https://github.com/gorgias/gorgias/issues/4074
            if (e.target !== form) {
                return
            }

            if (form.checkValidity()) {
                submit({ status: ticketStatus })
            }

            setTicketStatus(TicketStatus.Open)
        },
        [ticketStatus, submit],
    )

    return {
        formRef,
        setTicketStatus,
        onSubmit: handleSubmit,
    }
}
