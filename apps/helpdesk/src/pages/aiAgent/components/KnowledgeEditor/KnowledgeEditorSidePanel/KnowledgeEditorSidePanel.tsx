import { Accordion } from 'components/Accordion/Accordion'

import css from './KnowledgeEditorSidePanel.less'

type Props = {
    children: React.ReactNode
    initialExpandedSections: string[]
}

export const KnowledgeEditorSidePanel = ({
    children,
    initialExpandedSections,
}: Props) => {
    return (
        <div className={css.sidePanel}>
            <Accordion.Root value={initialExpandedSections}>
                {children}
            </Accordion.Root>
        </div>
    )
}
