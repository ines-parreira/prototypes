import classNames from 'classnames'

import { Accordion } from 'components/Accordion/Accordion'

import css from './KnowledgeEditorSidePanel.less'

type Props = {
    children: React.ReactNode
    initialExpandedSections: string[]
    className?: string
}

export const KnowledgeEditorSidePanel = ({
    children,
    initialExpandedSections,
    className,
}: Props) => {
    return (
        <div className={classNames(css.sidePanel, className)}>
            <Accordion.Root value={initialExpandedSections}>
                {children}
            </Accordion.Root>
        </div>
    )
}
