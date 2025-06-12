import type { ReactNode } from 'react'

import css from './SourceDetails.less'

type Props = { label: string; children?: ReactNode }

export function SourceDetailsFrom({ label, children }: Props) {
    return (
        <span className={css.from}>
            <span className={css.fromLabel}>{label}</span>{' '}
            <span className={css.fromValue}>{children}</span>
        </span>
    )
}
