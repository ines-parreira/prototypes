import classNames from 'classnames'

import { Icon, IconSize } from '@gorgias/axiom'

import { Accordion } from 'components/Accordion/Accordion'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import css from './KnowledgeEditorSidePanelSection.less'

type Props = {
    header: {
        title: string | React.ReactNode
        subtitle?: string
        tooltip?: string
    }
    bottomLink?: {
        text: string
        url?: string
    }
    children: React.ReactNode
    sectionId: string
}

export const KnowledgeEditorSidePanelSection = ({
    header,
    bottomLink,
    children,
    sectionId,
}: Props) => {
    return (
        <Accordion.Item value={sectionId}>
            <div className={css.section}>
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
                                    <IconTooltip className={css.tooltip}>
                                        {header.tooltip}
                                    </IconTooltip>
                                </div>
                            ) : (
                                header.title
                            )}
                        </div>
                        {header.subtitle && (
                            <div className={css.subtitle}>
                                {header.subtitle}
                            </div>
                        )}
                    </div>
                    <Accordion.ItemIndicator>
                        <Icon name="arrow-chevron-down" />
                    </Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent className={css.content}>
                    {children}
                    {bottomLink && (
                        <div
                            className={classNames(
                                css.bottomLink,
                                bottomLink.url === undefined &&
                                    css.disabledBottomLink,
                            )}
                        >
                            {bottomLink.url ? (
                                <a
                                    href={bottomLink.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {bottomLink.text}{' '}
                                    <Icon
                                        name="external-link"
                                        size={IconSize.Sm}
                                    />
                                </a>
                            ) : (
                                <span>
                                    {bottomLink.text}{' '}
                                    <Icon
                                        name="external-link"
                                        size={IconSize.Sm}
                                    />
                                </span>
                            )}
                        </div>
                    )}
                </Accordion.ItemContent>
            </div>
        </Accordion.Item>
    )
}
