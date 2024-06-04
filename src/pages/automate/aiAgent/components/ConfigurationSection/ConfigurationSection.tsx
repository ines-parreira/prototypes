import React from 'react'
import css from './ConfigurationSection.less'

type Props = {
    title: string
    subtitle?: string
    children: React.ReactNode
}

export const ConfigurationSection = ({title, subtitle, children}: Props) => {
    return (
        <section>
            <h2 className={css.title}>{title}</h2>
            {subtitle && <span className={css.subtitle}>{subtitle}</span>}
            <div className={css.content}>{children}</div>
        </section>
    )
}
