import type { ReactNode } from 'react'
import React from 'react'

import css from './WhatsAppMigrationButtons.less'

type Props = {
    children: ReactNode
}

export default function WhatsAppMigrationButtons({
    children,
}: Props): JSX.Element {
    return <div className={css.container}>{children}</div>
}
