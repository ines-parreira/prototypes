import type { ReactNode } from 'react'

import { EmptyTicket } from 'ticket-page'

import css from './BlankState.less'

type Props = {
    message?: ReactNode
}

const BlankState = ({ message }: Props) => {
    return (
        <div className={css.wrapper}>
            {message ? (
                message
            ) : (
                <div className={css.message}>
                    <EmptyTicket />
                </div>
            )}
        </div>
    )
}

export default BlankState
