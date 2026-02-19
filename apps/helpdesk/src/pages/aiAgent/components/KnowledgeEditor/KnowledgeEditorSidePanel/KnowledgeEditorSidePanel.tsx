import classNames from 'classnames'

import { Accordion } from 'components/Accordion/Accordion'

import css from './KnowledgeEditorSidePanel.less'

type Props = {
    children: React.ReactNode
    initialExpandedSections: string[]
    className?: string
    footer?: React.ReactNode
}

export const KnowledgeEditorSidePanel = ({
    children,
    initialExpandedSections,
    className,
    footer,
}: Props) => {
    return (
        <div className={classNames(css.sidePanel, className)}>
            <Accordion.Root value={initialExpandedSections}>
                {children}
            </Accordion.Root>
            {footer}
        </div>
    )
}
