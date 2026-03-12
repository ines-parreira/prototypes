import classNames from 'classnames'

import { Icon, IconSize, Tooltip, TooltipContent } from '@gorgias/axiom'

import { Accordion } from 'components/Accordion/Accordion'

import css from './KnowledgeEditorSidePanelSection.less'

type Props = {
    header: {
        title: string | React.ReactNode
        subtitle?: string
        subtitleAlign?: 'center' | 'left'
        tooltip?: React.ReactNode
    } | null
    bottomElement?: React.ReactNode
    children: React.ReactNode
    sectionId: string
}

export const KnowledgeEditorSidePanelSection = ({
    header,
    bottomElement,
    children,
    sectionId,
}: Props) => {
    const headerTooltipContent =
        typeof header?.tooltip === 'string' ? (
            <TooltipContent caption={header.tooltip} />
        ) : (
            <TooltipContent>{header?.tooltip}</TooltipContent>
        )

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
                        <div className={css.titleAndSubtitle}>
                            <div className={css.title}>
                                {header.tooltip ? (
                                    <div className={css.titleWithTooltip}>
                                        {header.title}
                                        <Tooltip
                                            trigger={
                                                <Icon
                                                    name="info"
                                                    size={IconSize.Xs}
                                                />
                                            }
                                        >
                                            {headerTooltipContent}
                                        </Tooltip>
                                    </div>
                                ) : (
                                    header.title
                                )}
                            </div>
                            {header.subtitle && (
                                <div
                                    className={classNames(
                                        css.subtitle,
                                        header.subtitleAlign === 'left' &&
                                            css.subtitleLeftAligned,
                                    )}
                                >
                                    {header.subtitle}
                                </div>
                            )}
                        </div>
                        <Accordion.ItemIndicator>
                            <Icon name="arrow-chevron-down" />
                        </Accordion.ItemIndicator>
                    </Accordion.ItemTrigger>
                )}
                <Accordion.ItemContent className={css.content}>
                    {children}
                    {bottomElement && (
                        <div className={css.bottomElement}>{bottomElement}</div>
                    )}
                </Accordion.ItemContent>
            </div>
        </Accordion.Item>
    )
}
