import React from 'react'
import css from './ConfigurationSection.less'

type Props = {
    title: string
    subtitle?: string
    isRequired?: boolean
    children: React.ReactNode
}

export const ConfigurationSection = ({
    title,
    subtitle,
    children,
    isRequired,
}: Props) => {
    return (
        <section>
            <h2
                className={css.title}
                data-candu-id="ai-agent-configuration-knowledge"
            >
                {title}{' '}
                {isRequired && (
                    <abbr
                        className={css.abbr}
                        title="required"
                        aria-label="required"
                    >
                        *
                    </abbr>
                )}
            </h2>
            {subtitle && <span className={css.subtitle}>{subtitle}</span>}
            <div className={css.content}>{children}</div>
        </section>
    )
}
