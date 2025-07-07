import { PropsWithChildren } from 'react'

import css from './ActionsGroup.less'

export default function ActionsGroup({ children }: PropsWithChildren) {
    return <div className={css.actionsGroup}>{children}</div>
}
