import { ReactNode } from 'react'

import css from './NoResults.less'

type Props = {
    children?: ReactNode
}

export function NoResults({ children }: Props) {
    return (
        <div className={`${css.centeringContainer} ${css.noResults}`}>
            <div title="Gorgias Logo" className={css.logo} />
            <p>{children}</p>
        </div>
    )
}
