import classNames from 'classnames'

import { Icon, IconSize, Tooltip, TooltipContent } from '@gorgias/axiom'

import { Accordion } from 'components/Accordion/Accordion'

import css from './KnowledgeEditorSidePanelSection.less'

type Props = {
    header: {
        title: string | React.ReactNode
        subtitle?: string | React.ReactNode
        subtitleAlign?: 'center' | 'left'
        subtitleClassname?: string
        tooltip?: React.ReactNode
    } | null
    bottomElement?: React.ReactNode
    children: React.ReactNode
    sectionId: string
    alwaysExpanded?: boolean
}

export const KnowledgeEditorSidePanelSection = ({
    header,
    bottomElement,
    children,
    sectionId,
    alwaysExpanded = false,
}: Props) => {
    const headerTooltipContent =
        typeof header?.tooltip === 'string' ? (
            <TooltipContent caption={header.tooltip} />
        ) : (
            <TooltipContent>{header?.tooltip}</TooltipContent>
        )

    const headerContent = header && (
        <div className={css.titleAndSubtitle}>
            <div className={css.title}>
                {header.tooltip ? (
                    <div className={css.titleWithTooltip}>
                        {header.title}
                        <Tooltip
                            trigger={<Icon name="info" size={IconSize.Xs} />}
                        >
                            {headerTooltipContent}
                        </Tooltip>
                    </div>
                ) : (
                    header.title
                )}
            </div>
            {header.subtitle &&
                (typeof header.subtitle === 'string' ? (
                    <div
                        className={classNames(
                            css.subtitle,
                            header.subtitleAlign === 'left' &&
                                css.subtitleLeftAligned,
                            header.subtitleClassname,
                        )}
                    >
                        {header.subtitle}
                    </div>
                ) : (
                    header.subtitle
                ))}
        </div>
    )

    const bottomContent = bottomElement && (
        <div className={css.bottomElement}>{bottomElement}</div>
    )

    if (alwaysExpanded) {
        return (
            <div className={css.section}>
                {header && (
                    <div
                        className={classNames(
                            css.header,
                            header.subtitle && css.headerWithSubtitle,
                        )}
                    >
                        {headerContent}
                    </div>
                )}
                <div className={css.content}>
                    {children}
                    {bottomContent}
                </div>
            </div>
        )
    }

    return (
        <Accordion.Item value={sectionId}>
            <div className={css.section}>
                {header && (
                    <Accordion.ItemTrigger
                        className={classNames(
                            css.header,
                            header.subtitle && css.headerWithSubtitle,
                        )}
                    >
                        {headerContent}
                        <Accordion.ItemIndicator>
                            <Icon name="arrow-chevron-down" />
                        </Accordion.ItemIndicator>
                    </Accordion.ItemTrigger>
                )}
                <Accordion.ItemContent className={css.content}>
                    {children}
                    {bottomContent}
                </Accordion.ItemContent>
            </div>
        </Accordion.Item>
    )
}
