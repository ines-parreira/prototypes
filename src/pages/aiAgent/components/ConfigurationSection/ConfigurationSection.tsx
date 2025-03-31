import { Badge } from '@gorgias/merchant-ui-kit'

import css from './ConfigurationSection.less'

type Props = {
    title?: string
    subtitle?: React.ReactNode
    isRequired?: boolean
    children: React.ReactNode
    isBeta?: boolean
    sectionRef?: React.RefObject<HTMLDivElement>
}

export const ConfigurationSection = ({
    title,
    subtitle,
    children,
    isRequired,
    isBeta = false,
    sectionRef,
}: Props) => {
    return (
        <section ref={sectionRef}>
            <div className={css.titleContainer}>
                {title && (
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
                )}
                {isBeta && (
                    <Badge type={'magenta'} className={css.betaBadge}>
                        BETA
                    </Badge>
                )}
            </div>
            {subtitle && <span className={css.subtitle}>{subtitle}</span>}
            <div className={css.content}>{children}</div>
        </section>
    )
}
