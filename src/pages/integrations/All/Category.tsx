import React, {ReactNode} from 'react'

import css from './Category.less'

type Props = {
    title: ReactNode
    subtitle?: string
    children?: ReactNode
}

export default function Category({title, subtitle, children}: Props) {
    return (
        <section className={css.section}>
            <header className={css.header}>
                <h2 className={css.title}>{title}</h2>
                {subtitle && <p className={css.subtitle}>{subtitle}</p>}
            </header>
            <ul className={css.cardWrapper}>{children}</ul>
        </section>
    )
}
