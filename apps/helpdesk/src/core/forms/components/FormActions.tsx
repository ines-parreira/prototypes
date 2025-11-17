import type { PropsWithChildren } from 'react'

import css from './FormActions.less'

export default function FormActions({ children }: PropsWithChildren) {
    return <div className={css.actions}>{children}</div>
}
