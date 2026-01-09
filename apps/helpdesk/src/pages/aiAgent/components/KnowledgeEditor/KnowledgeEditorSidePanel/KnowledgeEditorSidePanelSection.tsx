import classNames from 'classnames'

import { Icon } from '@gorgias/axiom'

import { Accordion } from 'components/Accordion/Accordion'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import css from './KnowledgeEditorSidePanelSection.less'

type Props = {
    header: {
        title: string | React.ReactNode
        subtitle?: string
        tooltip?: string
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
