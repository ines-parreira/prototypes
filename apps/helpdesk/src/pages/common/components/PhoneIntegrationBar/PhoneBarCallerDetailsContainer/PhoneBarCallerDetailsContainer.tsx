import type { ReactNode } from 'react'

import css from './PhoneBarCallerDetailsContainer.less'

type Props = {
    children: ReactNode
}

export function PhoneBarCallerDetailsContainer({
    children,
}: Props): JSX.Element {
    return <div className={css.callerDetailsContainer}>{children}</div>
}
