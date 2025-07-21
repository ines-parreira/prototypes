import { PropsWithChildren } from 'react'

import css from './FormActionsGroup.less'

export default function FormActionsGroup({ children }: PropsWithChildren) {
    return <div className={css.actionsGroup}>{children}</div>
}
