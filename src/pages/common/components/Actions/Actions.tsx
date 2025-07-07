import { PropsWithChildren } from 'react'

import css from './Actions.less'

export default function Actions({ children }: PropsWithChildren) {
    return <div className={css.actions}>{children}</div>
}
