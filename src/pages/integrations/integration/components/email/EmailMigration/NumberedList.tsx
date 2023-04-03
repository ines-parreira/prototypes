import React, {ReactNode} from 'react'

import css from './NumberedList.less'

type Props = {
    items: ReactNode[]
}

export default function NumberedList({items}: Props): JSX.Element {
    return (
        <ol className={css.list}>
            {items.map((body, index) => (
                <li key={index}>
                    <div className={css.number}>{index + 1}</div>
                    <div>{body}</div>
                </li>
            ))}
        </ol>
    )
}
