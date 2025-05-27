import { ReactNode, useState } from 'react'

import _sample from 'lodash/sample'

import useEffectOnce from 'hooks/useEffectOnce'
import { EmptyTicket } from 'ticket-page'

import css from './BlankState.less'

type Props = {
    message?: ReactNode
}

const messages = [
    'Great job!',
    'Great job, you crushed it!',
    "Great job, let's celebrate!",
]

const BlankState = ({ message }: Props) => {
    const [title, setTitle] = useState<string>()

    useEffectOnce(() => {
        setTitle(_sample(messages))
    })

    return (
        <div className={css.wrapper}>
            {message ? (
                message
            ) : (
                <div className={css.message}>
                    <EmptyTicket title={title} />
                    <div className={css.text}>
                        You’ve just helped all your customers. Enjoy your day
                        now!
                    </div>
                </div>
            )}
        </div>
    )
}

export default BlankState
